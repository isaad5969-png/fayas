const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/purchase', authenticate, (req, res) => {
  const { event_id, ticket_type } = req.body;
  const quantity = parseInt(req.body.quantity, 10);

  if (!event_id || !['standard', 'vip'].includes(ticket_type) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    return res.status(400).json({ error: 'Données de réservation invalides' });
  }

  try {
    const result = db.transaction(() => {
      const event = db.prepare(`
        SELECT id, price_standard, price_vip
        FROM events
        WHERE id = ? AND status = 'published'
      `).get(event_id);

      if (!event) {
        const err = new Error('Événement non trouvé');
        err.status = 404;
        throw err;
      }

      const unit_price = ticket_type === 'vip' ? event.price_vip : event.price_standard;
      if (!unit_price || unit_price <= 0) {
        const err = new Error('Type de billet non disponible');
        err.status = 400;
        throw err;
      }

      const update = db.prepare(`
        UPDATE events
        SET tickets_sold = tickets_sold + ?
        WHERE id = ?
          AND status = 'published'
          AND tickets_sold + ? <= capacity
      `).run([quantity, event_id, quantity]);

      if (update.changes === 0) {
        const fresh = db.prepare('SELECT capacity, tickets_sold FROM events WHERE id = ?').get(event_id);
        const available = Math.max(0, (fresh?.capacity || 0) - (fresh?.tickets_sold || 0));
        const err = new Error(`Seulement ${available} place(s) disponible(s)`);
        err.status = 400;
        throw err;
      }

      const total_price = unit_price * quantity;
      const id = uuidv4();

      db.prepare(`
        INSERT INTO tickets (id, event_id, user_id, ticket_type, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run([id, event_id, req.user.id, ticket_type, quantity, unit_price, total_price]);

      const ticketCount = db.prepare('SELECT COUNT(*) as c FROM tickets WHERE user_id = ?').get(req.user.id).c;
      const basePoints = Math.round(total_price);
      const bonusVip = ticket_type === 'vip' ? Math.round(total_price * 0.5) : 0;
      const bonusFirst = ticketCount === 1 ? 100 : 0;
      const bonusStreak = ticketCount > 0 && ticketCount % 5 === 0 ? 150 : 0;
      const pointsEarned = basePoints + bonusVip + bonusFirst + bonusStreak;

      db.prepare('UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?')
        .run([pointsEarned, req.user.id]);

      return { id, pointsEarned, bonusFirst, bonusStreak };
    });

    const ticket = db.prepare(`
      SELECT t.*, e.title as event_title, e.date, e.time, e.venue, e.city, e.type as event_type, e.dress_code
      FROM tickets t JOIN events e ON t.event_id = e.id WHERE t.id = ?
    `).get(result.id);

    res.status(201).json({
      ...ticket,
      points_earned: result.pointsEarned,
      bonus_first: result.bonusFirst,
      bonus_streak: result.bonusStreak,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      error: err.status ? err.message : 'Erreur interne du serveur',
    });
  }
});

router.get('/my', authenticate, (req, res) => {
  const tickets = db.prepare(`
    SELECT t.*, e.title as event_title, e.date, e.time, e.venue, e.city, e.type as event_type, e.dress_code,
           u.name as university_name, u.color as university_color
    FROM tickets t
    JOIN events e ON t.event_id = e.id
    LEFT JOIN universities u ON e.university_id = u.id
    WHERE t.user_id = ? ORDER BY t.purchased_at DESC
  `).all(req.user.id);
  res.json(tickets);
});

router.get('/:id', authenticate, (req, res) => {
  const ticket = db.prepare(`
    SELECT t.*, e.title as event_title, e.date, e.time, e.venue, e.city, e.type as event_type, e.dress_code,
           u.name as university_name
    FROM tickets t JOIN events e ON t.event_id = e.id
    LEFT JOIN universities u ON e.university_id = u.id
    WHERE t.id = ? AND t.user_id = ?
  `).get([req.params.id, req.user.id]);
  if (!ticket) return res.status(404).json({ error: 'Billet non trouvé' });
  res.json(ticket);
});

module.exports = router;
