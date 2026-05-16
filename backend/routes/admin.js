const express = require('express');
const db = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
router.use(authenticate, requireAdmin);

/* ── GET /admin/stats ── */
router.get('/stats', asyncHandler(async (_req, res) => {
  const [
    totalEvents,
    totalUsers,
    totalTickets,
    totalRevenue,
    ticketsSold,
    eventsByType,
    eventsByCity,
    revenueByMonth,
    recentTickets,
    topEvents,
  ] = await Promise.all([
    db.one("SELECT COUNT(*)::int AS c FROM events WHERE status = 'published'"),
    db.one("SELECT COUNT(*)::int AS c FROM users  WHERE role = 'user'"),
    db.one('SELECT COUNT(*)::int AS c FROM tickets'),
    db.one("SELECT COALESCE(SUM(total_price), 0)::float AS t FROM tickets WHERE status = 'confirmed'"),
    db.one("SELECT COALESCE(SUM(quantity),    0)::int   AS t FROM tickets WHERE status = 'confirmed'"),
    db.many(`
      SELECT type, COUNT(*)::int AS count
      FROM events WHERE status = 'published'
      GROUP BY type ORDER BY count DESC
    `),
    db.many(`
      SELECT city, COUNT(*)::int AS count
      FROM events WHERE status = 'published'
      GROUP BY city ORDER BY count DESC LIMIT 8
    `),
    db.many(`
      SELECT TO_CHAR(purchased_at, 'YYYY-MM') AS month,
             ROUND(SUM(total_price), 0)::float AS revenue,
             COUNT(*)::int AS ticket_count
      FROM tickets WHERE status = 'confirmed'
      GROUP BY month ORDER BY month DESC LIMIT 12
    `),
    db.many(`
      SELECT t.id, t.ticket_type, t.quantity, t.total_price, t.purchased_at,
             e.title AS event_title, e.city,
             u.name  AS user_name,  u.email AS user_email
      FROM tickets t
      JOIN events e ON t.event_id = e.id
      JOIN users  u ON t.user_id  = u.id
      ORDER BY t.purchased_at DESC LIMIT 10
    `),
    db.many(`
      SELECT id, title, city, type, tickets_sold, capacity, price_standard,
             ROUND((tickets_sold::numeric / NULLIF(capacity, 0)) * 100, 1)::float AS fill_rate
      FROM events
      WHERE status = 'published' AND capacity > 0
      ORDER BY fill_rate DESC, tickets_sold DESC LIMIT 6
    `),
  ]);

  res.json({
    totalEvents:    totalEvents.c,
    totalUsers:     totalUsers.c,
    totalTickets:   totalTickets.c,
    totalRevenue:   totalRevenue.t,
    ticketsSold:    ticketsSold.t,
    eventsByType,
    eventsByCity,
    revenueByMonth,
    recentTickets,
    topEvents,
  });
}));

/* ── GET /admin/users ── */
router.get('/users', asyncHandler(async (_req, res) => {
  const users = await db.many(`
    SELECT u.id, u.name, u.email, u.role, u.phone, u.loyalty_points, u.created_at,
           univ.name             AS university_name,
           COUNT(t.id)::int      AS ticket_count,
           COALESCE(SUM(t.total_price), 0)::float AS total_spent
    FROM users u
    LEFT JOIN universities univ ON univ.id = u.university_id
    LEFT JOIN tickets t         ON t.user_id = u.id AND t.status = 'confirmed'
    GROUP BY u.id, univ.name
    ORDER BY u.created_at DESC
  `);
  res.json(users);
}));

/* ── PUT /admin/users/:id/role ── */
router.put('/users/:id/role', asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Rôle invalide (user | admin)' });
  }

  const target = await db.one('SELECT id FROM users WHERE id = $1', [req.params.id]);
  if (!target) return res.status(404).json({ error: 'Utilisateur non trouvé' });

  await db.run('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2', [role, req.params.id]);
  res.json({ message: 'Rôle mis à jour', role });
}));

/* ── GET /admin/tickets ── paginated */
router.get('/tickets', asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const offset = (page - 1) * limit;
  const status = req.query.status;

  const where  = status && ['confirmed', 'cancelled'].includes(status)
    ? `WHERE t.status = '${status}'`
    : '';

  const rows = await db.many(`
    SELECT t.id, t.ticket_type, t.quantity, t.unit_price, t.total_price,
           t.status, t.purchased_at,
           e.title AS event_title, e.date, e.city,
           u.name  AS user_name,   u.email AS user_email,
           COUNT(*) OVER() AS total_count
    FROM tickets t
    JOIN events e ON t.event_id = e.id
    JOIN users  u ON t.user_id  = u.id
    ${where}
    ORDER BY t.purchased_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
  const data  = rows.map(({ total_count, ...r }) => r);

  res.json({ data, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
}));

/* ── PUT /admin/tickets/:id/cancel ── force-cancel any ticket */
router.put('/tickets/:id/cancel', asyncHandler(async (req, res) => {
  const result = await db.transaction(async (tx) => {
    const ticket = await tx.one(`
      SELECT t.id, t.user_id, t.event_id, t.ticket_type, t.quantity, t.total_price, t.status
      FROM tickets t WHERE t.id = $1
    `, [req.params.id]);

    if (!ticket) {
      const err = new Error('Billet non trouvé');
      err.status = 404;
      throw err;
    }
    if (ticket.status === 'cancelled') {
      const err = new Error('Billet déjà annulé');
      err.status = 400;
      throw err;
    }

    await tx.run('UPDATE tickets SET status = $1 WHERE id = $2', ['cancelled', ticket.id]);

    await tx.run(`
      UPDATE events
      SET tickets_sold = GREATEST(0, tickets_sold - $1), updated_at = NOW()
      WHERE id = $2
    `, [ticket.quantity, ticket.event_id]);

    const pts = ticket.ticket_type === 'vip'
      ? Math.round(Number(ticket.total_price) * 1.5)
      : Math.round(Number(ticket.total_price));

    await tx.run(
      'UPDATE users SET loyalty_points = GREATEST(0, loyalty_points - $1), updated_at = NOW() WHERE id = $2',
      [pts, ticket.user_id],
    );

    return { points_deducted: pts };
  });

  res.json({ message: 'Billet annulé par l\'admin', points_deducted: result.points_deducted });
}));

module.exports = router;
