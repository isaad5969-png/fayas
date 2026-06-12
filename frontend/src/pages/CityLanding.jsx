import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import EventCard from '../components/EventCard'
import { Icon } from '../components/Icons'
import { useScrollReveal } from '../hooks/useScrollReveal'

/* ─── Métadonnées par ville (photo + ambiance) ─── */
const CITY_META = {
  Casablanca: { vibe: 'Métropole nocturne',   desc: 'La capitale économique',  accent: '#EA580C', image: 'https://images.unsplash.com/photo-1538230575309-59dfc388ae36?auto=format&fit=crop&w=1600&q=85' },
  Marrakech:  { vibe: 'Glamour & magie',       desc: 'La ville rouge',          accent: '#D97706', image: 'https://images.unsplash.com/photo-1708823081494-3e5bbd2ce931?auto=format&fit=crop&w=1600&q=85' },
  Rabat:      { vibe: 'La capitale du Royaume', desc: 'Élégance & culture',      accent: '#0891B2', image: 'https://images.unsplash.com/photo-1763838546027-5ea880df8fbe?auto=format&fit=crop&w=1600&q=85' },
  Agadir:     { vibe: 'La perle du Souss',      desc: 'Soleil & océan',          accent: '#10B981', image: 'https://images.unsplash.com/photo-1562874732-260714dfe537?auto=format&fit=crop&w=1600&q=85' },
  'Fès':      { vibe: 'La capitale spirituelle',desc: 'Patrimoine & raffinement',accent: '#7C3AED', image: 'https://images.unsplash.com/photo-1767936925033-9a5b59925613?auto=format&fit=crop&w=1600&q=85' },
  Tanger:     { vibe: "La porte de l'Europe",   desc: 'Entre deux rives',        accent: '#0EA5E9', image: 'https://images.unsplash.com/photo-1582919534700-acf2374f10d3?auto=format&fit=crop&w=1600&q=85' },
  Essaouira:  { vibe: 'La cité des alizés',     desc: 'Vent & musique',          accent: '#06B6D4', image: 'https://images.unsplash.com/photo-1555686367-56d5186965d5?auto=format&fit=crop&w=1600&q=85' },
  'Kénitra':  { vibe: 'La ville étudiante',     desc: 'Énergie de campus',       accent: '#6D28D9', image: 'https://images.unsplash.com/photo-1740708085335-05fb442c089a?auto=format&fit=crop&w=1600&q=85' },
  'Meknès':   { vibe: 'La ville impériale',     desc: 'Histoire vivante',        accent: '#F59E0B', image: 'https://images.unsplash.com/photo-1706793989006-f0238c69f4a2?auto=format&fit=crop&w=1600&q=85' },
  Oujda:      { vibe: "La porte de l'Est",      desc: "Carrefour de l'Oriental", accent: '#F43F5E', image: 'https://images.unsplash.com/photo-1632658810488-f3581ce5a249?auto=format&fit=crop&w=1600&q=85' },
  'Tétouan':  { vibe: 'La colombe du Nord',     desc: 'Andalousie marocaine',    accent: '#10B981', image: 'https://images.unsplash.com/photo-1579894461465-e8cdbe670cd1?auto=format&fit=crop&w=1600&q=85' },
}
const DEFAULT_META = { vibe: "Soirées d'exception", desc: 'Au cœur du Maroc', accent: '#7C3AED', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=85' }

const OTHER_CITIES = Object.keys(CITY_META)

export default function CityLanding() {
  const { name } = useParams()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [heroReady, setHeroReady] = useState(false)
  const [gridRef, gridVisible] = useScrollReveal(0.04)
  const heroImgRef = useRef(null)
  const heroContentRef = useRef(null)

  const meta = CITY_META[name] || DEFAULT_META

  useEffect(() => {
    let alive = true
    setLoading(true)
    setHeroReady(false)
    api.get('/events', { params: { city: name } })
      .then(r => { if (alive) setEvents(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])) })
      .catch(() => { if (alive) setEvents([]) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [name])

  /* Parallax du hero — piloté par ref + rAF (zéro re-render React → fluide) */
  useEffect(() => {
    let raf = 0
    const apply = () => {
      raf = 0
      const y = window.scrollY
      if (heroImgRef.current) heroImgRef.current.style.transform = `translate3d(0, ${y * 0.34}px, 0) scale(1.12)`
      if (heroContentRef.current) {
        heroContentRef.current.style.transform = `translateY(${y * -0.08}px)`
        heroContentRef.current.style.opacity = String(Math.max(0, 1 - y / 520))
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply) }
    window.addEventListener('scroll', onScroll, { passive: true })
    apply()
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  const venues = new Set(events.map(e => e.venue)).size
  const minPrice = events.length ? Math.min(...events.map(e => Number(e.price_standard) || 0)) : 0
  const nextDate = events.length
    ? new Date(Math.min(...events.map(e => new Date(e.date).getTime())))
    : null
  const nextLabel = nextDate
    ? new Intl.DateTimeFormat('fr-MA', { day: 'numeric', month: 'long' }).format(nextDate)
    : '—'

  const stats = [
    { icon: 'sparkles', label: 'Événements', value: events.length },
    { icon: 'building', label: 'Lieux',      value: venues || '—' },
    { icon: 'ticket',   label: 'Dès',        value: minPrice ? `${minPrice} MAD` : '—' },
    { icon: 'calendar', label: 'Prochain',   value: nextLabel },
  ]

  const scrollToEvents = () => {
    const target = document.getElementById('city-events')
    if (!target) return
    if (window.__lenis) window.__lenis.scrollTo(target, { offset: -70 })
    else target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="dark:bg-[#0a0a0d]" style={{ background: '#0a0a0d' }}>

      {/* ══════════════ HERO PARALLAX ══════════════ */}
      <section className="relative overflow-hidden text-white" style={{ height: 'clamp(560px, 82vh, 880px)' }}>

        {/* Photo de fond (parallax) */}
        <img
          ref={heroImgRef}
          src={meta.image}
          alt={name}
          onLoad={() => setHeroReady(true)}
          className="absolute inset-0 w-full h-full object-cover object-center will-change-transform"
          style={{
            transform: 'scale(1.12)',
            filter: 'brightness(0.58) saturate(1.05)',
            opacity: heroReady ? 1 : 0,
            transition: 'opacity 0.9s ease',
          }}
        />

        {/* Ambiance colorée */}
        <div className="absolute -top-24 -right-24 w-[34rem] h-[34rem] rounded-full blur-3xl pointer-events-none"
          style={{ background: `${meta.accent}33` }} />
        <div className="absolute -bottom-32 -left-24 w-[30rem] h-[30rem] rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(124,58,237,0.20)' }} />

        {/* Scrims */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(10,10,13,0.55) 0%, rgba(10,10,13,0.10) 30%, rgba(10,10,13,0.65) 78%, #0a0a0d 100%)' }} />

        {/* Contenu */}
        <div ref={heroContentRef} className="relative h-full max-w-[1320px] mx-auto px-4 sm:px-8 flex flex-col justify-end pb-16"
          style={{ willChange: 'transform, opacity' }}>

          <Link to="/" className="self-start mb-6 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white
                                  bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-colors">
            <Icon name="arrow_right" className="w-3.5 h-3.5 rotate-180" />
            Accueil
          </Link>

          <span className="kicker-v2 mb-4" style={{ width: 'fit-content' }}>Destination</span>

          <h1 className="font-extrabold leading-[0.92] mb-4 animate-fade-up"
            style={{ fontSize: 'clamp(52px, 10vw, 132px)', letterSpacing: '-0.04em' }}>
            {name}
          </h1>

          <p className="text-xl md:text-2xl font-light text-white/80 mb-2">{meta.vibe}</p>
          <p className="text-sm text-white/45 mb-8">{meta.desc} · Maroc</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-2.5 mb-9">
            {stats.map(s => (
              <span key={s.label} className="inline-flex items-center gap-2 bg-white/[0.07] backdrop-blur-md
                                             border border-white/10 rounded-full px-4 py-2">
                <Icon name={s.icon} className="w-3.5 h-3.5" style={{ color: meta.accent }} />
                <span className="font-extrabold text-sm tabular-nums">{s.value}</span>
                <span className="text-xs text-white/50">{s.label}</span>
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={scrollToEvents} className="btn-neon-v2">
              Voir les billets
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}><path d="M12 5v14M5 12l7 7 7-7" /></svg>
            </button>
            <Link to="/events" className="btn-glass-v2">
              Tous les événements
            </Link>
          </div>
        </div>

        {/* Barre accent en bas */}
        <div className="absolute bottom-0 inset-x-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${meta.accent}, transparent)` }} />
      </section>

      {/* ══════════════ ÉVÉNEMENTS ══════════════ */}
      <section id="city-events" className="py-16 md:py-20">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8" ref={gridRef}>

          <div className={`flex items-end justify-between mb-9 transition-all duration-700
                           ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <span className="kicker-v2 mb-3">Programmation</span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-3" style={{ color: 'var(--v2-tx1)', letterSpacing: '-0.03em' }}>
                Événements à <em className="not-italic" style={{ color: meta.accent }}>{name}</em>
              </h2>
            </div>
            <Link to="/events" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--v2-vio-3)' }}>
              Voir tout <Icon name="arrow_right" className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-white/[0.06]">
                  <div className="h-52 animate-shimmer" />
                  <div className="p-5 space-y-3 bg-[#13131a]">
                    <div className="h-4 bg-white/[0.05] rounded-lg w-3/4 animate-pulse" />
                    <div className="h-3 bg-white/[0.05] rounded-lg w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-white/[0.06]" style={{ background: 'rgba(20,20,28,0.4)' }}>
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center" style={{ background: 'var(--v2-vio-g)' }}>
                <Icon name="calendar" className="w-7 h-7" style={{ color: 'var(--v2-vio-3)' }} />
              </div>
              <p className="text-lg font-bold mb-1" style={{ color: 'var(--v2-tx1)' }}>Aucun événement à {name} pour le moment</p>
              <p className="text-sm mb-6" style={{ color: 'var(--v2-tx2)' }}>De nouvelles soirées arrivent bientôt. Explorez les autres villes en attendant.</p>
              <Link to="/events" className="btn-neon-v2 text-sm">Explorer tous les événements</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((e, i) => (
                <div key={e.id}
                  className={`transition-all duration-700 ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${Math.min(i, 8) * 70}ms` }}>
                  <EventCard event={e} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ AUTRES VILLES ══════════════ */}
      <section className="pb-20">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: 'var(--v2-tx3)' }}>
            Explorer d'autres villes
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'thin' }}>
            {OTHER_CITIES.filter(c => c !== name).map(c => (
              <Link key={c} to={`/city/${encodeURIComponent(c)}`}
                className="group relative flex-shrink-0 w-44 h-28 rounded-2xl overflow-hidden ring-1 ring-white/10 hover:ring-white/30 transition-all">
                <img src={CITY_META[c].image} alt={c} loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  style={{ filter: 'brightness(0.6)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <span className="absolute bottom-2.5 left-3 font-extrabold text-white drop-shadow">{c}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
