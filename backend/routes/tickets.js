const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/purchase', authenticate, (req, res) => {
  const { event_id, ticket_type, quantity } = req.body;
  if (!event_id || !ticket_type || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Données de réservation invalides' });
  }
  const event = db.prepare("SELECT * FROM events WHERE id = ? AND status = 'published'").get(event_id);
  if (!event) return res.status(404).json({ error: 'Événement non trouvé' });

  const available = event.capacity - event.tickets_sold;
  if (quantity > available) {
    return res.status(400).json({ error: `Seulement ${available} place(s) disponible(s)` });
  }
  const unit_price = ticket_type === 'vip' ? event.price_vip : event.price_standard;
  if (!unit_price || unit_price <= 0) {
    return res.status(400).json({ error: 'Type de billet non disponible' });
  }
  const total_price = unit_price * quantity;
  const id = uuidv4();
  db.prepare('INSERT INTO tickets (id, event_id, user_id, ticket_type, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run([id, event_id, req.user.id, ticket_type, quantity, unit_price, total_price]);
  db.prepare('UPDATE events SET tickets_sold = tickets_sold + ? WHERE id = ?').run([quantity, event_id]);

  /* ── BilletCoins: points gagnés sur cet achat ── */
  const basePoints   = Math.round(total_price);
  const bonusVip     = ticket_type === 'vip' ? Math.round(total_price * 0.5) : 0; // +50% pour VIP
  const ticketCount  = db.prepare('SELECT COUNT(*) as c FROM tickets WHERE user_id = ?').get(req.user.id).c;
  const bonusFirst   = ticketCount === 1 ? 100 : 0;           // 1er achat
  const bonusStreak  = ticketCount > 0 && ticketCount % 5 === 0 ? 150 : 0; // tous les 5 achats
  const pointsEarned = basePoints + bonusVip + bonusFirst + bonusStreak;
  db.prepare('UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?').run([pointsEarned, req.user.id]);

  const ticket = db.prepare(`
    SELECT t.*, e.title as event_title, e.date, e.time, e.venue, e.city, e.type as event_type, e.dress_code
    FROM tickets t JOIN events e ON t.event_id = e.id WHERE t.id = ?
  `).get(id);
  res.status(201).json({ ...ticket, points_earned: pointsEarned, bonus_first: bonusFirst, bonus_streak: bonusStreak });
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
