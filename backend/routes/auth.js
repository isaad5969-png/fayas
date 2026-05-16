const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const https   = require('https');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { sendWelcomeEmail } = require('../services/emailService');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
}

function safeUser(u) {
  const { password, ...rest } = u;
  return rest;
}

function getGoogleTokenInfo(idToken) {
  return new Promise((resolve, reject) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    https.get(url, (response) => {
      let body = '';
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (response.statusCode !== 200) {
            const err = new Error(data.error_description || 'Token Google invalide');
            err.status = 401;
            reject(err);
            return;
          }
          resolve(data);
        } catch {
          const err = new Error('Réponse Google invalide');
          err.status = 502;
          reject(err);
        }
      });
    }).on('error', () => {
      const err = new Error('Impossible de vérifier Google');
      err.status = 502;
      reject(err);
    });
  });
}

/* ── POST /auth/register ── */
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, university_id, phone } = req.body;

  if (!name?.trim())           return res.status(400).json({ error: 'Nom requis' });
  if (!email?.trim())          return res.status(400).json({ error: 'Email requis' });
  if (!EMAIL_RE.test(email))   return res.status(400).json({ error: 'Email invalide' });
  if (!password)               return res.status(400).json({ error: 'Mot de passe requis' });
  if (password.length < 6)     return res.status(400).json({ error: 'Mot de passe trop court (6 caractères min.)' });
  if (password.length > 128)   return res.status(400).json({ error: 'Mot de passe trop long' });

  const emailNorm = email.trim().toLowerCase();
  if (await db.one('SELECT id FROM users WHERE email = $1', [emailNorm])) {
    return res.status(409).json({ error: 'Cet email est déjà utilisé' });
  }

  const id   = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  const { rows } = await db.query(`
    INSERT INTO users (id, name, email, password, university_id, phone)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, email, role, university_id, phone, loyalty_points, created_at
  `, [id, name.trim(), emailNorm, hash, university_id || null, phone?.trim() || null]);

  const user = rows[0];
  sendWelcomeEmail(user).catch(err => console.error('[Email]', err.message));
  res.status(201).json({ user: safeUser(user), token: signToken(user) });
}));

/* ── POST /auth/login ── */
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const user = await db.one('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  res.json({ user: safeUser(user), token: signToken(user) });
}));

/* ── POST /auth/google ── */
router.post('/google', asyncHandler(async (req, res) => {
  const { credential } = req.body;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (!googleClientId) return res.status(501).json({ error: 'Connexion Google non configurée' });
  if (!credential)      return res.status(400).json({ error: 'Token Google requis' });

  const profile = await getGoogleTokenInfo(credential);
  if (profile.aud !== googleClientId) return res.status(401).json({ error: 'Client Google invalide' });
  if (profile.email_verified !== 'true' && profile.email_verified !== true) {
    return res.status(401).json({ error: 'Email Google non vérifié' });
  }

  const email = profile.email.trim().toLowerCase();
  let user = await db.one('SELECT * FROM users WHERE email = $1', [email]);

  if (!user) {
    const id       = uuidv4();
    const name     = profile.name || email.split('@')[0];
    const password = await bcrypt.hash(`google:${profile.sub}:${uuidv4()}`, 10);

    const { rows } = await db.query(`
      INSERT INTO users (id, name, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id, name, email, password]);

    user = rows[0];
  }

  res.json({ user: safeUser(user), token: signToken(user) });
}));

/* ── GET /auth/me ── single JOIN query */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await db.one(`
    SELECT
      u.id, u.name, u.email, u.role, u.university_id,
      u.phone, u.loyalty_points, u.created_at,
      univ.id        AS univ_id,
      univ.name      AS univ_name,
      univ.short_name AS univ_short_name,
      univ.city      AS univ_city,
      univ.color     AS univ_color
    FROM users u
    LEFT JOIN universities univ ON univ.id = u.university_id
    WHERE u.id = $1
  `, [req.user.id]);

  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

  const { univ_id, univ_name, univ_short_name, univ_city, univ_color, ...rest } = user;
  const university = univ_id
    ? { id: univ_id, name: univ_name, short_name: univ_short_name, city: univ_city, color: univ_color }
    : null;

  res.json({ ...rest, university });
}));

/* ── PUT /auth/me ── */
router.put('/me', authenticate, asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Nom requis' });

  const { rows } = await db.query(`
    UPDATE users
    SET name = $1, phone = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING id, name, email, role, university_id, phone, loyalty_points, updated_at
  `, [name.trim(), phone?.trim() || null, req.user.id]);

  res.json(rows[0]);
}));

module.exports = router;
