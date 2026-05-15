const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');
const { sendPurchaseConfirmation } = require('../services/emailService');

const router = express.Router();

function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw Object.assign(new Error('Stripe non configuré — ajoutez STRIPE_SECRET_KEY'), { status: 503 });
  }
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
}

/* POST /api/payments/create-intent
   Crée un PaymentIntent Stripe et retourne le clientSecret */
router.post('/create-intent', authenticate, async (req, res) => {
  const { event_id, ticket_type, quantity: rawQty } = req.body;
  const quantity = parseInt(rawQty, 10);

  if (!event_id || !['standard', 'vip'].includes(ticket_type) ||
      !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    return res.status(400).json({ error: 'Données invalides' });
  }

  const event = db.prepare(`
    SELECT id, title, price_standard, price_vip, capacity, tickets_sold
    FROM events WHERE id = ? AND status = 'published'
  `).get(event_id);

  if (!event) return res.status(404).json({ error: 'Événement non trouvé' });

  const unit_price = ticket_type === 'vip' ? event.price_vip : event.price_standard;
  if (!unit_price || unit_price <= 0) {
    return res.status(400).json({ error: 'Type de billet non disponible' });
  }

  const available = event.capacity - event.tickets_sold;
  if (available < quantity) {
    return res.status(400).json({ error: `Seulement ${available} place(s) disponible(s)` });
  }

  const total_price = unit_price * quantity;

  try {
    const intent = await stripe().paymentIntents.create({
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
  } catch (err) {
    console.error('[Stripe create-intent]', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Erreur paiement' });
  }
});

/* POST /api/payments/confirm
   Vérifie le paiement Stripe et crée le billet en base */
router.post('/confirm', authenticate, async (req, res) => {
  const { payment_intent_id } = req.body;
  if (!payment_intent_id) return res.status(400).json({ error: 'payment_intent_id requis' });

  try {
    const intent = await stripe().paymentIntents.retrieve(payment_intent_id);

    if (intent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Paiement non complété' });
    }

    if (intent.metadata.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Idempotence — évite la double création si confirmation relancée
    const existing = db.prepare('SELECT id FROM tickets WHERE payment_intent_id = ?').get(payment_intent_id);
    if (existing) {
      const ticket = db.prepare(`
        SELECT t.*, e.title as event_title, e.date, e.time, e.venue, e.city, e.type as event_type, e.dress_code
        FROM tickets t JOIN events e ON t.event_id = e.id WHERE t.id = ?
      `).get(existing.id);
      return res.json({ ...ticket, points_earned: 0, already_processed: true });
    }

    const { event_id, ticket_type, quantity: qtyStr, unit_price: upStr } = intent.metadata;
    const quantity = parseInt(qtyStr, 10);
    const unit_price = parseFloat(upStr);
    const total_price = unit_price * quantity;

    const result = db.transaction(() => {
      const update = db.prepare(`
        UPDATE events SET tickets_sold = tickets_sold + ?
        WHERE id = ? AND status = 'published' AND tickets_sold + ? <= capacity
      `).run([quantity, event_id, quantity]);

      if (update.changes === 0) {
        const fresh = db.prepare('SELECT capacity, tickets_sold FROM events WHERE id = ?').get(event_id);
        const avail = Math.max(0, (fresh?.capacity || 0) - (fresh?.tickets_sold || 0));
        throw Object.assign(new Error(`Seulement ${avail} place(s) disponible(s)`), { status: 400 });
      }

      const id = uuidv4();
      db.prepare(`
        INSERT INTO tickets (id, event_id, user_id, ticket_type, quantity, unit_price, total_price, payment_intent_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run([id, event_id, req.user.id, ticket_type, quantity, unit_price, total_price, payment_intent_id]);

      const ticketCount = db.prepare('SELECT COUNT(*) as c FROM tickets WHERE user_id = ?').get(req.user.id).c;
      const basePoints  = Math.round(total_price);
      const bonusVip    = ticket_type === 'vip' ? Math.round(total_price * 0.5) : 0;
      const bonusFirst  = ticketCount === 1 ? 100 : 0;
      const bonusStreak = ticketCount > 0 && ticketCount % 5 === 0 ? 150 : 0;
      const pointsEarned = basePoints + bonusVip + bonusFirst + bonusStreak;

      db.prepare('UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?')
        .run([pointsEarned, req.user.id]);

      return { id, pointsEarned, bonusFirst, bonusStreak };
    })();

    const ticket = db.prepare(`
      SELECT t.*, e.title as event_title, e.date, e.time, e.venue, e.city, e.type as event_type, e.dress_code
      FROM tickets t JOIN events e ON t.event_id = e.id WHERE t.id = ?
    `).get(result.id);

    const user  = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.user.id);
    const event = db.prepare('SELECT title, date, time, venue, city, dress_code FROM events WHERE id = ?').get(event_id);
    sendPurchaseConfirmation(user, { ...ticket, points_earned: result.pointsEarned }, event)
      .catch(err => console.error('[Email]', err.message));

    res.status(201).json({
      ...ticket,
      points_earned:  result.pointsEarned,
      bonus_first:    result.bonusFirst,
      bonus_streak:   result.bonusStreak,
    });
  } catch (err) {
    console.error('[Payment confirm]', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Erreur interne' });
  }
});

module.exports = router;
