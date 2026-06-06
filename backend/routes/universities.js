const express = require('express');
const db = require('../db/database');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  const universities = await db.many(`
    SELECT u.*, COALESCE(c.event_count, 0) AS event_count
    FROM universities u
    LEFT JOIN (
      SELECT university_id, COUNT(*)::int AS event_count
      FROM events
      WHERE status = 'published'
      GROUP BY university_id
    ) c ON c.university_id = u.id
    ORDER BY u.name ASC
  `);
  res.json(universities);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const university = await db.one('SELECT * FROM universities WHERE id = $1', [req.params.id]);
  if (!university) return res.status(404).json({ error: 'Université non trouvée' });
  res.json(university);
}));

/* ── POST /universities/:id/vote ── soutien public (sans authentification) */
router.post('/:id/vote', asyncHandler(async (req, res) => {
  const row = await db.one(
    `UPDATE universities SET votes = COALESCE(votes, 0) + 1 WHERE id = $1 RETURNING votes`,
    [req.params.id],
  );
  if (!row) return res.status(404).json({ error: 'Université non trouvée' });
  res.json({ votes: row.votes });
}));

/* ── DELETE /universities/:id/vote ── retrait du soutien */
router.delete('/:id/vote', asyncHandler(async (req, res) => {
  const row = await db.one(
    `UPDATE universities SET votes = GREATEST(0, COALESCE(votes, 0) - 1) WHERE id = $1 RETURNING votes`,
    [req.params.id],
  );
  if (!row) return res.status(404).json({ error: 'Université non trouvée' });
  res.json({ votes: row.votes });
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
