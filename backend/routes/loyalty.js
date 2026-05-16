const express = require('express');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

const TIERS = [
  { name: 'Bronze', emoji: '🥉', min: 0, max: 499, color: '#CD7F32', gradient: 'from-amber-700 to-amber-900', discount: 5, perks: ['Réduction de 5% sur chaque billet', 'Newsletter des événements en avant-première'] },
  { name: 'Silver', emoji: '🥈', min: 500, max: 1999, color: '#94A3B8', gradient: 'from-slate-400 to-slate-600', discount: 10, perks: ['Réduction de 10% sur chaque billet', 'Préventes prioritaires 48h avant ouverture'] },
  { name: 'Gold', emoji: '🥇', min: 2000, max: 4999, color: '#EAB308', gradient: 'from-yellow-400 to-amber-600', discount: 15, perks: ['Réduction de 15% sur chaque billet', 'Upgrade VIP gratuit une fois par mois'] },
  { name: 'Platine', emoji: '💎', min: 5000, max: Infinity, color: '#8B5CF6', gradient: 'from-violet-500 to-purple-800', discount: 20, perks: ['Réduction de 20% sur chaque billet', 'Conciergerie événementielle dédiée'] },
];

function getTier(points) {
  return TIERS.find(t => points >= t.min && points <= t.max) || TIERS[0];
}

function getNextTier(points) {
  const idx = TIERS.findIndex(t => points >= t.min && points <= t.max);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

function getProgress(points) {
  const tier = getTier(points);
  const next = getNextTier(points);
  if (!next) return 100;
  return Math.round(((points - tier.min) / (next.min - tier.min)) * 100);
}

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await db.one('SELECT loyalty_points, created_at FROM users WHERE id = $1', [req.user.id]);
  const points = user?.loyalty_points || 0;

  const history = await db.many(`
    SELECT
      t.id, t.ticket_type, t.quantity, t.total_price, t.purchased_at,
      e.title as event_title, e.type as event_type, e.city
    FROM tickets t
    JOIN events e ON t.event_id = e.id
    WHERE t.user_id = $1
    ORDER BY t.purchased_at DESC
    LIMIT 15
  `, [req.user.id]);

  const historyWithPoints = history.map(t => ({
    ...t,
    points_earned: t.ticket_type === 'vip'
      ? Math.round(Number(t.total_price) * 1.5)
      : Math.round(Number(t.total_price)),
  }));

  const citiesVisited = [...new Set(history.map(t => t.city))];
  const typesAttended = [...new Set(history.map(t => t.event_type))];
  const totalTickets = history.reduce((s, t) => s + t.quantity, 0);
  const totalSpent = history.reduce((s, t) => s + Number(t.total_price), 0);

  const badges = [];
  if (citiesVisited.length >= 1) badges.push({ id: 'first_city', label: 'Premier Pas', emoji: '👣', desc: 'Première réservation dans une ville', earned: true });
  if (citiesVisited.length >= 3) badges.push({ id: 'traveler', label: 'Grand Voyageur', emoji: '✈️', desc: '3 villes différentes explorées', earned: true });
  if (typesAttended.includes('gala')) badges.push({ id: 'gala_vibe', label: 'Gala Vibes', emoji: '✨', desc: 'Participant à un gala de prestige', earned: true });
  if (typesAttended.includes('concert')) badges.push({ id: 'music_lover', label: 'Music Lover', emoji: '🎵', desc: 'Concert réservé', earned: true });
  if (typesAttended.includes('universite')) badges.push({ id: 'campus_star', label: 'Campus Star', emoji: '🎓', desc: 'Soirée universitaire', earned: true });
  if (totalTickets >= 5) badges.push({ id: 'regular', label: 'Habitué', emoji: '🔑', desc: '5 billets achetés au total', earned: true });
  if (totalSpent >= 1000) badges.push({ id: 'big_spender', label: 'Big Spender', emoji: '💰', desc: '1 000 MAD dépensés au total', earned: true });
  if (!badges.find(b => b.id === 'traveler')) badges.push({ id: 'traveler', label: 'Grand Voyageur', emoji: '✈️', desc: `${3 - citiesVisited.length} ville(s) de plus`, earned: false });
  if (!badges.find(b => b.id === 'regular')) badges.push({ id: 'regular', label: 'Habitué', emoji: '🔑', desc: `Encore ${5 - totalTickets} billet(s)`, earned: false });
  if (!badges.find(b => b.id === 'big_spender')) badges.push({ id: 'big_spender', label: 'Big Spender', emoji: '💰', desc: `Encore ${(1000 - totalSpent).toFixed(0)} MAD`, earned: false });

  res.json({
    points,
    tier: getTier(points),
    nextTier: getNextTier(points),
    progress: getProgress(points),
    allTiers: TIERS,
    history: historyWithPoints,
    badges,
    stats: { citiesVisited, typesAttended, totalTickets, totalSpent: Math.round(totalSpent) },
  });
}));

router.get('/tiers', (_req, res) => res.json(TIERS));

module.exports = router;
