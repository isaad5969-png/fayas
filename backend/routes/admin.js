const express = require('express');
const db = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, requireAdmin);

/* ── GET /api/admin/stats ── */
router.get('/stats', (_req, res) => {
  /* Core counters — single query each, all using indexed columns */
  const totalEvents   = db.prepare("SELECT COUNT(*) as c FROM events WHERE status='published'").get().c;
  const totalUsers    = db.prepare("SELECT COUNT(*) as c FROM users WHERE role='user'").get().c;
  const totalTickets  = db.prepare("SELECT COUNT(*) as c FROM tickets").get().c;
  const totalRevenue  = db.prepare("SELECT COALESCE(SUM(total_price),0) as t FROM tickets WHERE status='confirmed'").get().t;
  const ticketsSold   = db.prepare("SELECT COALESCE(SUM(quantity),0) as t FROM tickets").get().t;

  /* Breakdowns */
  const eventsByType  = db.prepare(`
    SELECT type, COUNT(*) as count FROM events WHERE status='published'
    GROUP BY type ORDER BY count DESC
  `).all();

  const eventsByCity  = db.prepare(`
    SELECT city, COUNT(*) as count FROM events WHERE status='published'
    GROUP BY city ORDER BY count DESC LIMIT 8
  `).all();

  const revenueByMonth = db.prepare(`
    SELECT strftime('%Y-%m', purchased_at) as month,
           ROUND(SUM(total_price),0) as revenue,
           COUNT(*) as ticket_count
    FROM tickets WHERE status='confirmed'
    GROUP BY month ORDER BY month DESC LIMIT 6
  `).all();

  /* Recent tickets */
  const recentTickets = db.prepare(`
    SELECT t.id, t.ticket_type, t.quantity, t.total_price, t.purchased_at,
           e.title as event_title, e.city,
           usr.name as user_name, usr.email as user_email
    FROM tickets t
    JOIN events e   ON t.event_id = e.id
    JOIN users  usr ON t.user_id  = usr.id
    ORDER BY t.purchased_at DESC
    LIMIT 10
  `).all();

  /* Top events by fill rate */
  const topEvents = db.prepare(`
    SELECT id, title, city, type, tickets_sold, capacity,
           price_standard,
           ROUND(CAST(tickets_sold AS REAL) / capacity * 100, 1) as fill_rate
    FROM events WHERE status='published' AND capacity > 0
    ORDER BY fill_rate DESC, tickets_sold DESC
    LIMIT 6
  `).all();

  res.json({
    totalEvents, totalUsers, totalTickets, totalRevenue, ticketsSold,
    eventsByType, eventsByCity, revenueByMonth,
    recentTickets, topEvents,
  });
});

/* ── GET /api/admin/users ── */
router.get('/users', (_req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.phone, u.loyalty_points, u.created_at,
           univ.name as university_name,
           COUNT(t.id) as ticket_count,
           COALESCE(SUM(t.total_price), 0) as total_spent
    FROM users u
    LEFT JOIN universities univ ON u.university_id = univ.id
    LEFT JOIN tickets       t   ON t.user_id       = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `).all();
  res.json(users);
});

/* ── PUT /api/admin/users/:id/role ── */
router.put('/users/:id/role', (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Rôle invalide (user | admin)' });
  }
  const target = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Utilisateur non trouvé' });

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run([role, req.params.id]);
  res.json({ message: 'Rôle mis à jour', role });
});

/* ── GET /api/admin/tickets ── */
router.get('/tickets', (_req, res) => {
  const tickets = db.prepare(`
    SELECT t.id, t.ticket_type, t.quantity, t.unit_price, t.total_price,
           t.status, t.purchased_at,
           e.title as event_title, e.date, e.city,
           u.name as user_name, u.email as user_email
    FROM tickets t
    JOIN events e ON t.event_id = e.id
    JOIN users  u ON t.user_id  = u.id
    ORDER BY t.purchased_at DESC
    LIMIT 200
  `).all();
  res.json(tickets);
});

module.exports = router;
