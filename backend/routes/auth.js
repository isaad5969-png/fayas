const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../services/emailService');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function safeUser(u) {
  const { password, ...rest } = u;
  return rest;
}

/* ── POST /api/auth/register ── */
router.post('/register', (req, res) => {
  const { name, email, password, university_id, phone } = req.body;

  if (!name?.trim())            return res.status(400).json({ error: 'Nom requis' });
  if (!email?.trim())           return res.status(400).json({ error: 'Email requis' });
  if (!EMAIL_RE.test(email))    return res.status(400).json({ error: 'Email invalide' });
  if (!password)                return res.status(400).json({ error: 'Mot de passe requis' });
  if (password.length < 6)     return res.status(400).json({ error: 'Mot de passe trop court (6 caractères min.)' });
  if (password.length > 128)   return res.status(400).json({ error: 'Mot de passe trop long' });

  const emailNorm = email.trim().toLowerCase();
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(emailNorm)) {
    return res.status(409).json({ error: 'Cet email est déjà utilisé' });
  }

  const id   = uuidv4();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(
    'INSERT INTO users (id, name, email, password, university_id, phone) VALUES (?, ?, ?, ?, ?, ?)'
  ).run([id, name.trim(), emailNorm, hash, university_id || null, phone?.trim() || null]);

  const user = db.prepare(
    'SELECT id, name, email, role, university_id, phone, loyalty_points, created_at FROM users WHERE id = ?'
  ).get(id);

  sendWelcomeEmail(user).catch(err => console.error('[Email]', err.message));
  res.status(201).json({ user: safeUser(user), token: signToken(user) });
});

/* ── POST /api/auth/login ── */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  res.json({ user: safeUser(user), token: signToken(user) });
});

/* ── GET /api/auth/me ── */
router.get('/me', authenticate, (req, res) => {
  const user = db.prepare(
    'SELECT id, name, email, role, university_id, phone, loyalty_points, created_at FROM users WHERE id = ?'
  ).get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

  const university = user.university_id
    ? db.prepare('SELECT id, name, short_name, city, color FROM universities WHERE id = ?').get(user.university_id)
    : null;

  res.json({ ...user, university });
});

/* ── PUT /api/auth/me ── */
router.put('/me', authenticate, (req, res) => {
  const { name, phone } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Nom requis' });

  db.prepare('UPDATE users SET name=?, phone=? WHERE id=?')
    .run([name.trim(), phone?.trim() || null, req.user.id]);

  const updated = db.prepare(
    'SELECT id, name, email, role, university_id, phone, loyalty_points FROM users WHERE id = ?'
  ).get(req.user.id);
  res.json(updated);
});

module.exports = router;
