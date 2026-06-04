import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import EventMap from '../components/EventMap'
import { Icon } from '../components/Icons'

const TYPE_CFG = {
  soiree:     { color: '#7c3aed', label: 'Soirée',   icon: 'sparkles' },
  gala:       { color: '#f59e0b', label: 'Gala',     icon: 'star'     },
  concert:    { color: '#3b82f6', label: 'Concert',  icon: 'music'    },
  universite: { color: '#10b981', label: 'Étudiant', icon: 'building' },
  festival:   { color: '#06b6d4', label: 'Festival', icon: 'ticket'   },
}

function EventListCard({ ev, isSelected, onClick }) {
  const cfg    = TYPE_CFG[ev.type] || { color: '#7c3aed', label: ev.type }
  const isFull = (ev.capacity - ev.tickets_sold) <= 0
  const avail  = Math.max(0, ev.capacity - ev.tickets_sold)
  const pct    = Math.min(100, Math.round((ev.tickets_sold / ev.capacity) * 100))

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl transition-all group border overflow-hidden ${
        isSelected
          ? 'border-violet-500/40 bg-violet-600/10'
          : 'border-transparent hover:border-white/[0.07] hover:bg-white/[0.03]'
      }`}>
      {/* Image strip */}
      {ev.image_url && (
        <div className="h-20 w-full overflow-hidden relative">
          <img src={ev.image_url} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <span className="absolute left-2.5 bottom-2 text-[10px] font-bold text-white/60 uppercase tracking-wider">
            {ev.city}
          </span>
        </div>
      )}

      <div className="px-3 py-2.5">
        {/* Type + price */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</span>
          <span className={`text-[11px] font-bold ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>
            {isFull ? 'Complet' : `${ev.price_standard} MAD`}
          </span>
        </div>

        {/* Title */}
        <p className="text-sm font-bold text-white/90 leading-snug line-clamp-2">{ev.title}</p>

        {/* Meta */}
        <p className="text-[11px] text-white/35 mt-1 truncate">
          {!ev.image_url && <>{ev.city} · </>}
          {ev.venue?.split(' ').slice(0, 4).join(' ')}
        </p>

        {/* Capacity bar */}
        <div className="mt-2">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: isFull ? '#ef4444' : pct > 75 ? '#f59e0b' : cfg.color,
              }} />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[9px] text-white/20">{avail} places</span>
            <span className="text-[9px] text-white/20">{pct}% vendu</span>
          </div>
        </div>
      </div>
    </button>
  )
}

export default function MapPage() {
  const [events,      setEvents]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [activeTypes, setActiveTypes] = useState(new Set())
  const [cityFilter,  setCityFilter]  = useState('')
  const [maxPrice,    setMaxPrice]    = useState(9999)
  const [selectedId,  setSelectedId]  = useState(null)
  const [showList,    setShowList]    = useState(true)

  useEffect(() => {
    api.get('/events?limit=100')
      .then(r => {
        const body = r.data
        const arr  = Array.isArray(body) ? body : (body?.data ?? [])
        setEvents(arr)
        setMaxPrice(Math.max(...arr.map(e => e.price_standard || 0), 2000))
      })
      .finally(() => setLoading(false))
  }, [])

  const cities       = useMemo(() => [...new Set(events.map(e => e.city).filter(Boolean))].sort(), [events])
  const globalMax    = useMemo(() => Math.max(...events.map(e => e.price_standard || 0), 2000), [events])

  const filtered = useMemo(() => events.filter(ev => {
    if (activeTypes.size > 0 && !activeTypes.has(ev.type)) return false
    if (cityFilter && ev.city !== cityFilter) return false
    if ((ev.price_standard || 0) > maxPrice) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matches = (ev.title || '').toLowerCase().includes(q)
        || (ev.city  || '').toLowerCase().includes(q)
        || (ev.venue || '').toLowerCase().includes(q)
      if (!matches) return false
    }
    return true
  }), [events, activeTypes, cityFilter, maxPrice, search])

  const toggleType = (t) => setActiveTypes(prev => {
    const next = new Set(prev)
    if (next.has(t)) next.delete(t); else next.add(t)
    return next
  })

  const clearFilters = () => {
    setSearch(''); setActiveTypes(new Set()); setCityFilter(''); setMaxPrice(globalMax)
  }
  const hasFilters = search || activeTypes.size > 0 || cityFilter || maxPrice < globalMax

  const statsItems = [
    { val: filtered.length,                                                   lbl: 'evt' },
    { val: [...new Set(filtered.map(e => e.city))].length,                    lbl: 'villes' },
    { val: filtered.filter(e => (e.capacity - e.tickets_sold) > 0).length,   lbl: 'dispo' },
    { val: filtered.length ? `${Math.min(...filtered.map(e => e.price_standard || 0))} MAD` : '—', lbl: 'min' },
  ]

  return (
    <div className="map-page-root flex flex-col" style={{ height: 'calc(100vh - 64px)', background: '#07070d' }}>

      {/* ══════════════════ FILTER BAR ══════════════════ */}
      <div className="flex-shrink-0 flex flex-wrap items-center gap-2.5 px-4 py-2.5"
        style={{ background: 'rgba(8,8,16,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 10 }}>

        {/* Search */}
        <div className="relative min-w-[180px] max-w-[240px] flex-shrink-0">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5
                       text-sm text-white placeholder-white/25 focus:outline-none
                       focus:border-violet-500/50 focus:bg-white/[0.07] transition-all"
          />
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-white/[0.08] flex-shrink-0 hidden sm:block" />

        {/* Type filters */}
        {Object.entries(TYPE_CFG).map(([key, cfg]) => {
          const active = activeTypes.has(key)
          return (
            <button key={key} onClick={() => toggleType(key)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex-shrink-0"
              style={active
                ? { background: cfg.color, color: '#fff', boxShadow: `0 0 12px ${cfg.color}50` }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
              }>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: active ? 'rgba(255,255,255,0.8)' : cfg.color }} />
              {cfg.label}
            </button>
          )
        })}

        {/* Separator */}
        <div className="w-px h-5 bg-white/[0.08] flex-shrink-0 hidden sm:block" />

        {/* City filter */}
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
          className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-sm text-white/70
                     focus:outline-none focus:border-violet-500/50 transition-all appearance-none cursor-pointer flex-shrink-0"
          style={{ minWidth: 120 }}>
          <option value="" style={{ background: '#0d0d18' }}>Toutes les villes</option>
          {cities.map(c => <option key={c} value={c} style={{ background: '#0d0d18' }}>{c}</option>)}
        </select>

        {/* Price slider */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] text-white/30 whitespace-nowrap">≤</span>
          <input type="range" min={0} max={globalMax} step={50} value={maxPrice}
            onChange={e => setMaxPrice(+e.target.value)}
            className="w-24 accent-violet-500 cursor-pointer" />
          <span className="text-[11px] text-violet-300 font-bold whitespace-nowrap w-20">
            {maxPrice >= globalMax ? 'Tous prix' : `${maxPrice} MAD`}
          </span>
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <button onClick={clearFilters}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] text-red-400/80
                       hover:text-red-300 hover:bg-red-500/10 transition-all flex-shrink-0 border border-red-500/20">
            <Icon name="x" className="w-3 h-3" />
            Effacer
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1 min-w-0" />

        {/* Count */}
        <span className="text-sm text-white/40 flex-shrink-0 hidden sm:block">
          <span className="text-white font-bold">{filtered.length}</span> événements
        </span>

        {/* List toggle */}
        <button onClick={() => setShowList(v => !v)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
            showList ? 'bg-violet-600 text-white' : 'bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white'
          }`}>
          <Icon name="filter" className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Liste</span>
        </button>

        <Link to="/events"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]
                     text-xs text-white/50 hover:text-white font-semibold transition-all flex-shrink-0">
          <Icon name="arrow_right" className="w-3.5 h-3.5 rotate-180" />
          <span className="hidden sm:inline">Grille</span>
        </Link>
      </div>

      {/* ══════════════════ MAIN AREA ══════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Event list panel ── */}
        {showList && (
          <div className="w-72 flex-shrink-0 flex flex-col overflow-hidden"
            style={{ background: 'rgba(9,9,17,0.98)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>

            {/* Header */}
            <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
              </span>
              {selectedId && (
                <button onClick={() => setSelectedId(null)}
                  className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 transition-colors">
                  <Icon name="x" className="w-3 h-3" />
                  Désélectionner
                </button>
              )}
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(124,58,237,0.3) transparent' }}>
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                    <Icon name="map" className="w-6 h-6 text-violet-500/50" />
                  </div>
                  <p className="text-sm text-white/25">Aucun événement</p>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-violet-400 hover:text-violet-300 mt-2 transition-colors">
                      Effacer les filtres
                    </button>
                  )}
                </div>
              ) : (
                filtered.map(ev => (
                  <EventListCard
                    key={ev.id}
                    ev={ev}
                    isSelected={selectedId === ev.id}
                    onClick={() => setSelectedId(ev.id === selectedId ? null : ev.id)}
                  />
                ))
              )}
            </div>

            {/* List footer stats */}
            <div className="flex-shrink-0 px-4 py-2.5 grid grid-cols-2 gap-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {statsItems.map(s => (
                <div key={s.lbl} className="text-center">
                  <p className="text-sm font-extrabold text-white">{s.val}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">{s.lbl}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Map ── */}
        <div className="flex-1 relative overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#0a0a0f' }}>
              <div className="flex flex-col items-center gap-4 text-white/30">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-1">
                  <Icon name="map" className="w-7 h-7 text-violet-500" />
                </div>
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">Chargement de la carte…</p>
              </div>
            </div>
          ) : (
            <EventMap
              events={filtered}
              selectedId={selectedId}
              onSelect={ev => setSelectedId(ev.id === selectedId ? null : ev.id)}
            />
          )}

          {/* ── Stats bar — floats above map ── */}
          {!loading && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[900] flex items-center gap-2 pointer-events-none">
              {statsItems.map((s, i) => {
                const colors = ['#7c3aed','#3b82f6','#10b981','#f59e0b']
                return (
                  <div key={s.lbl} className="glass-panel-2026 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-black/40">
                    <span className="text-sm font-extrabold" style={{ color: colors[i] }}>{s.val}</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">{s.lbl}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Empty state overlay ── */}
          {!loading && filtered.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[800]">
              <div className="glass-panel-2026 rounded-2xl px-8 py-6 text-center pointer-events-auto">
                <Icon name="search" className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/60 font-semibold mb-3">Aucun événement avec ces filtres</p>
                <button onClick={clearFilters}
                  className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                  Effacer les filtres
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}