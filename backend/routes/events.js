const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

const VALID_TYPES   = ['gala', 'soiree', 'universite', 'concert', 'autre'];
const VALID_STATUSES = ['published', 'draft', 'cancelled'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

function addParam(params, value) {
  params.push(value);
  return `$${params.length}`;
}

function validateEventBody(body, isUpdate = false) {
  const { title, type, venue, city, date, time, price_standard, price_vip, capacity } = body;

  if (!title?.trim())                           return 'Titre requis';
  if (!VALID_TYPES.includes(type))              return 'Type invalide';
  if (!venue?.trim())                           return 'Lieu requis';
  if (!city?.trim())                            return 'Ville requise';
  if (!DATE_RE.test(date))                      return 'Date invalide (YYYY-MM-DD)';
  if (!TIME_RE.test(time))                      return 'Heure invalide (HH:MM)';

  const pStd = parseFloat(price_standard) || 0;
  const pVip = parseFloat(price_vip) || 0;
  const cap  = parseInt(capacity, 10) || 200;

  if (pStd < 0 || pVip < 0)          return 'Prix négatif invalide';
  if (cap < 1 || cap > 50000)        return 'Capacité invalide (1–50 000)';

  if (isUpdate && body.status && !VALID_STATUSES.includes(body.status)) {
    return 'Statut invalide';
  }

  return null;
}

/* ── GET /events ── paginated list with filters */
router.get('/', asyncHandler(async (req, res) => {
  const { type, city, university_id, search, upcoming } = req.query;
  const page   = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit  = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 24));
  const offset = (page - 1) * limit;

  const where  = ["e.status = 'published'"];
  const params = [];

  if (type && type !== 'all' && VALID_TYPES.includes(type)) {
    where.push(`e.type = ${addParam(params, type)}`);
  }
  if (city && city !== 'all') {
    where.push(`e.city = ${addParam(params, city.trim())}`);
  }
  if (university_id) {
    where.push(`e.university_id = ${addParam(params, university_id)}`);
  }
  if (search && search.trim()) {
    const s = `%${search.trim().slice(0, 100)}%`;
    where.push(`(e.title ILIKE ${addParam(params, s)} OR e.venue ILIKE ${addParam(params, s)} OR e.city ILIKE ${addParam(params, s)})`);
  }
  if (upcoming === 'true') {
    where.push('e.date >= CURRENT_DATE');
  }

  const whereSql = where.join(' AND ');

  /* Single query using window function — no separate COUNT round-trip */
  const rows = await db.many(`
    SELECT e.*,
           u.name        AS university_name,
           u.short_name  AS university_short_name,
           u.color       AS university_color,
           COUNT(*) OVER() AS total_count
    FROM events e
    LEFT JOIN universities u ON e.university_id = u.id
    WHERE ${whereSql}
    ORDER BY e.date ASC, e.created_at ASC
    LIMIT  ${addParam(params, limit)}
    OFFSET ${addParam(params, offset)}
  `, params);

  const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
  const data  = rows.map(({ total_count, ...r }) => r);

  res.json({
    data,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}));

/* ── GET /events/:id ── */
router.get('/:id', asyncHandler(async (req, res) => {
  const event = await db.one(`
    SELECT e.*,
           u.name        AS university_name,
           u.short_name  AS university_short_name,
           u.color       AS university_color,
           u.description AS university_description,
           u.student_count
    FROM events e
    LEFT JOIN universities u ON e.university_id = u.id
    WHERE e.id = $1
  `, [req.params.id]);

  if (!event) return res.status(404).json({ error: 'Événement non trouvé' });
  res.json(event);
}));

/* ── POST /events ── admin only */
router.post('/', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const error = validateEventBody(req.body);
  if (error) return res.status(400).json({ error });

  const {
    title, description, type, university_id, venue, city,
    date, time, price_standard, price_vip, capacity, dress_code, image_url,
  } = req.body;

  const id = uuidv4();
  const { rows } = await db.query(`
    INSERT INTO events
      (id, title, description, type, university_id, venue, city, date, time,
       price_standard, price_vip, capacity, dress_code, image_url, organizer_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    RETURNING *
  `, [
    id,
    title.trim(),
    description?.trim() || null,
    type,
    university_id || null,
    venue.trim(),
    city.trim(),
    date,
    time,
    parseFloat(price_standard) || 0,
    parseFloat(price_vip) || 0,
    parseInt(capacity, 10) || 200,
    dress_code?.trim() || null,
    image_url?.trim() || null,
    req.user.id,
  ]);

  /* Attach university info without a second round-trip when possible */
  const event = university_id
    ? await db.one(`
        SELECT e.*, u.name AS university_name, u.color AS university_color
        FROM events e LEFT JOIN universities u ON e.university_id = u.id
        WHERE e.id = $1
      `, [id])
    : rows[0];

  res.status(201).json(event);
}));

/* ── PUT /events/:id ── admin only */
router.put('/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const existing = await db.one('SELECT id, tickets_sold FROM events WHERE id = $1', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Événement non trouvé' });

  const error = validateEventBody(req.body, true);
  if (error) return res.status(400).json({ error });

  const {
    title, description, type, university_id, venue, city,
    date, time, price_standard, price_vip, capacity, dress_code, status, image_url,
  } = req.body;

  const cap = parseInt(capacity, 10) || 200;
  if (cap < existing.tickets_sold) {
    return res.status(400).json({ error: `Capacité ne peut pas être inférieure aux billets déjà vendus (${existing.tickets_sold})` });
  }

  const { rows } = await db.query(`
    UPDATE events SET
      title          = $1,
      description    = $2,
      type           = $3,
      university_id  = $4,
      venue          = $5,
      city           = $6,
      date           = $7,
      time           = $8,
      price_standard = $9,
      price_vip      = $10,
      capacity       = $11,
      dress_code     = $12,
      status         = $13,
      image_url      = $14,
      updated_at     = NOW()
    WHERE id = $15
    RETURNING *
  `, [
    title.trim(),
    description?.trim() || null,
    type,
    university_id || null,
    venue.trim(),
    city.trim(),
    date,
    time,
    parseFloat(price_standard) || 0,
    parseFloat(price_vip) || 0,
    cap,
    dress_code?.trim() || null,
    status || 'published',
    image_url?.trim() || null,
    req.params.id,
  ]);

  res.json(rows[0]);
}));

/* ── DELETE /events/:id ── admin only */
router.delete('/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const existing = await db.one('SELECT id FROM events WHERE id = $1', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Événement non trouvé' });

  await db.transaction(async (tx) => {
    /* Restore loyalty points before deleting tickets */
    const affected = await tx.many(`
      SELECT user_id, total_price, ticket_type FROM tickets
      WHERE event_id = $1 AND status = 'confirmed'
    `, [req.params.id]);

    for (const t of affected) {
      const pts = t.ticket_type === 'vip'
        ? Math.round(Number(t.total_price) * 1.5)
        : Math.round(Number(t.total_price));
      await tx.run(
        'UPDATE users SET loyalty_points = GREATEST(0, loyalty_points - $1) WHERE id = $2',
        [pts, t.user_id],
      );
    }

    await tx.run('DELETE FROM tickets WHERE event_id = $1', [req.params.id]);
    await tx.run('DELETE FROM events  WHERE id       = $1', [req.params.id]);
  });

  res.json({ message: 'Événement supprimé' });
}));

module.exports = router;
