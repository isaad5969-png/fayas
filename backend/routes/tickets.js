const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { rateLimit } = require('../middleware/rateLimit');

const router = express.Router();

const purchaseLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  message: "Trop d'achats en cours, patientez un instant.",
});

/* ── POST /tickets/purchase ── */
router.post('/purchase', authenticate, purchaseLimiter, asyncHandler(async (req, res) => {
  const { event_id, ticket_type } = req.body;
  const quantity = parseInt(req.body.quantity, 10);

  if (
    !event_id ||
    !['standard', 'vip'].includes(ticket_type) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 20
  ) {
    return res.status(400).json({ error: 'Données de réservation invalides' });
  }

  const result = await db.transaction(async (tx) => {
    const event = await tx.one(`
      SELECT id, price_standard, price_vip, capacity, tickets_sold
      FROM events
      WHERE id = $1 AND status = 'published'
      FOR UPDATE
    `, [event_id]);

    if (!event) {
      const err = new Error('Événement non trouvé');
      err.status = 404;
      throw err;
    }

    const unitPrice = Number(ticket_type === 'vip' ? event.price_vip : event.price_standard);
    if (!unitPrice || unitPrice <= 0) {
      const err = new Error('Type de billet non disponible');
      err.status = 400;
      throw err;
    }

    const available = event.capacity - event.tickets_sold;
    if (quantity > available) {
      const err = new Error(`Seulement ${available} place(s) disponible(s)`);
      err.status = 400;
      throw err;
    }

    const update = await tx.run(`
      UPDATE events
      SET tickets_sold = tickets_sold + $1, updated_at = NOW()
      WHERE id = $2
        AND status = 'published'
        AND tickets_sold + $3 <= capacity
    `, [quantity, event_id, quantity]);

    if (update.rowCount === 0) {
      const err = new Error('Places épuisées — réessayez');
      err.status = 409;
      throw err;
    }

    const totalPrice = unitPrice * quantity;
    const id = uuidv4();

    await tx.run(`
      INSERT INTO tickets (id, event_id, user_id, ticket_type, quantity, unit_price, total_price)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [id, event_id, req.user.id, ticket_type, quantity, unitPrice, totalPrice]);

    /* Loyalty points */
    const ticketCount = await tx.one(
      'SELECT COUNT(*)::int AS c FROM tickets WHERE user_id = $1 AND status = $2',
      [req.user.id, 'confirmed'],
    );
    const basePoints  = Math.round(totalPrice);
    const bonusVip    = ticket_type === 'vip' ? Math.round(totalPrice * 0.5) : 0;
    const bonusFirst  = ticketCount.c === 1 ? 100 : 0;
    const bonusStreak = ticketCount.c > 0 && ticketCount.c % 5 === 0 ? 150 : 0;
    const pointsEarned = basePoints + bonusVip + bonusFirst + bonusStreak;

    await tx.run(
      'UPDATE users SET loyalty_points = loyalty_points + $1, updated_at = NOW() WHERE id = $2',
      [pointsEarned, req.user.id],
    );

    return { id, pointsEarned, bonusFirst, bonusStreak };
  });

  const ticket = await db.one(`
    SELECT t.*,
           e.title AS event_title, e.date, e.time, e.venue, e.city,
           e.type AS event_type, e.dress_code
    FROM tickets t
    JOIN events e ON t.event_id = e.id
    WHERE t.id = $1
  `, [result.id]);

  res.status(201).json({
    ...ticket,
    points_earned: result.pointsEarned,
    bonus_first:   result.bonusFirst,
    bonus_streak:  result.bonusStreak,
  });
}));

/* ── GET /tickets/my ── paginated */
router.get('/my', authenticate, asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit  = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;

  const rows = await db.many(`
    SELECT t.*,
           e.title AS event_title, e.date, e.time, e.venue, e.city,
           e.type  AS event_type, e.dress_code,
           u.name  AS university_name, u.color AS university_color,
           COUNT(*) OVER() AS total_count
    FROM tickets t
    JOIN events e ON t.event_id = e.id
    LEFT JOIN universities u ON e.university_id = u.id
    WHERE t.user_id = $1
    ORDER BY t.purchased_at DESC
    LIMIT $2 OFFSET $3
  `, [req.user.id, limit, offset]);

  const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
  const data  = rows.map(({ total_count, ...r }) => r);

  res.json({ data, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
}));

/* ── GET /tickets/:id ── */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const ticket = await db.one(`
    SELECT t.*,
           e.title AS event_title, e.date, e.time, e.venue, e.city,
           e.type  AS event_type, e.dress_code,
           u.name  AS university_name
    FROM tickets t
    JOIN events e ON t.event_id = e.id
    LEFT JOIN universities u ON e.university_id = u.id
    WHERE t.id = $1 AND t.user_id = $2
  `, [req.params.id, req.user.id]);

  if (!ticket) return res.status(404).json({ error: 'Billet non trouvé' });
  res.json(ticket);
}));

/* ── DELETE /tickets/:id ── cancel own ticket (≥24h before event) */
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const result = await db.transaction(async (tx) => {
    const ticket = await tx.one(`
      SELECT t.id, t.user_id, t.event_id, t.ticket_type, t.quantity,
             t.total_price, t.status, t.unit_price,
             e.date, e.tickets_sold
      FROM tickets t
      JOIN events e ON t.event_id = e.id
      WHERE t.id = $1
    `, [req.params.id]);

    if (!ticket) {
      const err = new Error('Billet non trouvé');
      err.status = 404;
      throw err;
    }

    /* Only the owner (or admin) can cancel */
    if (ticket.user_id !== req.user.id && req.user.role !== 'admin') {
      const err = new Error('Non autorisé');
      err.status = 403;
      throw err;
    }

    if (ticket.status === 'cancelled') {
      const err = new Error('Billet déjà annulé');
      err.status = 400;
      throw err;
    }

    /* Block cancellation within 24h of event */
    const eventDate = new Date(ticket.date);
    const hoursUntil = (eventDate - Date.now()) / 3_600_000;
    if (hoursUntil < 24 && req.user.role !== 'admin') {
      const err = new Error('Annulation impossible moins de 24h avant l\'événement');
      err.status = 400;
      throw err;
    }

    await tx.run('UPDATE tickets SET status = $1 WHERE id = $2', ['cancelled', ticket.id]);

    await tx.run(`
      UPDATE events
      SET tickets_sold = GREATEST(0, tickets_sold - $1), updated_at = NOW()
      WHERE id = $2
    `, [ticket.quantity, ticket.event_id]);

    /* Deduct loyalty points */
    const pts = ticket.ticket_type === 'vip'
      ? Math.round(Number(ticket.total_price) * 1.5)
      : Math.round(Number(ticket.total_price));

    await tx.run(
      'UPDATE users SET loyalty_points = GREATEST(0, loyalty_points - $1), updated_at = NOW() WHERE id = $2',
      [pts, ticket.user_id],
    );

    return { points_deducted: pts };
  });

  res.json({ message: 'Billet annulé', points_deducted: result.points_deducted });
}));

module.exports = router;
