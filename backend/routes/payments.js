const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { sendPurchaseConfirmation } = require('../services/emailService');

const router = express.Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw Object.assign(new Error('Stripe non configuré — ajoutez STRIPE_SECRET_KEY'), { status: 503 });
  }
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
}

/* POST /api/payments/create-intent */
router.post('/create-intent', authenticate, asyncHandler(async (req, res) => {
  const { event_id, ticket_type, quantity: rawQty } = req.body;
  const quantity = parseInt(rawQty, 10);

  if (!event_id || !['standard', 'vip'].includes(ticket_type) ||
      !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    return res.status(400).json({ error: 'Données invalides' });
  }

  const event = await db.one(`
    SELECT id, title, price_standard, price_vip, capacity, tickets_sold
    FROM events WHERE id = $1 AND status = 'published'
  `, [event_id]);

  if (!event) return res.status(404).json({ error: 'Événement non trouvé' });

  const unit_price = Number(ticket_type === 'vip' ? event.price_vip : event.price_standard);
  if (!unit_price || unit_price <= 0) {
    return res.status(400).json({ error: 'Type de billet non disponible' });
  }

  const available = event.capacity - event.tickets_sold;
  if (available < quantity) {
    return res.status(400).json({ error: `Seulement ${available} place(s) disponible(s)` });
  }

  const total_price = unit_price * quantity;

  const intent = await getStripe().paymentIntents.create({
    amount: Math.round(total_price * 100),
    currency: 'mad',
    metadata: {
      event_id,
      user_id: req.user.id,
      ticket_type,
      quantity: String(quantity),
      unit_price: String(unit_price),
    },
  });

  res.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id, amount: total_price });
}));

/* POST /api/payments/confirm */
router.post('/confirm', authenticate, asyncHandler(async (req, res) => {
  const { payment_intent_id } = req.body;
  if (!payment_intent_id) return res.status(400).json({ error: 'payment_intent_id requis' });

  const intent = await getStripe().paymentIntents.retrieve(payment_intent_id);

  if (intent.status !== 'succeeded') {
    return res.status(400).json({ error: 'Paiement non complété' });
  }

  if (intent.metadata.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Non autorisé' });
  }

  // Idempotence — évite la double création si confirmation relancée
  const existing = await db.one(
    'SELECT id FROM tickets WHERE payment_intent_id = $1',
    [payment_intent_id],
  );
  if (existing) {
    const ticket = await db.one(`
      SELECT t.*, e.title AS event_title, e.date, e.time, e.venue, e.city,
             e.type AS event_type, e.dress_code
      FROM tickets t JOIN events e ON t.event_id = e.id WHERE t.id = $1
    `, [existing.id]);
    return res.json({ ...ticket, points_earned: 0, already_processed: true });
  }

  const { event_id, ticket_type, quantity: qtyStr, unit_price: upStr } = intent.metadata;
  const quantity    = parseInt(qtyStr, 10);
  const unit_price  = parseFloat(upStr);
  const total_price = unit_price * quantity;

  const result = await db.transaction(async (tx) => {
    const update = await tx.run(`
      UPDATE events
      SET tickets_sold = tickets_sold + $1, updated_at = NOW()
      WHERE id = $2 AND status = 'published' AND tickets_sold + $3 <= capacity
    `, [quantity, event_id, quantity]);

    if (update.rowCount === 0) {
      const fresh = await tx.one('SELECT capacity, tickets_sold FROM events WHERE id = $1', [event_id]);
      const avail = Math.max(0, (fresh?.capacity || 0) - (fresh?.tickets_sold || 0));
      throw Object.assign(new Error(`Seulement ${avail} place(s) disponible(s)`), { status: 400 });
    }

    const id = uuidv4();
    await tx.run(`
      INSERT INTO tickets (id, event_id, user_id, ticket_type, quantity, unit_price, total_price, payment_intent_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [id, event_id, req.user.id, ticket_type, quantity, unit_price, total_price, payment_intent_id]);

    const ticketCount = await tx.one(
      'SELECT COUNT(*)::int AS c FROM tickets WHERE user_id = $1 AND status = $2',
      [req.user.id, 'confirmed'],
    );
    const basePoints   = Math.round(total_price);
    const bonusVip     = ticket_type === 'vip' ? Math.round(total_price * 0.5) : 0;
    const bonusFirst   = ticketCount.c === 1 ? 100 : 0;
    const bonusStreak  = ticketCount.c > 0 && ticketCount.c % 5 === 0 ? 150 : 0;
    const pointsEarned = basePoints + bonusVip + bonusFirst + bonusStreak;

    await tx.run(
      'UPDATE users SET loyalty_points = loyalty_points + $1, updated_at = NOW() WHERE id = $2',
      [pointsEarned, req.user.id],
    );

    return { id, pointsEarned, bonusFirst, bonusStreak };
  });

  const ticket = await db.one(`
    SELECT t.*, e.title AS event_title, e.date, e.time, e.venue, e.city,
           e.type AS event_type, e.dress_code
    FROM tickets t JOIN events e ON t.event_id = e.id WHERE t.id = $1
  `, [result.id]);

  const user  = await db.one('SELECT id, name, email FROM users WHERE id = $1', [req.user.id]);
  const event = await db.one(
    'SELECT title, date, time, venue, city, dress_code FROM events WHERE id = $1',
    [event_id],
  );
  sendPurchaseConfirmation(user, { ...ticket, points_earned: result.pointsEarned }, event)
    .catch(err => console.error('[Email]', err.message));

  res.status(201).json({
    ...ticket,
    points_earned: result.pointsEarned,
    bonus_first:   result.bonusFirst,
    bonus_streak:  result.bonusStreak,
  });
}));

module.exports = router;
