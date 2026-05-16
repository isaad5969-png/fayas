const express = require('express');
const db = require('../db/database');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  const universities = await db.many(`
    SELECT u.*, COUNT(e.id)::int as event_count
    FROM universities u
    LEFT JOIN events e ON e.university_id = u.id AND e.status = 'published'
    GROUP BY u.id
    ORDER BY u.name ASC
  `);
  res.json(universities);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const university = await db.one('SELECT * FROM universities WHERE id = $1', [req.params.id]);
  if (!university) return res.status(404).json({ error: 'Université non trouvée' });
  res.json(university);
}));

router.get('/:id/events', asyncHandler(async (req, res) => {
  const university = await db.one('SELECT * FROM universities WHERE id = $1', [req.params.id]);
  if (!university) return res.status(404).json({ error: 'Université non trouvée' });

  const events = await db.many(`
    SELECT * FROM events
    WHERE university_id = $1 AND status = 'published'
    ORDER BY date ASC
  `, [req.params.id]);

  res.json({ university, events });
}));

module.exports = router;
