import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import EventCard from '../components/EventCard'
import { Icon } from '../components/Icons'
import { CITY_GRAPHICS } from '../components/CityGraphic'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useCountUp } from '../hooks/useCountUp'
import NightlifeIntro3D from '../components/LazyNightlifeIntro3D'
import toast from 'react-hot-toast'

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
      <div className="stat-pill-v2-icn v" style={{ width: 36, height: 36, borderRadius: '10px' }}>
        <Icon name={icon} className="w-5 h-5" strokeWidth={2} />
      </div>
      <span className="text-2xl font-extrabold tabular-nums" style={{ color: 'var(--v2-tx1)' }}>{display}</span>
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--v2-tx3)' }}>{label}</span>
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
  { name: 'Casablanca', desc: 'La capitale économique',  bg: 'linear-gradient(135deg,#BE123C 0%,#EA580C 100%)', cls: 'col-span-2 md:col-span-2 md:row-span-2', featured: true,  count: 6, region: 'cote',      tag: 'Trendy',   vibe: 'Métropole nocturne', image: 'https://images.unsplash.com/photo-1538230575309-59dfc388ae36?auto=format&fit=crop&w=1400&q=85' },
  { name: 'Marrakech',  desc: 'La ville rouge',          bg: 'linear-gradient(135deg,#92400E 0%,#D97706 100%)', cls: 'col-span-2 md:col-span-1 md:row-span-2', featured: true,  count: 8, region: 'centre',    tag: 'Trendy',   vibe: 'Glamour & magie',   image: 'https://images.unsplash.com/photo-1708823081494-3e5bbd2ce931?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Rabat',      desc: 'La capitale du Royaume',  bg: 'linear-gradient(135deg,#1D4ED8 0%,#0891B2 100%)', cls: 'col-span-1',                             featured: false, count: 5, region: 'cote',      tag: 'Hot',      vibe: null,                image: 'https://images.unsplash.com/photo-1763838546027-5ea880df8fbe?auto=format&fit=crop&w=900&q=85' },
  { name: 'Agadir',     desc: 'La perle du Souss',       bg: 'linear-gradient(135deg,#0D9488 0%,#10B981 100%)', cls: 'col-span-1',                             featured: false, count: 4, region: 'sud',       tag: 'Hot',      vibe: null,                image: 'https://images.unsplash.com/photo-1562874732-260714dfe537?auto=format&fit=crop&w=900&q=85' },
  { name: 'Fès',        desc: 'La capitale spirituelle', bg: 'linear-gradient(135deg,#5B21B6 0%,#7C3AED 100%)', cls: 'col-span-1',                             featured: false, count: 3, region: 'interieur', tag: 'Culture',  vibe: null,                image: 'https://images.unsplash.com/photo-1767936925033-9a5b59925613?auto=format&fit=crop&w=900&q=85' },
  { name: 'Tanger',     desc: "La porte de l'Europe",    bg: 'linear-gradient(135deg,#0369A1 0%,#0EA5E9 100%)', cls: 'col-span-1',                             featured: false, count: 2, region: 'nord',      tag: null,       vibe: null,                image: 'https://images.unsplash.com/photo-1582919534700-acf2374f10d3?auto=format&fit=crop&w=900&q=85' },
  { name: 'Essaouira',  desc: 'La cité des alizés',      bg: 'linear-gradient(135deg,#0E7490 0%,#06B6D4 100%)', cls: 'col-span-2',                             featured: false, count: 2, region: 'cote',      tag: 'Chill',    vibe: null,                image: 'https://images.unsplash.com/photo-1555686367-56d5186965d5?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Kénitra',    desc: 'La ville étudiante',      bg: 'linear-gradient(135deg,#3730A3 0%,#6D28D9 100%)', cls: 'col-span-1',                             featured: false, count: 2, region: 'cote',      tag: 'Étudiant', vibe: null,                image: 'https://images.unsplash.com/photo-1740708085335-05fb442c089a?auto=format&fit=crop&w=900&q=85' },
  { name: 'Meknès',     desc: 'La ville impériale',      bg: 'linear-gradient(135deg,#C2410C 0%,#F59E0B 100%)', cls: 'col-span-1',                             featured: false, count: 2, region: 'interieur', tag: null,       vibe: null,                image: 'https://images.unsplash.com/photo-1706793989006-f0238c69f4a2?auto=format&fit=crop&w=900&q=85' },
  { name: 'Oujda',      desc: "La porte de l'Est",       bg: 'linear-gradient(135deg,#9D174D 0%,#F43F5E 100%)', cls: 'col-span-1',                             featured: false, count: 2, region: 'nord',      tag: null,       vibe: null,                image: 'https://images.unsplash.com/photo-1632658810488-f3581ce5a249?auto=format&fit=crop&w=900&q=85' },
  { name: 'Tétouan',    desc: 'La colombe du Nord',      bg: 'linear-gradient(135deg,#065F46 0%,#10B981 100%)', cls: 'col-span-1',                             featured: false, count: 1, region: 'nord',      tag: null,       vibe: null,                image: 'https://images.unsplash.com/photo-1579894461465-e8cdbe670cd1?auto=format&fit=crop&w=900&q=85' },
]

const REGIONS = [
  { id: 'all',       label: 'Toutes les régions', icon: 'globe',    color: 'from-purple-500 to-pink-500' },
  { id: 'cote',      label: 'Côte Atlantique',    icon: 'map',      color: 'from-cyan-500 to-blue-600' },
  { id: 'nord',      label: 'Nord',               icon: 'flag',     color: 'from-emerald-500 to-teal-600' },
  { id: 'centre',    label: 'Centre',             icon: 'sparkles', color: 'from-amber-500 to-orange-600' },
  { id: 'sud',       label: 'Sud',                icon: 'sun',      color: 'from-rose-500 to-red-600' },
  { id: 'interieur', label: 'Intérieur',          icon: 'building', color: 'from-violet-500 to-purple-600' },
]

const FEATURES = [
  { icon: 'tools',  title: 'Self-service',     desc: 'Mettez votre événement en ligne en quelques minutes — gestion des billets, jauges et statistiques.', accent: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  { icon: 'shield', title: 'Fiable & sécurisé',desc: 'Billets protégés, paiements sécurisés et confirmation instantanée par email.',                         accent: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'       },
  { icon: 'rocket', title: 'Évolutif',          desc: 'De 50 à 5 000 participants, la plateforme s\'adapte sans aucune configuration supplémentaire.',        accent: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'},
  { icon: 'bolt',   title: 'Ultra-rapide',      desc: 'Interface optimisée pour mobile, réservation en 2 clics et chargement instantané — même en 3G.',       accent: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'    },
]

/* ─────────────────────────────────────
   NEWSLETTER V2
───────────────────────────────────── */
function NewsletterV2() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return toast.error('Email invalide')
    setLoading(true)
    setTimeout(() => {
      toast.success('Inscription réussie ! Vous recevrez nos meilleures soirées 💌')
      setEmail('')
      setLoading(false)
    }, 800)
  }

  return (
    <div className="newsletter-v2">
      <div style={{ position: 'relative', zIndex: 1 }}>
        <span className="kicker-v2 mb-3">Newsletter</span>
        <h3 className="text-2xl md:text-3xl font-extrabold mt-3 mb-2"
          style={{ color: 'var(--v2-tx1)', letterSpacing: '-0.02em' }}>
          Restez à l'affût des meilleures soirées
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--v2-tx2)', lineHeight: 1.65, maxWidth: '400px' }}>
          Recevez chaque semaine notre sélection d'événements exclusifs, en avant-première.
        </p>
      </div>
      <form className="newsletter-v2-form" onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="votre@email.ma"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : "S'inscrire"}
        </button>
      </form>
    </div>
  )
}

/* ─────────────────────────────────────
   CITIES SECTION — Premium redesign
───────────────────────────────────── */
function CityCard({ city, index, visible, onClick }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [imgError, setImgError] = useState(false)
  const ref = useRef(null)

  const handleMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -5, y: x * 5 })
  }
  const handleLeave = () => setTilt({ x: 0, y: 0 })

  const TAG_STYLE = {
    'Trendy':   'bg-rose-500/90 text-white',
    'Hot':      'bg-orange-500/90 text-white',
    'Culture':  'bg-violet-500/90 text-white',
    'Chill':    'bg-cyan-500/90 text-white',
    'Étudiant': 'bg-emerald-500/90 text-white',
  }
  const tagClass = city.tag ? TAG_STYLE[city.tag] : ''

  return (
    <div ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.2s ease-out',
        transitionDelay: visible ? `${index * 50}ms` : '0ms',
      }}
      className={`${city.cls} ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
    >
      <button
        onClick={() => onClick(city.name)}
        style={imgError ? { background: city.bg } : {}}
        className="group relative overflow-hidden rounded-2xl w-full h-full text-left
                   shadow-md hover:shadow-2xl hover:shadow-black/50
                   ring-1 ring-white/10
                   focus:outline-none focus:ring-4 focus:ring-purple-500/40
                   transition-shadow duration-300 bg-gray-900"
      >
        {/* Real photo background */}
        {city.image && !imgError && (
          <img
            src={city.image}
            alt={city.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover
                       group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        )}

        {/* Gradient fallback when no photo */}
        {imgError && (
          <>
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10
                            group-hover:scale-125 group-hover:bg-white/15
                            transition-all duration-700 ease-out blur-sm" />
            <div className="absolute -bottom-16 -left-12 w-40 h-40 rounded-full bg-black/15
                            group-hover:scale-110 transition-transform duration-700 ease-out blur-sm" />
          </>
        )}

        {/* Dark scrim — stronger at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20
                        group-hover:from-black/85 transition-all duration-500" />

        {/* Diagonal sheen sweep */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                        transition-transform duration-[1.4s] ease-out pointer-events-none
                        bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />

        {/* Inner border ring on hover */}
        <div className="absolute inset-0 rounded-2xl ring-0 ring-inset ring-white/0
                        group-hover:ring-2 group-hover:ring-white/30
                        transition-all duration-500 pointer-events-none" />

        {/* Live pulse dot for active cities (count > 3) */}
        {city.count > 3 && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider">Live</span>
          </div>
        )}

        {/* ── Content ── */}
        <div className="relative h-full flex flex-col justify-between p-4 md:p-5 z-10">

          {/* Top row: tag + count */}
          <div className={`flex items-start ${city.count > 3 ? 'justify-end' : 'justify-between'}`}>
            {city.tag && city.count <= 3 && (
              <span className={`inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm ${tagClass}`}>
                {city.tag}
              </span>
            )}
            <span className="inline-flex items-center gap-1 bg-black/30 backdrop-blur-md
                             text-white text-[11px] font-bold px-2.5 py-1
                             rounded-full border border-white/20 shadow-sm">
              <Icon name="ticket" className="w-3 h-3 opacity-80" />
              {city.count}
            </span>
          </div>

          {/* Featured: tag floating mid-card */}
          {city.tag && city.count > 3 && city.featured && (
            <div className="absolute top-12 right-4 z-20">
              <span className={`inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm shadow ${tagClass}`}>
                {city.tag}
              </span>
            </div>
          )}

          {/* Spacer for featured cards */}
          {city.featured && <div className="flex-1" />}

          {/* Bottom: name + desc + CTA */}
          <div>
            <p className={`text-white font-extrabold leading-tight tracking-tight drop-shadow-lg
                           ${city.featured ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
              {city.name}
            </p>
            <p className="text-white/65 text-xs mt-0.5 hidden sm:block">
              {city.featured && city.vibe ? city.vibe : city.desc}
            </p>

            {/* Animated CTA bar — slides up on hover */}
            <div className="mt-3 overflow-hidden">
              <div className="flex items-center justify-between
                              translate-y-6 group-hover:translate-y-0
                              opacity-0 group-hover:opacity-100
                              transition-all duration-300 ease-out">
                <span className="text-xs font-bold text-white/90 inline-flex items-center gap-1.5">
                  Voir les événements
                </span>
                <span className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm
                                 flex items-center justify-center
                                 border border-white/30
                                 group-hover:bg-white group-hover:text-purple-700
                                 transition-colors duration-300">
                  <Icon name="arrow_right" className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}

function CitiesSection({ visible, sectionRef, onCityClick }) {
  const [region, setRegion] = useState('all')
  const filtered = region === 'all' ? CITIES : CITIES.filter(c => c.region === region)
  const totalEvents = CITIES.reduce((s, c) => s + c.count, 0)

  return (
    <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a0d 0%, #0d0b1a 100%)' }}>

      {/* Decorative ambient blobs */}
      <div className="absolute top-20 -left-20 w-80 h-80 rounded-full bg-purple-300/20 dark:bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-pink-300/20 dark:bg-pink-600/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={sectionRef}>

          {/* ── Header V2 ── */}
          <div className={`text-center max-w-3xl mx-auto mb-10 transition-all duration-700
                           ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="kicker-v2 mb-4">Carte des destinations</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-4 mb-3"
              style={{ color: 'var(--v2-tx1)', letterSpacing: '-0.035em' }}>
              Explorez par{' '}
              <em className="not-italic" style={{ color: 'var(--v2-vio-3)' }}>ville</em>
            </h2>
            <p style={{ color: 'var(--v2-tx2)', fontSize: '16px' }}>
              {CITIES.length} destinations · {totalEvents}+ événements · Tout le Maroc à portée de clic
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {[
                { icon: 'sparkles', label: `${totalEvents}+ événements` },
                { icon: 'map',      label: `${CITIES.length} villes`     },
                { icon: 'bolt',     label: 'Réservation instantanée'    },
              ].map(m => (
                <span key={m.label} className="stat-pill-v2" style={{ padding: '7px 14px' }}>
                  <span className="stat-pill-v2-icn v" style={{ width: 20, height: 20 }}>
                    <Icon name={m.icon} className="w-3 h-3" />
                  </span>
                  <span className="stat-pill-v2-l" style={{ fontSize: '12px' }}>{m.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* ── Region filter pills ── */}
          <div className={`flex flex-wrap items-center justify-center gap-2 mb-10
                           transition-all duration-700 delay-100
                           ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {REGIONS.map(r => {
              const active = region === r.id
              return (
                <button
                  key={r.id}
                  onClick={() => setRegion(r.id)}
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300"
                  style={active
                    ? { background: 'linear-gradient(135deg, var(--v2-vio-3), var(--v2-vio))', color: 'white', transform: 'scale(1.05)', boxShadow: 'var(--v2-vio-glow)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', color: 'var(--v2-tx2)' }}
                >
                  <Icon name={r.icon} className="w-3.5 h-3.5" />
                  {r.label}
                  {active && (
                    <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-bold">
                      {filtered.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Bento Grid ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[165px] gap-3 md:gap-4">
            {filtered.map((c, i) => (
              <CityCard key={c.name} city={c} index={i} visible={visible} onClick={onCityClick} />
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Icon name="map" className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Aucune ville pour cette région.</p>
            </div>
          )}

          {/* ── Bottom CTA strip ── */}
          <div className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-5 p-6 rounded-2xl
                           transition-all duration-700 delay-300
                           ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ background: 'rgba(20,20,28,0.55)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.10)' }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--v2-vio-g)', color: 'var(--v2-vio-3)' }}>
                <Icon name="map" className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-base" style={{ color: 'var(--v2-tx1)' }}>Vous ne trouvez pas votre ville ?</p>
                <p className="text-sm" style={{ color: 'var(--v2-tx2)' }}>Découvrez tous nos événements ou recevez les alertes.</p>
              </div>
            </div>
            <Link to="/events" className="btn-neon-v2 text-sm">
              Voir tous les événements
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [universities,   setUniversities]   = useState([])
  const [loading,        setLoading]        = useState(true)

  // Scroll reveal refs for sections
  const [eventsRef,  eventsVisible]  = useScrollReveal(0.05)
  const [citiesRef,  citiesVisible]  = useScrollReveal(0.05)
  const [uniRef,     uniVisible]     = useScrollReveal(0.05)
  const [appRef,     appVisible]     = useScrollReveal(0.1)
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
    <div className="animate-fade-up dark:bg-[#0a0a0f]">

      {/* ══════════════════════════════════
          HERO V2 — Cinematic nightlife
      ══════════════════════════════════ */}
      <section className="relative text-white overflow-hidden min-h-screen flex flex-col"
        style={{ background: '#0a0a0d' }}>

        {/* Radial gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 65% 70% at 70% 35%, rgba(124,58,237,0.32) 0%, transparent 60%), radial-gradient(ellipse 45% 50% at 20% 70%, rgba(245,158,11,0.10) 0%, transparent 55%), radial-gradient(ellipse 35% 40% at 80% 80%, rgba(59,130,246,0.10) 0%, transparent 55%)'
          }} />
          {/* Grid overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '88px 88px',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 55% 0%, black 0%, transparent 65%)',
            maskImage: 'radial-gradient(ellipse 90% 80% at 55% 0%, black 0%, transparent 65%)'
          }} />
        </div>

        <NightlifeIntro3D active={true} />

        {/* Floor glow */}
        <div className="hero-floor-v2" aria-hidden="true" />

        {/* Crowd silhouette */}
        <div className="hero-crowd-wrap" aria-hidden="true">
          <svg viewBox="0 0 1200 240" preserveAspectRatio="xMidYMax slice">
            <defs>
              <linearGradient id="crowd-g-v2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#000" stopOpacity="0.40"/>
                <stop offset="55%" stopColor="#000" stopOpacity="0.88"/>
                <stop offset="100%" stopColor="#000" stopOpacity="1"/>
              </linearGradient>
            </defs>
            <path d="M0,240 L0,200 Q30,200 40,170 Q50,138 80,138 Q108,138 120,168 Q130,180 150,180 Q170,180 178,148 Q186,122 215,122 Q244,122 250,162 Q256,180 280,180 Q306,180 314,148 Q322,118 355,118 Q388,118 393,155 Q398,180 425,180 Q456,180 462,138 Q468,112 498,112 Q528,112 533,162 Q538,185 565,185 Q596,185 602,142 Q608,115 638,115 Q668,115 673,160 Q678,180 705,180 Q738,180 743,132 Q748,112 778,112 Q808,112 813,156 Q818,180 848,180 Q878,180 883,142 Q888,118 918,118 Q948,118 953,160 Q958,180 988,180 Q1018,180 1024,138 Q1029,112 1058,112 Q1088,112 1093,160 Q1098,180 1128,180 Q1158,180 1164,148 Q1170,128 1198,128 L1200,128 L1200,240 Z" fill="url(#crowd-g-v2)"/>
          </svg>
        </div>

        {/* Vignette + bottom fade */}
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 200px rgba(0,0,0,0.45)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(transparent, #0a0a0d)' }} />

        {/* ── Main content ── */}
        <div className="relative z-10 flex-1 flex flex-col max-w-[1320px] mx-auto px-4 sm:px-8 w-full" style={{ paddingTop: '128px', paddingBottom: '80px' }}>

          {/* Eyebrow pill */}
          <div className="flex justify-center mb-8">
            <div className="pill-glass-v2 fade-slide-down anim-delay-100">
              <span className="pill-glass-dot-v2" />
              <span className="pill-glass-tag-v2">MA</span>
              Plateforme N°1 de billetterie au Maroc
            </div>
          </div>

          {/* Hero headline with word curtain */}
          <div className="hero-intro-layout flex-1 pb-10">
            <div className="hero-intro-copy">
            <h1 className="font-extrabold mb-8"
              style={{ fontSize: 'clamp(46px, 8vw, 118px)', lineHeight: 0.95, letterSpacing: 0, maxWidth: '920px', textWrap: 'balance' }}>
              <span className="word-wrap"><span className="word">Vivez</span></span>{' '}
              <span className="word-wrap"><span className="word">les</span></span>{' '}
              <span className="word-wrap"><span className="word">meilleures</span></span>
              <br />
              <span className="word-wrap"><span className="word grad-amber">soirées</span></span>{' '}
              <span className="word-wrap"><span className="word grad-amber">du</span></span>{' '}
              <span className="word-wrap"><span className="word grad-amber">Maroc.</span></span>
            </h1>

            <p className="mb-8" style={{ maxWidth: '620px', fontSize: '17px', fontWeight: 400, lineHeight: 1.7, color: 'rgba(255,255,255,0.70)' }}>
              Une introduction immersive pour les galas, concerts et soirées exclusives du Maroc. Réservez vite, arrivez prêt, vivez une expérience premium.
            </p>

            {/* V2 search bar */}
            <form
              onSubmit={e => { e.preventDefault(); const v = e.target.q.value.trim(); if (v) navigate(`/events?search=${encodeURIComponent(v)}`) }}
              className="hero-search-v2 fade-slide-up anim-delay-400"
            >
              <Icon name="search" className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.36)' }} />
              <input
                name="q"
                type="text"
                placeholder="Rechercher un événement, une ville, une soirée…"
              />
              <button type="submit">Chercher</button>
            </form>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12 fade-slide-up anim-delay-500">
              <Link to="/events" className="btn-neon-v2">
                Découvrir les événements
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </Link>
              <Link to="/universities" className="btn-glass-v2">
                <Icon name="graduation" className="w-4 h-4" />
                Soirées universitaires
              </Link>
            </div>

            {/* V2 Stat pills */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 fade-slide-up anim-delay-600">
              {[
                { icon: 'sparkles', label: 'Événements', num: '50+', cls: 'v' },
                { icon: 'graduation', label: 'Universités', num: '10', cls: 'a' },
                { icon: 'globe', label: 'Villes', num: '12', cls: 'b' },
                { icon: 'ticket', label: 'Billets vendus', num: '2 000+', cls: 'e' },
              ].map(s => (
                <div key={s.label} className="stat-pill-v2">
                  <span className={`stat-pill-v2-icn ${s.cls}`}>
                    <Icon name={s.icon} className="w-3 h-3" />
                  </span>
                  <span className="stat-pill-v2-n">{s.num}</span>
                  <span className="stat-pill-v2-l">{s.label}</span>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint hidden md:flex">
          <span>Scroll</span>
          <div className="scroll-mouse"><div className="scroll-mouse-dot" /></div>
        </div>

        {/* Bottom corner annotations */}
        <div className="hero-corner-l">
          <div className="hero-counter">
            <span className="hero-counter-n">01</span>
            <span className="hero-counter-t">/04</span>
          </div>
          <span className="hero-counter-lbl">Accueil</span>
        </div>
        <div className="hero-corner-r">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">TikTok</a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
      </section>

      {/* ══════════════════════════════════
          STATS BAR
      ══════════════════════════════════ */}
      <section style={{ background: '#0a0a0d', borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 py-6
                        grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.05]">
          {STATS.map((s, i) => (
            <StatItem key={s.label} {...s} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          CITIES  — Bento Grid PREMIUM
      ══════════════════════════════════ */}
      <CitiesSection visible={citiesVisible} sectionRef={citiesRef} onCityClick={(name) => navigate(`/events?city=${encodeURIComponent(name)}`)} />

      {/* ══════════════════════════════════
          UPCOMING EVENTS — V2
      ══════════════════════════════════ */}
      <section ref={eventsRef} style={{ background: '#0a0a0d', padding: '80px 0' }}>
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8">
        <div className={`flex items-end justify-between mb-10 transition-all duration-700
                         ${eventsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div>
            <span className="kicker-v2 mb-3">Billetterie</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-4 mb-2"
              style={{ color: 'var(--v2-tx1)', letterSpacing: '-0.035em' }}>
              Événements <em className="not-italic" style={{ color: 'var(--v2-vio-3)' }}>à venir</em>
            </h2>
            <p style={{ color: 'var(--v2-tx2)', fontSize: '15px' }}>Les galas, soirées et concerts les plus attendus du Royaume.</p>
          </div>
          <Link to="/events"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold transition-colors"
            style={{ color: 'var(--v2-vio-3)' }}>
            Voir tout
            <Icon name="arrow_right" className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.06] shadow-sm">
                <div className="h-52 animate-shimmer dark:animate-shimmer" />
                <div className="p-5 space-y-3 bg-white dark:bg-[#13131a]">
                  <div className="h-4 bg-gray-100 dark:bg-white/[0.05] rounded-lg w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-100 dark:bg-white/[0.05] rounded-lg w-1/2 animate-pulse" />
                  <div className="h-3 bg-gray-100 dark:bg-white/[0.05] rounded-lg w-full animate-pulse" />
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
        </div>
      </section>

      {/* ══════════════════════════════════
          UNIVERSITIES — V2
      ══════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(180deg, #0e0e17 0%, #0a0a0d 100%)' }} className="py-20">
        <div ref={uniRef} className="max-w-[1320px] mx-auto px-4 sm:px-8">
          <div className={`text-center mb-10 transition-all duration-700
                           ${uniVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="kicker-v2 mb-4">Campus</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-3 mt-4"
              style={{ letterSpacing: '-0.035em' }}>
              Soirées <em className="not-italic" style={{ color: 'var(--v2-vio-3)' }}>universitaires</em>
            </h2>
            <p style={{ color: 'var(--v2-tx2)', fontSize: '16px' }}>
              Chaque université, ses propres soirées exclusives. Retrouvez la vôtre en un clic.
            </p>
          </div>

          <div className={`uni-grid-v2 transition-all duration-700 delay-100 ${uniVisible ? 'opacity-100' : 'opacity-0'}`}>
            {universities.map((u, i) => (
              <Link key={u.id} to={`/universities/${u.id}`}
                className="uni-card-v2"
                style={{
                  transitionDelay: `${i * 50}ms`,
                  '--uni-color': u.color ? `${u.color}33` : 'rgba(124,58,237,0.20)',
                }}>
                <div className="uni-logo-v2">
                  {u.logo_url ? (
                    <img
                      src={u.logo_url}
                      alt={u.short_name}
                      className="w-full h-full object-contain"
                      onError={e => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <span style={{ display: u.logo_url ? 'none' : 'flex' }}>
                    {u.short_name.slice(0, 2)}
                  </span>
                </div>
                <p className="uni-name-v2">{u.short_name}</p>
                <p className="uni-city-v2">{u.city}</p>
                {u.event_count > 0 && (
                  <span className="mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--v2-vio-3)' }}>
                    {u.event_count} evt{u.event_count > 1 ? 's' : ''}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className={`text-center mt-10 transition-all duration-700 delay-300 ${uniVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link to="/universities" className="btn-glass-v2">
              Voir toutes les universités
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          APP DOWNLOAD SECTION
      ══════════════════════════════════ */}
      <section ref={appRef} className="relative overflow-hidden py-20"
        style={{ background: 'linear-gradient(180deg, #0a0a0d 0%, #0d0d18 100%)' }}>

        {/* Ambient blobs */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(139,92,246,0.10)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(59,130,246,0.07)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* ── Left: Text + buttons ── */}
            <div className={`flex-1 text-center lg:text-left transition-all duration-700
                             ${appVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <span className="kicker-v2 mb-4">Application Mobile</span>

              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight mt-4"
                style={{ color: 'var(--v2-tx1)', letterSpacing: '-0.035em' }}>
                Télécharge l'application<br className="hidden md:block" />{' '}
                <em className="not-italic" style={{ color: 'var(--v2-vio-3)' }}>maintenant</em>.
              </h2>

              {/* Stats */}
              <div className="space-y-3.5 mb-10">
                {[
                  { icon: 'ticket',   label: '43 Événements Organisés'  },
                  { icon: 'sparkles', label: '2 000+ Billets Vendus'    },
                  { icon: 'globe',    label: '11 Villes au Maroc'       },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--v2-vio-g)', border: '1px solid rgba(139,92,246,0.25)' }}>
                      <Icon name={s.icon} className="w-4 h-4" style={{ color: 'var(--v2-vio-3)' }} />
                    </div>
                    <span className="font-medium text-sm" style={{ color: 'var(--v2-tx2)' }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Download buttons */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {/* App Store */}
                <a href="#" className="group flex items-center gap-3 px-5 py-3 rounded-2xl
                                       bg-gray-900 dark:bg-[#13131a]
                                       border border-gray-800 dark:border-white/[0.1]
                                       hover:bg-gray-800 dark:hover:bg-[#1c1c27]
                                       hover:scale-105 transition-all duration-200
                                       shadow-lg shadow-black/20">
                  <svg className="w-7 h-7 fill-white flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div>
                    <p className="text-[10px] text-white/55 leading-none mb-0.5">Download on the</p>
                    <p className="text-[15px] font-bold text-white leading-tight">App Store</p>
                  </div>
                </a>

                {/* Google Play */}
                <a href="#" className="group flex items-center gap-3 px-5 py-3 rounded-2xl
                                       bg-gray-900 dark:bg-[#13131a]
                                       border border-gray-800 dark:border-white/[0.1]
                                       hover:bg-gray-800 dark:hover:bg-[#1c1c27]
                                       hover:scale-105 transition-all duration-200
                                       shadow-lg shadow-black/20">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 flex-shrink-0" fill="none">
                    <path d="M3.18 23.76c.34.19.73.23 1.1.12L15.34 12 3.3.12C2.93.01 2.54.05 2.2.24 1.55.61 1.17 1.3 1.17 2.06v19.88c0 .76.38 1.45 1.01 1.82z" fill="#EA4335"/>
                    <path d="M20.93 10.02l-3.03-1.75L15.34 12l2.56 2.56 3.03-1.72a2.02 2.02 0 000-2.82z" fill="#FBBC04"/>
                    <path d="M4.28 23.88L15.34 12 4.28.12A1.93 1.93 0 003 .12l12.34 11.88L3 23.88c.43.11.91.06 1.28-.0z" fill="#4285F4"/>
                    <path d="M17.9 14.56l-2.56-2.56-11.06 11.76c.43.45 1.09.58 1.65.26l11.97-9.46z" fill="#34A853"/>
                  </svg>
                  <div>
                    <p className="text-[10px] text-white/55 leading-none mb-0.5">GET IT ON</p>
                    <p className="text-[15px] font-bold text-white leading-tight">Google Play</p>
                  </div>
                </a>
              </div>
            </div>

            {/* ── Right: Phone mockup ── */}
            <div className={`relative flex-shrink-0 transition-all duration-700 delay-200
                             ${appVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>

              {/* Wireframe globe decoration */}
              <div className="absolute -top-12 -left-14 pointer-events-none animate-float-slow opacity-60 dark:opacity-40">
                <svg viewBox="0 0 110 110" fill="none" width="110" height="110">
                  <circle cx="55" cy="55" r="52" stroke="rgba(124,58,237,0.55)" strokeWidth="1.5"/>
                  <ellipse cx="55" cy="55" rx="30" ry="52" stroke="rgba(124,58,237,0.35)" strokeWidth="1"/>
                  <ellipse cx="55" cy="55" rx="52" ry="22" stroke="rgba(124,58,237,0.35)" strokeWidth="1"/>
                  <line x1="3" y1="55" x2="107" y2="55" stroke="rgba(124,58,237,0.25)" strokeWidth="1"/>
                  <line x1="55" y1="3" x2="55" y2="107" stroke="rgba(124,58,237,0.25)" strokeWidth="1"/>
                </svg>
              </div>

              {/* Sparkle star decoration */}
              <div className="absolute -bottom-6 -right-10 pointer-events-none animate-float opacity-80 dark:opacity-60">
                <svg viewBox="0 0 80 80" fill="none" width="70" height="70">
                  <defs>
                    <linearGradient id="starG" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#c4b5fd"/>
                      <stop offset="100%" stopColor="#f5f3ff"/>
                    </linearGradient>
                  </defs>
                  <path d="M40 0 L43.5 36.5 L80 40 L43.5 43.5 L40 80 L36.5 43.5 L0 40 L36.5 36.5 Z" fill="url(#starG)"/>
                </svg>
              </div>

              {/* Glow behind phone */}
              <div className="absolute inset-0 -m-8 bg-violet-500/15 dark:bg-violet-500/20 blur-3xl rounded-full pointer-events-none" />

              {/* Phone frame */}
              <div className="relative w-[248px]" style={{ filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.45))' }}>
                {/* Side buttons */}
                <div className="absolute -left-[3px] top-[90px] w-[3px] h-7 rounded-l-full bg-gray-700" />
                <div className="absolute -left-[3px] top-[126px] w-[3px] h-7 rounded-l-full bg-gray-700" />
                <div className="absolute -right-[3px] top-[105px] w-[3px] h-12 rounded-r-full bg-gray-700" />

                <div className="overflow-hidden rounded-[42px]"
                     style={{ background: '#0d0d18', border: '2.5px solid rgba(255,255,255,0.13)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>

                  {/* Notch */}
                  <div className="relative flex justify-center pt-3 pb-0">
                    <div className="w-[90px] h-[22px] rounded-b-2xl" style={{ background: '#0d0d18', border: '2.5px solid rgba(255,255,255,0.1)', borderTop: 'none' }} />
                  </div>

                  {/* Screen */}
                  <div style={{ background: '#070710', minHeight: '510px' }}>

                    {/* Status bar */}
                    <div className="flex justify-between items-center px-5 py-1 text-[9px] font-semibold text-white/40">
                      <span>3:05</span>
                      <div className="flex items-center gap-1 opacity-70">
                        <svg className="w-3 h-2 fill-white/60" viewBox="0 0 16 10"><rect x="0" y="3" width="3" height="7" rx="0.5"/><rect x="4.5" y="2" width="3" height="8" rx="0.5"/><rect x="9" y="0.5" width="3" height="9.5" rx="0.5"/><rect x="13.5" y="0" width="2.5" height="10" rx="0.5" opacity="0.3"/></svg>
                        <svg className="w-3 h-3 fill-white/60" viewBox="0 0 20 20"><path d="M10 2.4A10.3 10.3 0 0 0 .5 7.2l1.5 1.5A8.3 8.3 0 0 1 10 4.4a8.3 8.3 0 0 1 8 4.3l1.5-1.5A10.3 10.3 0 0 0 10 2.4zm0 4a6.3 6.3 0 0 0-5 2.4l1.5 1.4A4.3 4.3 0 0 1 10 8.4a4.3 4.3 0 0 1 3.5 1.8l1.5-1.4A6.3 6.3 0 0 0 10 6.4zm0 4a2.3 2.3 0 0 0-1.8.9L10 13.5l1.8-2.2A2.3 2.3 0 0 0 10 10.4z"/></svg>
                        <svg className="w-5 h-2.5 fill-white/60" viewBox="0 0 25 12"><rect x="0" y="1" width="21" height="10" rx="2.5" stroke="white" strokeWidth="1" fill="none"/><rect x="1.5" y="2.5" width="14" height="7" rx="1.5" fill="white" opacity="0.8"/><rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="white" opacity="0.4"/></svg>
                      </div>
                    </div>

                    {/* Greeting */}
                    <div className="px-5 pt-2 pb-3">
                      <p className="text-white/40 text-[10px]">C'est le 26 Mai</p>
                      <p className="text-[13px] font-extrabold" style={{ color: '#a78bfa' }}>Bonjour Amine Benkeroum</p>
                    </div>

                    {/* Category pills */}
                    <div className="flex gap-2 px-4 mb-4 overflow-hidden">
                      {['Tous', 'Électronique', 'Art et culture'].map((t, i) => (
                        <span key={t} className="text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0"
                              style={i === 0
                                ? { background: '#7c3aed', color: 'white' }
                                : { color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Event card in phone */}
                    <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="relative">
                        <img
                          src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=400&q=70"
                          alt="gala"
                          className="w-full object-cover"
                          style={{ height: '110px' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute top-2 left-2 text-[9px] font-extrabold px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(124,58,237,0.85)', color: 'white' }}>Gala</span>
                      </div>
                      <div className="p-3">
                        <p className="text-red-400 text-[10px] font-bold mb-0.5">15 Juin 2026</p>
                        <p className="text-white text-[12px] font-extrabold leading-tight">Gala de Luxe Casablanca</p>
                        <p className="text-white/40 text-[9px] mt-0.5">📍 Four Seasons · Casablanca</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="font-extrabold text-[13px]" style={{ color: '#a78bfa' }}>500 MAD</p>
                          <span className="text-white text-[10px] font-bold px-2.5 py-1 rounded-full"
                                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>Réserver</span>
                        </div>
                      </div>
                    </div>

                    {/* Second card peek */}
                    <div className="mx-4 mt-2.5 rounded-2xl overflow-hidden opacity-50"
                         style={{ background: '#13131a', height: '52px' }}>
                      <img
                        src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=400&q=60"
                        alt="festival"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Bottom nav */}
                    <div className="flex justify-around items-center px-4 pt-4 pb-5 mt-3 border-t border-white/[0.06]">
                      {[
                        { label: 'Accueil', active: true },
                        { label: 'Carte',   active: false },
                        { label: 'Mes billets', active: false },
                        { label: 'Profil', active: false },
                      ].map(n => (
                        <div key={n.label} className="flex flex-col items-center gap-1">
                          <div className={`w-1 h-1 rounded-full ${n.active ? 'bg-violet-500' : 'bg-transparent'}`} />
                          <span className={`text-[8px] font-semibold ${n.active ? 'text-violet-400' : 'text-white/30'}`}>{n.label}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          NEWSLETTER V2
      ══════════════════════════════════ */}
      <section style={{ background: '#0a0a0d', padding: '0 0 40px' }}>
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8">
          <NewsletterV2 />
        </div>
      </section>

      {/* ══════════════════════════════════
          CTA BANNER — V2
      ══════════════════════════════════ */}
      <section ref={ctaRef} className="relative text-white py-24 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d0020 0%, #0a0a0d 40%, #080820 100%)' }}>
        {/* Background grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }} />
        {/* Glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 right-10 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(139,92,246,0.18)' }} />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(245,158,11,0.08)' }} />
        </div>
        <div className={`relative max-w-3xl mx-auto px-4 text-center transition-all duration-1000
                         ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="kicker-v2 mb-6">Rejoignez-nous</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 mt-4"
            style={{ letterSpacing: '-0.04em', color: 'var(--v2-tx1)' }}>
            Prêt à vivre des moments <em className="not-italic" style={{ color: 'var(--v2-vio-3)' }}>inoubliables</em> ?
          </h2>
          <p className="mb-10 leading-relaxed" style={{ fontSize: '17px', color: 'var(--v2-tx2)' }}>
            Créez votre compte gratuitement et accédez aux meilleures soirées du Maroc.
            Gagnez des FayasCoins à chaque achat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-neon-v2 text-sm px-7 py-4 justify-center">
              <Icon name="sparkles" className="w-4 h-4" />
              Créer un compte gratuit
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/events" className="btn-glass-v2 text-sm px-7 py-4 justify-center">
              Explorer les événements
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
