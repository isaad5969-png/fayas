import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/Icons'

/* ── Tier gradient CSS maps ── */
const TIER_STYLES = {
  Bronze:  { card: 'from-amber-700 via-amber-800 to-amber-950', text: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20',  ring: 'ring-amber-400', bar: 'bg-amber-500' },
  Silver:  { card: 'from-slate-400 via-slate-500 to-slate-700', text: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-900/20',  ring: 'ring-slate-400', bar: 'bg-slate-400' },
  Gold:    { card: 'from-yellow-400 via-amber-500 to-orange-600',text: 'text-amber-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', ring: 'ring-yellow-400', bar: 'bg-yellow-400' },
  Platine: { card: 'from-violet-600 via-purple-700 to-indigo-900',text: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', ring: 'ring-violet-400', bar: 'bg-violet-500' },
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-MA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Loyalty() {
  const { user, isAuthenticated } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('apercu')

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    api.get('/loyalty/me').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 dark:from-gray-950 to-indigo-100 dark:to-gray-900 transition-colors duration-300">
        <div className="text-center p-10 bg-white dark:bg-gray-900 rounded-3xl shadow-xl max-w-md border border-purple-100 dark:border-gray-800 animate-fade-up">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-200 dark:shadow-purple-900/40">
            <Icon name="gem" className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">Programme FayasCoins</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Connectez-vous pour accéder à votre espace fidélité et consulter vos avantages exclusifs.</p>
          <Link to="/login" className="btn-primary inline-flex">Se connecter</Link>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data) return null

  const { points, tier, nextTier, progress, allTiers, history, badges, stats } = data
  const style = TIER_STYLES[tier.name] || TIER_STYLES.Bronze

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-950 via-purple-50/30 dark:via-purple-900/10 to-indigo-50/40 dark:to-indigo-950/20 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ════════════════════════════════════
            HERO — Carte de fidélité premium
        ════════════════════════════════════ */}
        <div className="mb-10">

          {/* Header section */}
          <div className="text-center mb-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-4 py-2 rounded-full text-sm font-bold mb-4 border border-purple-200 dark:border-purple-800">
              <Icon name="gem" className="w-4 h-4" />
              Programme FayasCoins
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Votre carte de fidélité</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Chaque dirham dépensé vous rapproche du Platine</p>
          </div>

          {/* ── La carte premium (style carte bancaire) ── */}
          <div className="flex justify-center animate-scale-in">
            <div className={`relative w-full max-w-sm h-52 rounded-3xl bg-gradient-to-br ${style.card}
                            shadow-2xl overflow-hidden select-none`}
                 style={{ perspective: '1000px' }}>

              {/* Motifs décoratifs */}
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full bg-white/10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-white/5" />

              {/* Contenu carte */}
              <div className="relative h-full flex flex-col justify-between p-6">
                {/* Logo + Tier */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/60 text-xs font-medium tracking-widest uppercase">Fayas</p>
                    <p className="text-white font-extrabold text-lg leading-tight">FayasCoins</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl">{tier.emoji}</span>
                    <p className="text-white font-bold text-sm">{tier.name}</p>
                  </div>
                </div>

                {/* Points */}
                <div>
                  <p className="text-white/60 text-xs tracking-widest uppercase mb-1">Solde de points</p>
                  <p className="text-white font-extrabold text-4xl tabular-nums">
                    {points.toLocaleString('fr-MA')}
                    <span className="text-lg font-semibold text-white/70 ml-2">pts</span>
                  </p>
                </div>

                {/* Nom + réduction */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider">Titulaire</p>
                    <p className="text-white font-bold">{user?.name}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-1">
                    <p className="text-white font-extrabold text-lg">{tier.discount}%</p>
                    <p className="text-white/70 text-xs">réduction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Barre de progression vers le tier suivant ── */}
          {nextTier && (
            <div className="mt-6 max-w-sm mx-auto">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span className="font-semibold">{tier.emoji} {tier.name} — {points.toLocaleString()} pts</span>
                <span className="font-semibold">{nextTier.emoji} {nextTier.name} — {nextTier.min.toLocaleString()} pts</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${style.bar}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                Encore <span className="font-bold text-purple-700 dark:text-purple-400">{(nextTier.min - points).toLocaleString()} pts</span> pour atteindre {nextTier.emoji} <strong>{nextTier.name}</strong>
              </p>
            </div>
          )}
          {!nextTier && (
            <p className="text-center text-purple-700 dark:text-purple-400 font-bold mt-4 flex items-center justify-center gap-2">
              <Icon name="crown" className="w-5 h-5 text-yellow-500" />
              Niveau maximum atteint — Platine !
            </p>
          )}
        </div>

        {/* ════════ Onglets ════════ */}
        <div className="flex gap-1.5 mb-8 bg-white dark:bg-gray-900 rounded-2xl p-1.5 shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto transition-colors duration-300">
          {[
            { id: 'apercu',    label: 'Aperçu',     icon: 'chart'       },
            { id: 'badges',    label: 'Badges',     icon: 'award'       },
            { id: 'avantages', label: 'Avantages',  icon: 'gift'        },
            { id: 'historique',label: 'Historique', icon: 'history'     },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max inline-flex items-center justify-center gap-2
                          px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              <Icon name={tab.icon} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ════════ Aperçu ════════ */}
        {activeTab === 'apercu' && (
          <div className="space-y-6">
            {/* Stats 4 cols */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: '💰', value: `${points.toLocaleString()}`, label: 'FayasCoins',    color: 'text-purple-700 dark:text-purple-400' },
                { icon: '🎫', value: stats.totalTickets,           label: 'Billets achetés', color: 'text-blue-700 dark:text-blue-400'   },
                { icon: '🏙️', value: stats.citiesVisited.length,   label: 'Villes visitées', color: 'text-emerald-700 dark:text-emerald-400'},
                { icon: '💳', value: `${stats.totalSpent} MAD`,    label: 'Total dépensé',   color: 'text-amber-700 dark:text-amber-400'  },
              ].map(s => (
                <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 text-center transition-colors duration-300">
                  <p className="text-3xl mb-2">{s.icon}</p>
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Comment gagner des points */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                <Icon name="bolt" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Comment gagner des FayasCoins
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: '🎫', title: 'Achat standard',   desc: '1 MAD = 1 FayasCoin',            badge: '×1'   },
                  { icon: '⭐', title: 'Achat VIP',         desc: '1 MAD VIP = 1.5 FayasCoins',    badge: '×1.5' },
                  { icon: '🎉', title: '1er achat ever',   desc: 'Bonus de bienvenue',              badge: '+100' },
                  { icon: '🔥', title: 'Tous les 5 achats',desc: 'Bonus de régularité',             badge: '+150' },
                  { icon: '💎', title: 'Tier Platine',      desc: 'Multiplicateur permanent',        badge: '×3'   },
                  { icon: '🥇', title: 'Tier Gold',         desc: 'Multiplicateur tickets VIP',      badge: '×2'   },
                ].map(m => (
                  <div key={m.title} className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/50">
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{m.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</p>
                    </div>
                    <span className="font-extrabold text-purple-700 dark:text-purple-400 text-sm bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded-lg">{m.badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════ Badges ════════ */}
        {activeTab === 'badges' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-lg mb-6 flex items-center gap-2">
              <Icon name="award" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Vos badges — {badges.filter(b => b.earned).length}/{badges.length} débloqués
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {badges.map(badge => (
                <div key={badge.id}
                  className={`rounded-2xl p-4 text-center border-2 transition-all ${
                    badge.earned
                      ? 'border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 shadow-sm'
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 opacity-50 grayscale'
                  }`}>
                  <div className={`text-4xl mb-2 ${badge.earned ? '' : 'filter grayscale'}`}>{badge.emoji}</div>
                  <p className={`font-extrabold text-sm ${badge.earned ? 'text-purple-800 dark:text-purple-300' : 'text-gray-400 dark:text-gray-600'}`}>{badge.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{badge.desc}</p>
                  {badge.earned && (
                    <span className="inline-block mt-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-semibold">✓ Débloqué</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════ Avantages par tier ════════ */}
        {activeTab === 'avantages' && (
          <div className="space-y-4">
            {allTiers.map(t => {
              const s = TIER_STYLES[t.name] || TIER_STYLES.Bronze
              const isCurrent = t.name === tier.name
              return (
                <div key={t.name}
                  className={`rounded-2xl overflow-hidden border-2 transition-all ${
                    isCurrent ? 'border-purple-500 shadow-lg shadow-purple-100 dark:shadow-purple-900/30' : 'border-gray-100 dark:border-gray-800'
                  }`}>
                  <div className={`bg-gradient-to-r ${s.card} px-6 py-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{t.emoji}</span>
                      <div>
                        <p className="text-white font-extrabold text-lg">{t.name}</p>
                        <p className="text-white/70 text-xs">
                          {t.max === Infinity ? `${t.min.toLocaleString()}+ pts` : `${t.min.toLocaleString()} – ${t.max.toLocaleString()} pts`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-extrabold text-2xl">{t.discount}%</p>
                      <p className="text-white/70 text-xs">réduction</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 px-6 py-4 transition-colors duration-300">
                    <ul className="space-y-2">
                      {t.perks.map(perk => (
                        <li key={perk} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="text-purple-500 dark:text-purple-400 mt-0.5 shrink-0">✓</span>
                          {perk}
                        </li>
                      ))}
                    </ul>
                    {isCurrent && (
                      <div className="mt-4 inline-flex items-center gap-2 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        ✦ Votre niveau actuel
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ════════ Historique des points ════════ */}
        {activeTab === 'historique' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon name="history" className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Historique des FayasCoins gagnés
              </h3>
            </div>
            {history.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon name="ticket" className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="font-semibold text-gray-600 dark:text-gray-400">Aucun achat pour l'instant</p>
                <Link to="/events" className="btn-primary inline-flex mt-4 text-sm">
                  Découvrir les événements
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {history.map(h => (
                  <div key={h.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      h.ticket_type === 'vip'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    }`}>
                      <Icon name={h.ticket_type === 'vip' ? 'star' : 'ticket'} className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">{h.event_title}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{h.city} · {formatDate(h.purchased_at)} · {h.quantity} billet(s) {h.ticket_type.toUpperCase()}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-purple-700 dark:text-purple-400">+{h.points_earned.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">FayasCoins</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
