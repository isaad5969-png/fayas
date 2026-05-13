const express = require('express');
const cors    = require('cors');

const authRoutes       = require('./routes/auth');
const eventRoutes      = require('./routes/events');
const universityRoutes = require('./routes/universities');
const ticketRoutes     = require('./routes/tickets');
const adminRoutes      = require('./routes/admin');
const loyaltyRoutes    = require('./routes/loyalty');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── Security headers (no helmet needed) ── */
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

/* ── CORS ── */
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/* ── Body parser ── */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

/* ── Request logger ── */
app.use((req, res, next) => {
  const startAt = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(startAt);
    const ms   = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(1);
    const code = res.statusCode;
    const color = code >= 500 ? '\x1b[31m' : code >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}${req.method}\x1b[0m ${req.path} ${color}${code}\x1b[0m \x1b[2m${ms}ms\x1b[0m`);
  });
  next();
});

/* ── Routes ── */
app.use('/api/auth',         authRoutes);
app.use('/api/events',       eventRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/tickets',      ticketRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/loyalty',      loyaltyRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.1', ts: new Date().toISOString() });
});

/* ── 404 handler ── */
app.use((_req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

/* ── Global error handler ── */
app.use((err, _req, res, _next) => {
  console.error('\x1b[31m[ERROR]\x1b[0m', err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: status === 500 ? 'Erreur interne du serveur' : err.message,
  });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n\x1b[35m◆ BilletterieMa API v1.1\x1b[0m');
    console.log(`\x1b[36m  http://localhost:${PORT}/api\x1b[0m`);
    console.log('\x1b[2m  Admin: admin@billetterie.ma / Admin123!\x1b[0m\n');
  });
}

module.exports = app;
