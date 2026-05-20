import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import EventCard from '../components/EventCard'
import { Icon } from '../components/Icons'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useCountUp } from '../hooks/useCountUp'

/* ── Animated stat item ── */
function StatItem({ label, num, suffix, icon, color, delay = 0 }) {
  const [ref, visible] = useScrollReveal(0.3)
  const count = useCountUp(num, 1800, visible)
  const display = num >= 1000
    ? count.toLocaleString('fr-FR') + suffix
    : count + suffix

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`flex flex-col items-center gap-2 py-2 px-6
                  transition-all duration-700
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon name={icon} className="w-5 h-5" strokeWidth={2} />
      </div>
      <span className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">{display}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</span>
    </div>
  )
}

const STATS = [
  { label: 'Événements',    num: 50,   suffix: '+', icon: 'sparkles',   color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  { label: 'Universités',   num: 10,   suffix: '',  icon: 'graduation', color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'       },
  { label: 'Villes',        num: 12,   suffix: '',  icon: 'globe',      color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'},
  { label: 'Billets vendus',num: 2000, suffix: '+', icon: 'ticket',     color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'    },
]

const CITIES = [
  { name: 'Casablanca', emoji: '🌆', desc: 'La capitale économique',  bg: 'linear-gradient(135deg,#BE123C 0%,#EA580C 100%)', cls: 'col-span-2 md:col-span-2 md:row-span-2', featured: true,  count: 6 },
  { name: 'Marrakech',  emoji: '🌴', desc: 'La ville rouge',          bg: 'linear-gradient(135deg,#92400E 0%,#D97706 100%)', cls: 'col-span-2 md:col-span-1 md:row-span-2', featured: true,  count: 8 },
  { name: 'Rabat',      emoji: '🏛️', desc: 'La capitale du Royaume',  bg: 'linear-gradient(135deg,#1D4ED8 0%,#0891B2 100%)', cls: 'col-span-1',                             featured: false, count: 5 },
  { name: 'Agadir',     emoji: '🏖️', desc: 'La perle du Souss',       bg: 'linear-gradient(135deg,#0D9488 0%,#10B981 100%)', cls: 'col-span-1',                             featured: false, count: 4 },
  { name: 'Fès',        emoji: '🕌', desc: 'La capitale spirituelle', bg: 'linear-gradient(135deg,#5B21B6 0%,#7C3AED 100%)', cls: 'col-span-1',                             featured: false, count: 3 },
  { name: 'Tanger',     emoji: '⚓',  desc: "La porte de l'Europe",   bg: 'linear-gradient(135deg,#0369A1 0%,#0EA5E9 100%)', cls: 'col-span-1',                             featured: false, count: 2 },
  { name: 'Essaouira',  emoji: '🌊', desc: 'La cité des alizés',      bg: 'linear-gradient(135deg,#0E7490 0%,#06B6D4 100%)', cls: 'col-span-2',                             featured: false, count: 2 },
  { name: 'Kénitra',    emoji: '🎓', desc: 'La ville étudiante',      bg: 'linear-gradient(135deg,#3730A3 0%,#6D28D9 100%)', cls: 'col-span-1',                             featured: false, count: 2 },
  { name: 'Meknès',     emoji: '🦁', desc: 'La ville impériale',      bg: 'linear-gradient(135deg,#C2410C 0%,#F59E0B 100%)', cls: 'col-span-1',                             featured: false, count: 2 },
  { name: 'Oujda',      emoji: '🎵', desc: "La porte de l'Est",       bg: 'linear-gradient(135deg,#9D174D 0%,#F43F5E 100%)', cls: 'col-span-1',                             featured: false, count: 2 },
  { name: 'Tétouan',    emoji: '🏔️', desc: 'La colombe du Nord',      bg: 'linear-gradient(135deg,#065F46 0%,#10B981 100%)', cls: 'col-span-1',                             featured: false, count: 1 },
]

const FEATURES = [
  { icon: 'tools',  title: 'Self-service',     desc: 'Mettez votre événement en ligne en quelques minutes — gestion des billets, jauges et statistiques.', accent: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  { icon: 'shield', title: 'Fiable & sécurisé',desc: 'Billets protégés, paiements sécurisés et confirmation instantanée par email.',                         accent: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'       },
  { icon: 'rocket', title: 'Évolutif',          desc: 'De 50 à 5 000 participants, la plateforme s\'adapte sans aucune configuration supplémentaire.',        accent: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'},
  { icon: 'bolt',   title: 'Ultra-rapide',      desc: 'Interface optimisée pour mobile, réservation en 2 clics et chargement instantané — même en 3G.',       accent: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'    },
]

export default function Home() {
  const navigate = useNavigate()
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [universities,   setUniversities]   = useState([])
  const [loading,        setLoading]        = useState(true)

  // Scroll reveal refs for sections
  const [eventsRef,  eventsVisible]  = useScrollReveal(0.05)
  const [citiesRef,  citiesVisible]  = useScrollReveal(0.05)
  const [uniRef,     uniVisible]     = useScrollReveal(0.05)
  const [ctaRef,     ctaVisible]     = useScrollReveal(0.2)

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

        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl animate-float-slow" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl animate-float" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/40 blur-3xl animate-blob" />
          <div className="absolute top-10 left-1/4 w-32 h-32 rounded-full bg-yellow-400/10 blur-2xl animate-float-fast" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid md:grid-cols-2 gap-14 items-center">

          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20
                            px-4 py-1.5 rounded-full text-sm font-medium mb-8 text-white/90
                            fade-slide-left anim-delay-100">
              <span className="text-base">🇲🇦</span>
              Plateforme N°1 de billetterie événementielle au Maroc
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight
                           fade-blur-in anim-delay-200">
              Vivez les meilleures{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-yellow-300">soirées</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-yellow-400/25 -z-0 rounded" />
              </span>{' '}
              du Maroc
            </h1>

            <p className="text-white/70 text-lg mb-10 leading-relaxed max-w-lg
                          fade-slide-up anim-delay-300">
              Galas, soirées, événements universitaires — réservez vos billets en quelques secondes pour les événements les plus exclusifs du Royaume.
            </p>

            <div className="flex flex-wrap gap-3 fade-slide-up anim-delay-400">
              <Link to="/events"
                className="bg-white text-purple-700 font-bold px-7 py-3.5 rounded-xl
                           hover:bg-yellow-50 transition-all shadow-lg hover:shadow-xl hover:scale-105
                           inline-flex items-center gap-2 duration-200">
                Découvrir les événements
                <Icon name="arrow_right" className="w-4 h-4" />
              </Link>
              <Link to="/universities"
                className="border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl
                           hover:bg-white/10 backdrop-blur-sm transition-all hover:scale-105 duration-200
                           inline-flex items-center gap-2">
                <Icon name="graduation" className="w-4 h-4" />
                Soirées universitaires
              </Link>
            </div>
          </div>

          {/* Right — feature cards */}
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                className="bg-white/8 hover:bg-white/14 backdrop-blur-sm border border-white/10
                           rounded-2xl p-5 transition-all duration-300 group cursor-default
                           hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20
                           fade-zoom"
                style={{ animationDelay: `${0.25 + i * 0.1}s` }}>
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
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8
                        grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800">
          {STATS.map((s, i) => (
            <StatItem key={s.label} {...s} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          CITIES  — Bento Grid
      ══════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={citiesRef}>

            {/* ── Header ── */}
            <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10
                             transition-all duration-700
                             ${citiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30
                                text-purple-600 dark:text-purple-400 text-[11px] font-bold uppercase
                                tracking-widest px-3.5 py-1.5 rounded-full mb-4
                                border border-purple-100 dark:border-purple-800">
                  <Icon name="map" className="w-3 h-3" />
                  11 destinations au Maroc
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Explorez par ville
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Cliquez sur une ville pour voir ses événements exclusifs
                </p>
              </div>
              <Link to="/events"
                className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold
                           text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300
                           transition-colors group">
                Tous les événements
                <Icon name="arrow_right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* ── Bento Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[165px] gap-3 md:gap-4">
              {CITIES.map((c, i) => (
                <div key={c.name}
                  className={`${c.cls} transition-all duration-700
                              ${citiesVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
                  style={{ transitionDelay: `${i * 60}ms` }}>

                  <button
                    onClick={() => navigate(`/events?city=${encodeURIComponent(c.name)}`)}
                    style={{ background: c.bg }}
                    className="group relative overflow-hidden rounded-2xl w-full h-full text-left
                               transition-all duration-300
                               hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/30
                               focus:outline-none">

                    {/* Decorative blob top-right */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10
                                    group-hover:scale-125 group-hover:bg-white/15
                                    transition-all duration-700 ease-out" />
                    {/* Decorative blob bottom-left */}
                    <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-black/10" />
                    {/* Shine sweep on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0
                                    opacity-0 group-hover:opacity-100
                                    transition-opacity duration-500 pointer-events-none" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-between p-4 md:p-5">

                      {/* Top row */}
                      <div className="flex items-start justify-between">
                        <span className={`filter drop-shadow-lg
                                         group-hover:scale-110 transition-transform duration-300 origin-left
                                         ${c.featured ? 'text-5xl' : 'text-3xl'}`}>
                          {c.emoji}
                        </span>
                        <span className="flex items-center gap-1 bg-black/25 backdrop-blur-sm
                                         text-white text-[11px] font-bold px-2.5 py-1
                                         rounded-full border border-white/20">
                          <Icon name="ticket" className="w-3 h-3 opacity-80" />
                          {c.count} évt{c.count > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Bottom row */}
                      <div>
                        <p className={`text-white font-extrabold leading-tight
                                       ${c.featured ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
                          {c.name}
                        </p>
                        <p className="text-white/60 text-xs mt-0.5 hidden sm:block">{c.desc}</p>
                        <div className="mt-2.5 flex items-center gap-1 text-white/0 group-hover:text-white/90
                                        text-xs font-semibold -translate-y-1 group-hover:translate-y-0
                                        transition-all duration-200">
                          Voir les événements
                          <Icon name="arrow_right" className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          UPCOMING EVENTS
      ══════════════════════════════════ */}
      <section ref={eventsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-18">
        <div className={`flex items-end justify-between mb-10 pt-12 transition-all duration-700
                         ${eventsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div>
            <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">
              Billetterie
            </p>
            <h2 className="section-title">Événements à venir</h2>
            <p className="section-sub">Les galas, soirées et concerts les plus attendus du moment</p>
          </div>
          <Link to="/events"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold
                       text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300
                       transition-colors group">
            Voir tout
            <Icon name="arrow_right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="h-52 animate-shimmer dark:animate-shimmer" />
                <div className="p-5 space-y-3 bg-white dark:bg-gray-900">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-lg w-1/2 animate-pulse" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-lg w-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((e, i) => (
              <div
                key={e.id}
                className={`transition-all duration-700 ${eventsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <EventCard event={e} />
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8 md:hidden">
          <Link to="/events" className="btn-primary">Voir tous les événements</Link>
        </div>
      </section>

      {/* ══════════════════════════════════
          UNIVERSITIES
      ══════════════════════════════════ */}
      <section className="bg-gradient-to-b from-gray-50 dark:from-gray-900 to-white dark:to-gray-950 py-18 transition-colors duration-300">
        <div ref={uniRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-10 pt-6 transition-all duration-700
                           ${uniVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">
              Campus
            </p>
            <h2 className="section-title">Soirées universitaires</h2>
            <p className="section-sub">Chaque université a ses propres événements exclusifs</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {universities.map((u, i) => (
              <Link key={u.id} to={`/universities/${u.id}`}
                className={`group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 text-center
                           shadow-sm hover:shadow-md dark:hover:shadow-purple-900/20 hover:-translate-y-1.5
                           transition-all duration-300
                           ${uniVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}
                style={{ transitionDelay: `${i * 60}ms`, transitionDuration: '600ms' }}>
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center
                                text-white text-base font-extrabold shadow-sm group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: u.color }}>
                  {u.short_name.slice(0, 2)}
                </div>
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm leading-tight
                              group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                  {u.short_name}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{u.city}</p>
                {u.event_count > 0 && (
                  <span className="mt-2 badge bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px]">
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
      <section ref={ctaRef} className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white py-20 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl animate-float" />
        </div>
        <div className={`relative max-w-3xl mx-auto px-4 text-center
                         transition-all duration-1000
                         ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
            Prêt à vivre des moments inoubliables ?
          </h2>
          <p className="text-white/65 text-lg mb-10 leading-relaxed">
            Créez votre compte gratuitement et accédez aux meilleures soirées du Maroc.
            Gagnez des FayasCoins à chaque achat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="bg-white text-purple-800 font-bold px-8 py-4 rounded-xl
                         hover:bg-yellow-50 transition-all shadow-lg hover:shadow-xl
                         hover:scale-105 duration-200 inline-flex items-center gap-2 justify-center">
              <Icon name="sparkles" className="w-4 h-4" />
              Créer un compte gratuit
            </Link>
            <Link to="/events"
              className="border border-white/25 text-white font-semibold px-8 py-4 rounded-xl
                         hover:bg-white/10 transition-all hover:scale-105 duration-200
                         inline-flex items-center gap-2 justify-center">
              Explorer les événements
              <Icon name="arrow_right" className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
