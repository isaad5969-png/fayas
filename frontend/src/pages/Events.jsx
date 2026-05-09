import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import EventCard from '../components/EventCard'
import { Icon } from '../components/Icons'

const TYPES = [
  { value: 'all',       label: 'Tous les types' },
  { value: 'gala',      label: 'Galas'          },
  { value: 'soiree',    label: 'Soirées'        },
  { value: 'universite',label: 'Universitaires' },
  { value: 'concert',   label: 'Concerts'       },
  { value: 'autre',     label: 'Autres'         },
]

const CITIES = [
  'all', 'Casablanca', 'Rabat', 'Marrakech',
  'Fès', 'Kénitra', 'Agadir', 'Tétouan',
  'Meknès', 'Oujda', 'Essaouira', 'Tanger',
]

export default function Events() {
  const [events,      setEvents]      = useState([])
  const [meta,        setMeta]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [type,        setType]        = useState('all')
  const [city,        setCity]        = useState('all')
  const [search,      setSearch]      = useState('')
  const [searchInput, setSearchInput] = useState('')

  const fetchEvents = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (type !== 'all') params.set('type', type)
    if (city !== 'all') params.set('city', city)
    if (search)         params.set('search', search)
    api.get(`/events?${params}`)
      .then(r => {
        const body = r.data
        if (body?.data) {
          setEvents(body.data)
          setMeta(body.meta)
        } else {
          setEvents(Array.isArray(body) ? body : [])
          setMeta(null)
        }
      })
      .finally(() => setLoading(false))
  }, [type, city, search])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const handleSearch = e => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const clearSearch = () => { setSearch(''); setSearchInput('') }

  const hasFilters = type !== 'all' || city !== 'all' || search
  const resetAll   = () => { setType('all'); setCity('all'); clearSearch() }

  return (
    <div>
      {/* ══ Header ══ */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-purple-600 text-xs font-semibold uppercase tracking-widest mb-2">
            Billetterie
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tous les événements</h1>
          <p className="text-gray-500 mt-1">Galas, soirées, concerts et événements universitaires au Maroc</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ══ Filters ══ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8 space-y-5">

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="relative flex-1">
              <Icon name="search"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                className="input pl-10"
                placeholder="Rechercher un événement, une salle, une ville…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary px-5">Chercher</button>
            {search && (
              <button type="button" onClick={clearSearch}
                className="btn-outline px-3.5" aria-label="Effacer">
                <Icon name="x" className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => (
              <button key={t.value} onClick={() => setType(t.value)}
                className={`chip ${type === t.value ? 'chip-active' : 'hover:bg-gray-200 hover:text-gray-800'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* City filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wide">
              <Icon name="map" className="w-3.5 h-3.5" />
              Ville
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CITIES.map(c => (
                <button key={c} onClick={() => setCity(c)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    city === c
                      ? 'bg-purple-100 text-purple-700 border border-purple-200 font-semibold'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}>
                  {c === 'all' ? 'Toutes' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Active filters summary */}
          {hasFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {!loading && (
                  <>
                    <span className="font-semibold text-gray-900">
                      {meta?.total ?? events.length}
                    </span>
                    {' '}résultat{(meta?.total ?? events.length) !== 1 ? 's' : ''}
                    {search && <> pour <em>"{search}"</em></>}
                  </>
                )}
              </p>
              <button onClick={resetAll} className="btn-ghost text-xs text-gray-400">
                <Icon name="x" className="w-3.5 h-3.5" />
                Réinitialiser
              </button>
            </div>
          )}
        </div>

        {/* ══ Results ══ */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                <div className="h-52 animate-shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded-lg w-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="search" className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun événement trouvé</h3>
            <p className="text-gray-400 mb-6">Essayez de modifier vos filtres ou votre recherche.</p>
            {hasFilters && (
              <button onClick={resetAll} className="btn-secondary">
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(e => <EventCard key={e.id} event={e} />)}
            </div>

            {/* Pagination hint */}
            {meta && meta.pages > 1 && (
              <p className="text-center text-sm text-gray-400 mt-8">
                Page {meta.page} sur {meta.pages} — {meta.total} événements au total
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
