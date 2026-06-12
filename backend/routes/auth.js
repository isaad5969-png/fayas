const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const https   = require('https');
const crypto  = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');

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

/* ══════════════════════════════════════════════════════════
   Auth par téléphone (code OTP) — mode démo
   Pas de fournisseur SMS configuré → le code est renvoyé dans
   la réponse (demo_code), à l'image du flux mot-de-passe-oublié.
   En production : brancher Twilio/Vonage dans requestOtp().
═══════════════════════════════════════════════════════════ */
const PHONE_RE = /^\+?[0-9\s().-]{8,20}$/;
const normalizePhone = (p) => p.replace(/[^0-9+]/g, '');

/* ── POST /auth/phone/request-otp ── */
router.post('/phone/request-otp', asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone || !PHONE_RE.test(phone)) {
    return res.status(400).json({ error: 'Numéro de téléphone invalide' });
  }
  const key  = normalizePhone(phone);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60_000);
  await db.query(`
    INSERT INTO phone_otps (phone, code, expires_at, attempts)
    VALUES ($1, $2, $3, 0)
    ON CONFLICT (phone) DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at, attempts = 0
  `, [key, code, expiresAt]);

  const isDemoMode = !process.env.SMS_PROVIDER;
  console.log(`\x1b[36m[OTP]\x1b[0m ${key} → ${code}`);
  res.json({
    message: 'Code de vérification envoyé par SMS.',
    ...(isDemoMode && { demo_code: code }),
  });
}));

/* ── POST /auth/phone/verify-otp ── (connexion OU inscription) */
router.post('/phone/verify-otp', asyncHandler(async (req, res) => {
  const { phone, code, name } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Téléphone et code requis' });

  const key   = normalizePhone(phone);
  const entry = await db.one('SELECT * FROM phone_otps WHERE phone = $1', [key]);

  if (!entry || new Date(entry.expires_at) < new Date()) {
    await db.query('DELETE FROM phone_otps WHERE phone = $1', [key]);
    return res.status(400).json({ error: 'Code expiré — redemandez-en un.' });
  }
  if (entry.attempts >= 5) {
    await db.query('DELETE FROM phone_otps WHERE phone = $1', [key]);
    return res.status(429).json({ error: 'Trop de tentatives. Redemandez un code.' });
  }
  if (entry.code !== String(code).trim()) {
    await db.query('UPDATE phone_otps SET attempts = attempts + 1 WHERE phone = $1', [key]);
    return res.status(401).json({ error: 'Code incorrect' });
  }
  await db.query('DELETE FROM phone_otps WHERE phone = $1', [key]);

  /* Login si le numéro existe, sinon création d'un compte (sans mot de passe) */
  let user = await db.one('SELECT * FROM users WHERE phone = $1', [key]);
  if (!user) {
    const id       = uuidv4();
    const email    = `${key.replace(/[^0-9]/g, '')}@phone.fayas.ma`;
    const password = await bcrypt.hash(`phone:${key}:${uuidv4()}`, 10);
    const { rows } = await db.query(`
      INSERT INTO users (id, name, email, password, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, name?.trim() || 'Invité Fayas', email, password, key]);
    user = rows[0];
    sendWelcomeEmail(user).catch(() => {});
  }

  res.json({ user: safeUser(user), token: signToken(user) });
}));

/* ── POST /auth/forgot-password ── */
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) return res.status(400).json({ error: 'Email requis' });

  const emailNorm = email.trim().toLowerCase();
  const user = await db.one('SELECT id, name, email FROM users WHERE email = $1', [emailNorm]);

  const successMsg = { message: 'Si cet email est associé à un compte, un lien de réinitialisation a été envoyé.' };

  if (!user) return res.json(successMsg);

  const token     = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

  await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);
  await db.query(
    'INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)',
    [uuidv4(), user.id, token, expiresAt],
  );

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl    = `${frontendUrl}/reset-password?token=${token}`;

  sendPasswordResetEmail(user, resetUrl).catch(err => console.error('[Email]', err.message));

  const isDemoMode = !process.env.GMAIL_USER;
  res.json({ ...successMsg, ...(isDemoMode && { demo_token: token, demo_url: resetUrl }) });
}));

/* ── POST /auth/reset-password ── */
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token)              return res.status(400).json({ error: 'Token requis' });
  if (!password)           return res.status(400).json({ error: 'Mot de passe requis' });
  if (password.length < 6) return res.status(400).json({ error: 'Mot de passe trop court (6 caractères min.)' });
  if (password.length > 128) return res.status(400).json({ error: 'Mot de passe trop long' });

  const record = await db.one(
    `SELECT * FROM password_reset_tokens
     WHERE token = $1 AND used = FALSE AND expires_at > NOW()`,
    [token],
  );
  if (!record) return res.status(400).json({ error: 'Lien invalide ou expiré. Veuillez refaire une demande.' });

  const hash = await bcrypt.hash(password, 10);
  await db.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hash, record.user_id]);
  await db.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [record.id]);

  res.json({ message: 'Mot de passe modifié avec succès. Vous pouvez maintenant vous connecter.' });
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
  const { name, phone, university_id, current_password, new_password } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Nom requis' });

  /* Changement de mot de passe optionnel */
  let passwordUpdate = '';
  const params = [name.trim(), phone?.trim() || null, university_id || null];

  if (new_password) {
    if (!current_password) return res.status(400).json({ error: 'Mot de passe actuel requis pour le modifier' });
    if (new_password.length < 6)  return res.status(400).json({ error: 'Nouveau mot de passe trop court (6 min.)' });
    if (new_password.length > 128) return res.status(400).json({ error: 'Nouveau mot de passe trop long' });

    const current = await db.one('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (!current || !(await bcrypt.compare(current_password, current.password))) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }
    const hash = await bcrypt.hash(new_password, 10);
    passwordUpdate = ', password = $4';
    params.push(hash);
  }

  const idParam = `$${params.length + 1}`;
  params.push(req.user.id);

  const { rows } = await db.query(`
    UPDATE users
    SET name = $1, phone = $2, university_id = $3${passwordUpdate}, updated_at = NOW()
    WHERE id = ${idParam}
    RETURNING id, name, email, role, university_id, phone, loyalty_points, updated_at
  `, params);

  res.json(rows[0]);
}));

module.exports = router;
