const express = require('express');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/* ── Tier configuration ── */
const TIERS = [
  {
    name: 'Bronze', emoji: '🥉', min: 0, max: 499,
    color: '#CD7F32', gradient: 'from-amber-700 to-amber-900',
    discount: 5, perks: [
      'Réduction de 5% sur chaque billet',
      'Newsletter des événements en avant-première',
      'Accès à l\'historique complet de vos réservations',
    ],
  },
  {
    name: 'Silver', emoji: '🥈', min: 500, max: 1999,
    color: '#94A3B8', gradient: 'from-slate-400 to-slate-600',
    discount: 10, perks: [
      'Réduction de 10% sur chaque billet',
      'Préventes prioritaires 48h avant ouverture',
      'Support client dédié par WhatsApp',
      'Badge Silver sur votre profil',
    ],
  },
  {
    name: 'Gold', emoji: '🥇', min: 2000, max: 4999,
    color: '#EAB308', gradient: 'from-yellow-400 to-amber-600',
    discount: 15, perks: [
      'Réduction de 15% sur chaque billet',
      'Upgrade VIP gratuit une fois par mois',
      'Invitations aux événements pré-lancement',
      'Accès aux soirées Gold-only exclusives',
      'Points × 2 sur les tickets VIP',
    ],
  },
  {
    name: 'Platine', emoji: '💎', min: 5000, max: Infinity,
    color: '#8B5CF6', gradient: 'from-violet-500 to-purple-800',
    discount: 20, perks: [
      'Réduction de 20% sur chaque billet',
      '1 billet offert par trimestre (événement au choix)',
      'Accès Platine-Only — événements secrets non listés',
      'Conciergerie événementielle dédiée',
      'Points × 3 sur tous les achats',
      'Cadeau d\'anniversaire exclusif',
    ],
  },
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

/* ─────────────────────────────────────────────
   GET /api/loyalty/me
   Retourne le profil de fidélité complet
───────────────────────────────────────────── */
router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT loyalty_points, created_at FROM users WHERE id = ?').get(req.user.id);
  const points = user?.loyalty_points || 0;

  /* Historique des gains (tickets) */
  const history = db.prepare(`
    SELECT
      t.id, t.ticket_type, t.quantity, t.total_price, t.purchased_at,
      e.title as event_title, e.type as event_type, e.city
    FROM tickets t
    JOIN events e ON t.event_id = e.id
    WHERE t.user_id = ?
    ORDER BY t.purchased_at DESC
    LIMIT 15
  `).all(req.user.id);

  /* Calcul des points gagnés par achat */
  const historyWithPoints = history.map(t => ({
    ...t,
    points_earned: t.ticket_type === 'vip'
      ? Math.round(t.total_price * 1.5)
      : Math.round(t.total_price),
  }));

  /* Badges / achievements */
  const citiesVisited  = [...new Set(history.map(t => t.city))];
  const typesAttended  = [...new Set(history.map(t => t.event_type))];
  const totalTickets   = history.reduce((s, t) => s + t.quantity, 0);
  const totalSpent     = history.reduce((s, t) => s + t.total_price, 0);

  const badges = [];
  if (citiesVisited.length >= 1) badges.push({ id: 'first_city',   label: 'Premier Pas',     emoji: '👣', desc: 'Première réservation dans une ville',     earned: true  });
  if (citiesVisited.length >= 3) badges.push({ id: 'traveler',     label: 'Grand Voyageur',  emoji: '✈️', desc: '3 villes différentes explorées',           earned: true  });
  if (citiesVisited.length >= 5) badges.push({ id: 'explorer',     label: 'Explorateur',     emoji: '🗺️', desc: '5 villes marocaines explorées',             earned: true  });
  if (typesAttended.includes('gala'))      badges.push({ id: 'gala_vibe',   label: 'Gala Vibes',   emoji: '✨', desc: 'Participant à un gala de prestige',         earned: true  });
  if (typesAttended.includes('concert'))   badges.push({ id: 'music_lover', label: 'Music Lover',  emoji: '🎵', desc: 'Concert réservé',                           earned: true  });
  if (typesAttended.includes('universite'))badges.push({ id: 'campus_star', label: 'Campus Star',  emoji: '🎓', desc: 'Soirée universitaire',                       earned: true  });
  if (totalTickets >= 5)  badges.push({ id: 'regular',      label: 'Habitué',         emoji: '🔑', desc: '5 billets achetés au total',                earned: true  });
  if (totalTickets >= 10) badges.push({ id: 'vip_member',   label: 'VIP Member',      emoji: '⭐', desc: '10 billets achetés au total',               earned: true  });
  if (totalSpent  >= 1000)badges.push({ id: 'big_spender',  label: 'Big Spender',     emoji: '💰', desc: '1 000 MAD dépensés au total',               earned: true  });
  /* Badges non encore débloqués */
  if (!badges.find(b => b.id === 'traveler'))    badges.push({ id: 'traveler',    label: 'Grand Voyageur', emoji: '✈️', desc: `${3 - citiesVisited.length} ville(s) de plus`,   earned: false });
  if (!badges.find(b => b.id === 'regular'))     badges.push({ id: 'regular',     label: 'Habitué',        emoji: '🔑', desc: `Encore ${5 - totalTickets} billet(s)`,            earned: false });
  if (!badges.find(b => b.id === 'big_spender')) badges.push({ id: 'big_spender', label: 'Big Spender',    emoji: '💰', desc: `Encore ${(1000 - totalSpent).toFixed(0)} MAD`,     earned: false });

  res.json({
    points,
    tier:         getTier(points),
    nextTier:     getNextTier(points),
    progress:     getProgress(points),
    allTiers:     TIERS,
    history:      historyWithPoints,
    badges,
    stats: { citiesVisited, typesAttended, totalTickets, totalSpent: Math.round(totalSpent) },
  });
});

/* ─────────────────────────────────────────────
   GET /api/loyalty/tiers  (public)
───────────────────────────────────────────── */
router.get('/tiers', (_req, res) => res.json(TIERS));

module.exports = router;
