const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', (_req, res) => {
  const universities = db.prepare(`
    SELECT u.*, COUNT(e.id) as event_count
    FROM universities u
    LEFT JOIN events e ON e.university_id = u.id AND e.status = 'published'
    GROUP BY u.id ORDER BY u.name ASC
  `).all();
  res.json(universities);
});

router.get('/:id', (req, res) => {
  const university = db.prepare('SELECT * FROM universities WHERE id = ?').get(req.params.id);
  if (!university) return res.status(404).json({ error: 'Université non trouvée' });
  res.json(university);
});

router.get('/:id/events', (req, res) => {
  const university = db.prepare('SELECT * FROM universities WHERE id = ?').get(req.params.id);
  if (!university) return res.status(404).json({ error: 'Université non trouvée' });
  const events = db.prepare(
    "SELECT * FROM events WHERE university_id = ? AND status = 'published' ORDER BY date ASC"
  ).all(req.params.id);
  res.json({ university, events });
});

module.exports = router;
