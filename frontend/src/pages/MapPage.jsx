import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import EventMap from '../components/EventMap'
import { Icon } from '../components/Icons'

export default function MapPage() {
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/events?limit=50')
      .then(r => {
        const body = r.data
        setEvents(Array.isArray(body) ? body : (body?.data ?? []))
      })
      .finally(() => setLoading(false))
  }, [])

  const cities = [...new Set(events.map(e => e.city).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors duration-300">

      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-white dark:bg-gradient-to-b dark:from-[#0d0d18] dark:to-[#0a0a0f]
                      border-b border-gray-100 dark:border-white/[0.05]">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/3 w-80 h-40 bg-violet-500/10 blur-3xl pointer-events-none dark:block hidden" />
        <div className="absolute top-0 right-1/4 w-60 h-40 bg-blue-500/8 blur-3xl pointer-events-none dark:block hidden" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <span className="eyebrow-night mb-3 inline-flex">
                <span className="dot-neon" />
                Carte interactive
              </span>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-2 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600
                                 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Icon name="map" className="w-5 h-5 text-white" />
                </span>
                Événements au Maroc
              </h1>
              <p className="text-gray-500 dark:text-slate-400 mt-1.5">
                {loading ? 'Chargement…' : `${events.length} événements · ${cities.length} villes`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/events"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                           bg-gray-100 dark:bg-white/[0.05] dark:border dark:border-white/[0.08]
                           text-gray-700 dark:text-slate-300 text-sm font-semibold
                           hover:bg-gray-200 dark:hover:bg-white/[0.09] transition-all">
                <Icon name="arrow_right" className="w-4 h-4 rotate-180" />
                Tous les événements
              </Link>
            </div>
          </div>

          {/* City quick-links */}
          {!loading && cities.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-5">
              <span className="text-xs text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wide">
                Villes :
              </span>
              {cities.map(c => (
                <Link key={c} to={`/events?city=${encodeURIComponent(c)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                             bg-gray-100 dark:bg-white/[0.04] dark:border dark:border-white/[0.08]
                             text-gray-600 dark:text-slate-400
                             hover:bg-violet-100 dark:hover:bg-violet-500/15
                             hover:text-violet-700 dark:hover:text-violet-300 transition-all">
                  <Icon name="map" className="w-3 h-3" />
                  {c}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Map ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="rounded-2xl bg-white dark:bg-[#0d0d16] border border-gray-100 dark:border-white/[0.07]
                          flex items-center justify-center" style={{ height: '620px' }}>
            <div className="flex flex-col items-center gap-4 text-gray-400 dark:text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-1">
                <Icon name="map" className="w-6 h-6 text-violet-500" />
              </div>
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Chargement des événements…</p>
            </div>
          </div>
        ) : (
          <EventMap events={events} />
        )}

        {/* Info cards below map */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { icon: 'ticket',    label: 'Événements',    value: events.length,                                              color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
              { icon: 'map',      label: 'Villes',        value: cities.length,                                              color: 'text-blue-500 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-500/10'    },
              { icon: 'sparkles', label: 'Disponibles',   value: events.filter(e => (e.capacity - e.tickets_sold) > 0).length, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { icon: 'tag',      label: 'Prix min',      value: Math.min(...events.map(e => e.price_standard || 0)) + ' MAD', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10'  },
            ].map(s => (
              <div key={s.label}
                className="bg-white dark:bg-[#13131a] rounded-2xl border border-gray-100 dark:border-white/[0.06]
                           p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={s.icon} className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight">{s.value}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
