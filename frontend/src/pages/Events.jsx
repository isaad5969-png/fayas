import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import EventCard from '../components/EventCard'
import { Icon } from '../components/Icons'
import { useScrollReveal } from '../hooks/useScrollReveal'

const EventMap = lazy(() => import('../components/EventMap'))

const CITY_DATA = {
  Casablanca: {
    gradient: 'from-rose-700 via-rose-600 to-orange-500',
    desc: 'La capitale économique du Maroc',
    image: 'https://images.unsplash.com/photo-1538230575309-59dfc388ae36?auto=format&fit=crop&w=1200&q=75',
    icon: 'building',
    landmark: 'Mosquée Hassan II',
  },
  Marrakech: {
    gradient: 'from-amber-800 via-amber-700 to-amber-500',
    desc: 'La ville rouge — magie & glamour',
    image: 'https://images.unsplash.com/photo-1708823081494-3e5bbd2ce931?auto=format&fit=crop&w=1200&q=75',
    icon: 'sparkles',
    landmark: 'Jemaa el-Fna',
  },
  Rabat: {
    gradient: 'from-blue-800 via-blue-700 to-cyan-600',
    desc: 'La capitale du Royaume',
    image: 'https://images.unsplash.com/photo-1763838546027-5ea880df8fbe?auto=format&fit=crop&w=1200&q=75',
    icon: 'flag',
    landmark: 'Tour Hassan',
  },
  Agadir: {
    gradient: 'from-teal-700 via-teal-600 to-emerald-500',
    desc: 'La perle du Souss — plages & soleil',
    image: 'https://images.unsplash.com/photo-1562874732-260714dfe537?auto=format&fit=crop&w=1200&q=75',
    icon: 'sun',
    landmark: 'Plage d\'Agadir',
  },
  Fès: {
    gradient: 'from-violet-800 via-violet-700 to-purple-600',
    desc: 'La capitale spirituelle & culturelle',
    image: 'https://images.unsplash.com/photo-1767936925033-9a5b59925613?auto=format&fit=crop&w=1200&q=75',
    icon: 'graduation',
    landmark: 'Tanneries de Chouara',
  },
  Tanger: {
    gradient: 'from-sky-800 via-sky-700 to-sky-500',
    desc: 'La porte de l\'Europe — carrefour des cultures',
    image: 'https://images.unsplash.com/photo-1582919534700-acf2374f10d3?auto=format&fit=crop&w=1200&q=75',
    icon: 'globe',
    landmark: 'Médina de Tanger',
  },
  Essaouira: {
    gradient: 'from-cyan-800 via-cyan-700 to-cyan-500',
    desc: 'La cité des alizés — art & liberté',
    image: 'https://images.unsplash.com/photo-1555686367-56d5186965d5?auto=format&fit=crop&w=1200&q=75',
    icon: 'map',
    landmark: 'Port & bateaux bleus',
  },
  Kénitra: {
    gradient: 'from-indigo-800 via-indigo-700 to-purple-600',
    desc: 'La ville étudiante du Gharb',
    image: 'https://images.unsplash.com/photo-1740708085335-05fb442c089a?auto=format&fit=crop&w=1200&q=75',
    icon: 'graduation',
    landmark: 'Plage de Mehdia',
  },
  Meknès: {
    gradient: 'from-orange-800 via-orange-700 to-amber-500',
    desc: 'La ville impériale d\'Ismaïl',
    image: 'https://images.unsplash.com/photo-1706793989006-f0238c69f4a2?auto=format&fit=crop&w=1200&q=75',
    icon: 'building',
    landmark: 'Bab Mansour',
  },
  Oujda: {
    gradient: 'from-pink-800 via-pink-700 to-rose-500',
    desc: 'La porte de l\'Est marocain',
    image: 'https://images.unsplash.com/photo-1632658810488-f3581ce5a249?auto=format&fit=crop&w=1200&q=75',
    icon: 'map',
    landmark: 'Centre-ville d\'Oujda',
  },
  Tétouan: {
    gradient: 'from-emerald-800 via-emerald-700 to-emerald-500',
    desc: 'La colombe du Nord — médina UNESCO',
    image: 'https://images.unsplash.com/photo-1579894461465-e8cdbe670cd1?auto=format&fit=crop&w=1200&q=75',
    icon: 'globe',
    landmark: 'Médina de Tétouan',
  },
}

const TYPES = [
  { value: 'all',        label: 'Tous les types',  icon: 'sparkles' },
  { value: 'conference', label: 'Conférences',      icon: 'bolt'     },
  { value: 'gala',       label: 'Galas',            icon: 'award'    },
  { value: 'soiree',     label: 'Soirées',          icon: 'music'    },
  { value: 'universite', label: 'Universitaires',   icon: 'graduation'},
  { value: 'concert',    label: 'Concerts',         icon: 'ticket'   },
  { value: 'autre',      label: 'Autres',           icon: 'tag'      },
]

const CITIES = [
  'all','Casablanca','Rabat','Marrakech',
  'Fès','Kénitra','Agadir','Tétouan',
  'Meknès','Oujda','Essaouira','Tanger',
]

function CitySection({ cityName, events: list, idx, onFilterCity }) {
  const [imgErr, setImgErr] = useState(false)
  const cd = CITY_DATA[cityName] || { gradient: 'from-purple-700 to-purple-900', desc: '', icon: 'map', landmark: '' }
  const full  = list.filter(e => (e.capacity - e.tickets_sold) <= 0).length
  const minPrice = Math.min(...list.map(e => e.price_standard || 0))

  return (
    <section id={`city-${cityName}`} className="scroll-mt-24">

      {/* ── City banner ── */}
      <div className="relative overflow-hidden rounded-2xl mb-6 shadow-xl" style={{ minHeight: '180px' }}>

        {/* Photo or gradient background */}
        {cd.image && !imgErr ? (
          <img src={cd.image} alt={cityName} onError={() => setImgErr(true)}
            className="absolute inset-0 w-full h-full object-cover object-center" />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-r ${cd.gradient}`} />
        )}

        {/* Scrims */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-5">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25
                            flex items-center justify-center flex-shrink-0 shadow-lg">
              <Icon name={cd.icon || 'map'} className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>

            <div>
              {/* Label */}
              <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                Maroc · {cd.landmark || 'Événements'}
              </div>

              {/* City name */}
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
                {cityName}
              </h2>

              {/* Description */}
              {cd.desc && <p className="text-white/75 text-sm mt-1 font-medium">{cd.desc}</p>}

              {/* Stats pills */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm
                                 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Icon name="ticket" className="w-3.5 h-3.5" />
                  {list.length} événement{list.length > 1 ? 's' : ''}
                </span>
                {full > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-red-500/30 backdrop-blur-sm
                                   border border-red-400/30 text-red-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Icon name="x" className="w-3 h-3" />
                    {full} complet{full > 1 ? 's' : ''}
                  </span>
                )}
                {minPrice >= 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-sm
                                   border border-emerald-400/30 text-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Icon name="tag" className="w-3 h-3" />
                    Dès {minPrice} MAD
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Filter CTA */}
          <button onClick={onFilterCity}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white/15 hover:bg-white/25
                       backdrop-blur-sm border border-white/30 text-white font-bold
                       px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-105 shadow-lg self-start md:self-center">
            Voir {cityName} uniquement
            <Icon name="arrow_right" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Events grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((e, i) => (
          <div key={e.id} className="transition-all duration-500" style={{ transitionDelay: `${i * 50}ms` }}>
            <EventCard event={e} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [events,      setEvents]      = useState([])
  const [meta,        setMeta]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [type,        setType]        = useState(searchParams.get('type') || 'all')
  const [city,        setCity]        = useState(searchParams.get('city') || 'all')
  const [search,      setSearch]      = useState(searchParams.get('search') || '')
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [viewMode,    setViewMode]    = useState(searchParams.get('view') || 'byCity')

  const [gridRef, gridVisible] = useScrollReveal(0.02)
  // gridRef/gridVisible only used for classic grid view

  const fetchEvents = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (type !== 'all') params.set('type', type)
    if (city !== 'all') params.set('city', city)
    if (search)         params.set('search', search)
    api.get(`/events?${params}`)
      .then(r => {
        const body = r.data
        if (body?.data) { setEvents(body.data); setMeta(body.meta) }
        else            { setEvents(Array.isArray(body) ? body : []); setMeta(null) }
      })
      .finally(() => setLoading(false))
  }, [type, city, search])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  useEffect(() => {
    const p = {}
    if (type    !== 'all')    p.type   = type
    if (city    !== 'all')    p.city   = city
    if (search)               p.search = search
    if (viewMode !== 'byCity') p.view  = viewMode
    setSearchParams(p, { replace: true })
  }, [type, city, search, viewMode]) // eslint-disable-line

  const eventsByCity = useMemo(() => {
    const groups = {}
    for (const e of events) {
      const c = e.city || 'Autres'
      if (!groups[c]) groups[c] = []
      groups[c].push(e)
    }
    return Object.entries(groups)
      .map(([c, list]) => ({ city: c, events: list }))
      .sort((a, b) => b.events.length - a.events.length || a.city.localeCompare(b.city))
  }, [events])

  const handleSearch = e => { e.preventDefault(); setSearch(searchInput) }
  const clearSearch  = () => { setSearch(''); setSearchInput('') }
  const hasFilters   = type !== 'all' || city !== 'all' || search
  const resetAll     = () => { setType('all'); setCity('all'); clearSearch() }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors duration-300">

      {/* ══ Header ══ */}
      <div className="bg-white dark:bg-gradient-to-b dark:from-[#0d0d18] dark:to-[#0a0a0f] border-b border-gray-100 dark:border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="eyebrow-night mb-3 inline-flex">
                <span className="dot-neon" />
                Billetterie
              </span>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-2">
                Tous les événements
              </h1>
              <p className="text-gray-500 dark:text-slate-400 mt-1">
                Galas, soirées, concerts et événements universitaires au Maroc
              </p>
            </div>

            {/* Carte interactive CTA */}
            <a href="/map"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm
                         bg-gradient-to-br from-violet-600 to-blue-600 text-white
                         shadow-lg shadow-violet-500/30
                         hover:from-violet-500 hover:to-blue-500 hover:scale-105 hover:shadow-violet-500/50
                         transition-all duration-300 flex-shrink-0">
              <span className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon name="map" className="w-4 h-4" />
              </span>
              Carte interactive
              <span className="text-white/60 text-xs font-medium">Maroc</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ══ Filters ══ */}
        <div className="bg-white dark:glass-panel-2026 rounded-2xl border border-gray-100
                        shadow-sm dark:shadow-none p-5 mb-8 space-y-5">

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="relative flex-1">
              <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
              <input
                className="input dark:input-night pl-10"
                placeholder="Rechercher un événement, une salle, une ville…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary dark:btn-neon px-5">Chercher</button>
            {search && (
              <button type="button" onClick={clearSearch}
                className="px-3.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all"
                aria-label="Effacer">
                <Icon name="x" className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => (
              <button key={t.value} onClick={() => setType(t.value)}
                className={`chip dark:chip-night ${type === t.value ? 'chip-active dark:chip-night-active' : ''}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* City filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wide">
              <Icon name="map" className="w-3.5 h-3.5" />
              Ville
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CITIES.map(c => (
                <button key={c} onClick={() => setCity(c)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    city === c
                      ? 'bg-violet-100 dark:bg-violet-500/25 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/50 font-semibold dark:shadow-[0_0_16px_rgba(124,58,237,0.22)]'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-violet-500/10 dark:border dark:border-white/[0.07] dark:hover:border-violet-500/30'
                  }`}>
                  {c === 'all' ? 'Toutes' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Results count + view toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/[0.06] gap-3 flex-wrap">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {!loading && (
                <>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {meta?.total ?? events.length}
                  </span>
                  {' '}résultat{(meta?.total ?? events.length) !== 1 ? 's' : ''}
                  {search && <> pour <em>"{search}"</em></>}
                  {viewMode === 'byCity' && eventsByCity.length > 0 && (
                    <> · <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {eventsByCity.length} ville{eventsByCity.length > 1 ? 's' : ''}
                    </span></>
                  )}
                </>
              )}
            </p>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-white/[0.04] dark:backdrop-blur-sm dark:border dark:border-white/[0.07] rounded-xl p-1">
                {[
                  { id: 'byCity', icon: 'building', label: 'Par ville' },
                  { id: 'grid',   icon: 'chart',    label: 'Grille'    },
                  { id: 'map',    icon: 'map',      label: 'Carte'     },
                ].map(v => (
                  <button key={v.id} onClick={() => setViewMode(v.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === v.id
                        ? 'bg-white dark:bg-violet-500/20 text-purple-700 dark:text-violet-300 shadow-sm dark:shadow-[0_0_12px_rgba(124,58,237,0.2)] dark:border dark:border-violet-500/40'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'
                    }`}>
                    <Icon name={v.icon} className="w-3.5 h-3.5" />
                    {v.label}
                  </button>
                ))}
              </div>
              {hasFilters && (
                <button onClick={resetAll} className="btn-ghost text-xs text-gray-400">
                  <Icon name="x" className="w-3.5 h-3.5" />
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ══ Results ══ */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="sk-card fade-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="sk-card-img" style={{ height: '13rem' }} />
                <div className="sk-card-body">
                  <div className="sk-title" />
                  <div className="sk-text" />
                  <div className="sk-text" style={{ width: '75%' }} />
                  <div className="flex items-center justify-between pt-1">
                    <div className="sk-badge" />
                    <div className="sk-btn" style={{ width: '5.5rem', height: '1.75rem' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : events.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-[#0d0d16] rounded-2xl border border-gray-100 dark:border-white/[0.07]">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/[0.05] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="search" className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Aucun événement trouvé</h3>
            <p className="text-gray-400 mb-6">Essayez de modifier vos filtres ou votre recherche.</p>
            {hasFilters && <button onClick={resetAll} className="btn-secondary">Réinitialiser les filtres</button>}
          </div>

        ) : viewMode === 'byCity' ? (
          /* ══ Vue par ville ══ */
          <div className="space-y-14">

            {/* Navigation rapide entre villes */}
            {eventsByCity.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 -mt-2">
                <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide flex items-center gap-1">
                  <Icon name="map" className="w-3.5 h-3.5" />
                  Aller à :
                </span>
                {eventsByCity.map(({ city: c, events: list }) => {
                  const cd = CITY_DATA[c]
                  return (
                    <a key={c} href={`#city-${c}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                                 bg-white dark:bg-white/[0.04] dark:backdrop-blur-sm border border-gray-200 dark:border-white/[0.08]
                                 text-gray-700 dark:text-slate-300
                                 hover:border-purple-300 dark:hover:border-violet-500/40 hover:text-purple-700 dark:hover:text-violet-300
                                 shadow-sm transition-all hover:-translate-y-0.5">
                      {cd && <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${cd.gradient} flex-shrink-0`} />}
                      {c}
                      <span className="bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                        {list.length}
                      </span>
                    </a>
                  )
                })}
              </div>
            )}

            {eventsByCity.map(({ city: c, events: list }, idx) => (
              <CitySection
                key={c}
                cityName={c}
                events={list}
                idx={idx}
                onFilterCity={() => { setCity(c); setViewMode('grid') }}
              />
            ))}

            {meta && meta.pages > 1 && (
              <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-8">
                Page {meta.page} sur {meta.pages} — {meta.total} événements au total
              </p>
            )}
          </div>

        ) : viewMode === 'map' ? (
          /* ══ Vue carte interactive ══ */
          <Suspense fallback={
            <div className="rounded-2xl bg-white dark:bg-[#0d0d16] border border-gray-100 dark:border-white/[0.07] flex items-center justify-center" style={{ height: '600px' }}>
              <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-slate-500">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">Chargement de la carte…</p>
              </div>
            </div>
          }>
            <EventMap events={events} />
          </Suspense>

        ) : (
          /* ══ Vue grille classique ══ */
          <>
            <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((e, i) => (
                <div key={e.id}
                  className={`transition-all duration-600 ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${(i % 6) * 60}ms` }}>
                  <EventCard event={e} />
                </div>
              ))}
            </div>
            {meta && meta.pages > 1 && (
              <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-8">
                Page {meta.page} sur {meta.pages} — {meta.total} événements au total
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
