const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/* ── Helpers ── */
const VALID_TYPES   = ['gala', 'soiree', 'universite', 'concert', 'autre'];
const DATE_RE       = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE       = /^\d{2}:\d{2}$/;

/* ────────────────────────────────────────────
   GET /api/events
   Params: type, city, university_id, search,
           upcoming, page (default 1), limit (default 24)
──────────────────────────────────────────── */
router.get('/', (req, res) => {
  const { type, city, university_id, search, upcoming } = req.query;
  const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 24));
  const offset = (page - 1) * limit;

  let where  = "e.status = 'published'";
  const params = [];

  if (type && type !== 'all' && VALID_TYPES.includes(type)) {
    where += ' AND e.type = ?'; params.push(type);
  }
  if (city && city !== 'all') {
    where += ' AND e.city = ?'; params.push(city.trim());
  }
  if (university_id) {
    where += ' AND e.university_id = ?'; params.push(university_id);
  }
  if (search && search.trim()) {
    where += ' AND (e.title LIKE ? OR e.venue LIKE ? OR e.city LIKE ?)';
    const s = `%${search.trim().slice(0, 100)}%`;
    params.push(s, s, s);
  }
  if (upcoming === 'true') {
    where += " AND e.date >= date('now')";
  }

  const base = `
    SELECT e.*, u.name as university_name, u.short_name as university_short_name,
           u.color as university_color
    FROM events e
    LEFT JOIN universities u ON e.university_id = u.id
    WHERE ${where}
  `;

  const total  = db.prepare(`SELECT COUNT(*) as c FROM events e WHERE ${where}`).get(params).c;
  const events = db.prepare(`${base} ORDER BY e.date ASC LIMIT ? OFFSET ?`)
                   .all([...params, limit, offset]);

  res.json({
    data: events,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  });
});

/* ── GET /api/events/:id ── */
router.get('/:id', (req, res) => {
  const event = db.prepare(`
    SELECT e.*,
           u.name as university_name, u.short_name as university_short_name,
           u.color as university_color, u.description as university_description,
           u.student_count
    FROM events e
    LEFT JOIN universities u ON e.university_id = u.id
    WHERE e.id = ?
  `).get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Événement non trouvé' });
  res.json(event);
});

/* ── POST /api/events (admin) ── */
router.post('/', authenticate, requireAdmin, (req, res) => {
  const {
    title, description, type, university_id, venue, city,
    date, time, price_standard, price_vip, capacity, dress_code, image_url,
  } = req.body;

  if (!title?.trim())           return res.status(400).json({ error: 'Titre requis' });
  if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: 'Type invalide' });
  if (!venue?.trim())           return res.status(400).json({ error: 'Lieu requis' });
  if (!city?.trim())            return res.status(400).json({ error: 'Ville requise' });
  if (!DATE_RE.test(date))      return res.status(400).json({ error: 'Date invalide (YYYY-MM-DD)' });
  if (!TIME_RE.test(time))      return res.status(400).json({ error: 'Heure invalide (HH:MM)' });

  const pStd = parseFloat(price_standard) || 0;
  const pVip = parseFloat(price_vip)      || 0;
  const cap  = parseInt(capacity, 10)     || 200;

  if (pStd < 0 || pVip < 0)    return res.status(400).json({ error: 'Prix négatif invalide' });
  if (cap < 1 || cap > 50000)  return res.status(400).json({ error: 'Capacité invalide' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO events
      (id, title, description, type, university_id, venue, city, date, time,
       price_standard, price_vip, capacity, dress_code, image_url, organizer_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run([
    id, title.trim(), description?.trim() || null, type,
    university_id || null, venue.trim(), city.trim(), date, time,
    pStd, pVip, cap, dress_code?.trim() || null,
    image_url?.trim() || null, req.user.id,
  ]);

  res.status(201).json(db.prepare(`
    SELECT e.*, u.name as university_name, u.color as university_color
    FROM events e LEFT JOIN universities u ON e.university_id = u.id
    WHERE e.id = ?
  `).get(id));
});

/* ── PUT /api/events/:id (admin) ── */
router.put('/:id', authenticate, requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT id FROM events WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Événement non trouvé' });

  const {
    title, description, type, university_id, venue, city,
    date, time, price_standard, price_vip, capacity, dress_code, status, image_url,
  } = req.body;

  db.prepare(`
    UPDATE events SET
      title=?, description=?, type=?, university_id=?, venue=?, city=?,
      date=?, time=?, price_standard=?, price_vip=?, capacity=?,
      dress_code=?, status=?, image_url=?
    WHERE id=?
  `).run([
    title, description, type, university_id || null, venue, city,
    date, time, parseFloat(price_standard) || 0, parseFloat(price_vip) || 0,
    parseInt(capacity, 10) || 200, dress_code, status,
    image_url || null, req.params.id,
  ]);

  res.json(db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id));
});

/* ── DELETE /api/events/:id (admin) ── */
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  if (!db.prepare('SELECT id FROM events WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ error: 'Événement non trouvé' });
  }
  db.prepare('DELETE FROM tickets WHERE event_id = ?').run(req.params.id);
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ message: 'Événement supprimé' });
});

module.exports = router;
