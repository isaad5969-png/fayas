import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import EventCard from '../components/EventCard'
import { Icon } from '../components/Icons'

const STATS = [
  { label: 'Événements',    value: '50+',  icon: 'sparkles',    color: 'bg-purple-50 text-purple-600' },
  { label: 'Universités',   value: '10',   icon: 'graduation',  color: 'bg-blue-50   text-blue-600'   },
  { label: 'Villes',        value: '12',   icon: 'globe',       color: 'bg-emerald-50 text-emerald-600'},
  { label: 'Billets vendus',value: '2 000+',icon: 'ticket',     color: 'bg-amber-50  text-amber-600'  },
]

const FEATURES = [
  {
    icon: 'tools',
    title: 'Self-service',
    desc: 'Mettez votre événement en ligne en quelques minutes — gestion des billets, jauges et statistiques depuis un espace admin web.',
    accent: 'bg-purple-50 text-purple-600',
  },
  {
    icon: 'shield',
    title: 'Fiable & sécurisé',
    desc: 'Billets protégés, paiements sécurisés et confirmation instantanée par email. Zéro mauvaise surprise.',
    accent: 'bg-blue-50 text-blue-600',
  },
  {
    icon: 'rocket',
    title: 'Évolutif',
    desc: 'De 50 à 5 000 participants, la plateforme s\'adapte à votre événement sans aucune configuration supplémentaire.',
    accent: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: 'bolt',
    title: 'Ultra-rapide',
    desc: 'Interface optimisée pour mobile, réservation en 2 clics et chargement instantané — même en 3G.',
    accent: 'bg-amber-50 text-amber-600',
  },
]

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [universities,   setUniversities]   = useState([])
  const [loading,        setLoading]        = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/events?upcoming=true'),
      api.get('/universities'),
    ]).then(([evRes, uniRes]) => {
      const evData = evRes.data?.data ?? evRes.data
      setUpcomingEvents(Array.isArray(evData) ? evData.slice(0, 6) : [])
      setUniversities(uniRes.data.slice(0, 6))
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-up">

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-purple-800 via-purple-700 to-indigo-800 text-white overflow-hidden">

        {/* Abstract background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/40 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid md:grid-cols-2 gap-14 items-center">

          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20
                            px-4 py-1.5 rounded-full text-sm font-medium mb-8 text-white/90">
              <span className="text-base">🇲🇦</span>
              Plateforme N°1 de billetterie événementielle au Maroc
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
              Vivez les meilleures{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-yellow-300">soirées</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-yellow-400/25 -z-0 rounded" />
              </span>{' '}
              du Maroc
            </h1>

            <p className="text-white/70 text-lg mb-10 leading-relaxed max-w-lg">
              Galas, soirées, événements universitaires — réservez vos billets en quelques secondes pour les événements les plus exclusifs du Royaume.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/events"
                className="bg-white text-purple-700 font-bold px-7 py-3.5 rounded-xl
                           hover:bg-yellow-50 transition-all shadow-lg hover:shadow-xl
                           inline-flex items-center gap-2">
                Découvrir les événements
                <Icon name="arrow_right" className="w-4 h-4" />
              </Link>
              <Link to="/universities"
                className="border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl
                           hover:bg-white/10 backdrop-blur-sm transition-all
                           inline-flex items-center gap-2">
                <Icon name="graduation" className="w-4 h-4" />
                Soirées universitaires
              </Link>
            </div>
          </div>

          {/* Right — feature cards */}
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map(f => (
              <div key={f.title}
                className="bg-white/8 hover:bg-white/14 backdrop-blur-sm border border-white/10
                           rounded-2xl p-5 transition-all duration-200 group cursor-default">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.accent}`}>
                  <Icon name={f.icon} className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base mb-1.5">{f.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          STATS BAR
      ══════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8
                        grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          {STATS.map(s => (
            <div key={s.label} className="flex flex-col items-center gap-2 py-2 px-6">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                <Icon name={s.icon} className="w-5 h-5" strokeWidth={2} />
              </div>
              <span className="text-2xl font-extrabold text-gray-900 tabular-nums">{s.value}</span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          UPCOMING EVENTS
      ══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-18">
        <div className="flex items-end justify-between mb-10 pt-12">
          <div>
            <p className="text-purple-600 text-sm font-semibold uppercase tracking-widest mb-2">
              Billetterie
            </p>
            <h2 className="section-title">Événements à venir</h2>
            <p className="section-sub">Les galas, soirées et concerts les plus attendus du moment</p>
          </div>
          <Link to="/events"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold
                       text-purple-600 hover:text-purple-700 transition-colors">
            Voir tout
            <Icon name="arrow_right" className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <div className="h-52 animate-shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded-lg w-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        )}

        <div className="text-center mt-8 md:hidden">
          <Link to="/events" className="btn-primary">Voir tous les événements</Link>
        </div>
      </section>

      {/* ══════════════════════════════════
          UNIVERSITIES
      ══════════════════════════════════ */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 pt-6">
            <p className="text-purple-600 text-sm font-semibold uppercase tracking-widest mb-2">
              Campus
            </p>
            <h2 className="section-title">Soirées universitaires</h2>
            <p className="section-sub">Chaque université a ses propres événements exclusifs</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {universities.map(u => (
              <Link key={u.id} to={`/universities/${u.id}`}
                className="group bg-white rounded-2xl border border-gray-100 p-5 text-center
                           shadow-sm hover:shadow-md hover:-translate-y-1
                           transition-all duration-200">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center
                                text-white text-base font-extrabold shadow-sm"
                  style={{ backgroundColor: u.color }}>
                  {u.short_name.slice(0, 2)}
                </div>
                <p className="font-semibold text-gray-800 text-sm leading-tight
                              group-hover:text-purple-700 transition-colors">
                  {u.short_name}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">{u.city}</p>
                {u.event_count > 0 && (
                  <span className="mt-2 badge bg-purple-50 text-purple-600 text-[10px]">
                    {u.event_count} evt{u.event_count > 1 ? 's' : ''}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/universities" className="btn-secondary">
              Voir les 10 universités
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          CTA BANNER
      ══════════════════════════════════ */}
      <section className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white py-20 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
            Prêt à vivre des moments inoubliables ?
          </h2>
          <p className="text-white/65 text-lg mb-10 leading-relaxed">
            Créez votre compte gratuitement et accédez aux meilleures soirées du Maroc.
            Gagnez des BilletCoins à chaque achat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="bg-white text-purple-800 font-bold px-8 py-4 rounded-xl
                         hover:bg-yellow-50 transition-all shadow-lg inline-flex items-center gap-2 justify-center">
              <Icon name="sparkles" className="w-4 h-4" />
              Créer un compte gratuit
            </Link>
            <Link to="/events"
              className="border border-white/25 text-white font-semibold px-8 py-4 rounded-xl
                         hover:bg-white/10 transition-all inline-flex items-center gap-2 justify-center">
              Explorer les événements
              <Icon name="arrow_right" className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
