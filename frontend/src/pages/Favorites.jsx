import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import EventCard from '../components/EventCard'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { Icon } from '../components/Icons'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function Favorites() {
  const { isAuthenticated } = useAuth()
  const { favoriteIds, count } = useFavorites()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [gridRef, gridVisible] = useScrollReveal(0.02)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    if (isAuthenticated) {
      // Authenticated: fetch directly from server
      api.get('/favorites/events')
        .then(r => { if (!cancelled) setEvents(r.data) })
        .catch(() => {})
        .finally(() => !cancelled && setLoading(false))
    } else if (favoriteIds.size > 0) {
      // Guest: fetch each event by id
      const ids = [...favoriteIds]
      Promise.all(ids.map(id =>
        api.get(`/events/${id}`).then(r => r.data).catch(() => null)
      ))
        .then(results => {
          if (cancelled) return
          const valid = results.filter(Boolean)
          valid.sort((a, b) => new Date(a.date) - new Date(b.date))
          setEvents(valid)
        })
        .finally(() => !cancelled && setLoading(false))
    } else {
      setEvents([])
      setLoading(false)
    }

    return () => { cancelled = true }
  }, [isAuthenticated, favoriteIds.size])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-mesh-gradient text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" />

        {/* Floating decorative hearts */}
        <div className="absolute top-10 left-10 text-white/10 text-7xl animate-float-slow select-none pointer-events-none">♥</div>
        <div className="absolute bottom-8 right-16 text-white/10 text-9xl animate-float-medium select-none pointer-events-none">♥</div>
        <div className="absolute top-1/2 right-1/3 text-white/5 text-5xl animate-float-fast select-none pointer-events-none">♥</div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-2xl shadow-rose-500/40 border border-white/20">
              <Icon name="heart" className="w-8 h-8 text-white fill-white" strokeWidth={0} />
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Mes coups de cœur</p>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                {count > 0 ? `${count} événement${count > 1 ? 's' : ''} favori${count > 1 ? 's' : ''}` : 'Mes Favoris'}
              </h1>
            </div>
          </div>

          {count > 0 && (
            <p className="text-white/70 text-sm max-w-xl">
              Retrouvez ici tous les événements que vous avez aimés. Réservez avant qu'ils ne se remplissent !
            </p>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {count === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex items-center justify-center">
                <Icon name="heart" className="w-12 h-12 text-rose-400" strokeWidth={1.5} />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-gray-900 border-2 border-rose-200 dark:border-rose-800 flex items-center justify-center">
                <Icon name="plus_circle" className="w-4 h-4 text-rose-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Aucun favori pour l'instant</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Cliquez sur le cœur d'un événement pour l'ajouter ici. Vous pourrez les retrouver facilement !
            </p>
            <Link to="/events" className="btn-primary inline-flex">
              <Icon name="search" className="w-4 h-4" />
              Découvrir les événements
            </Link>

            {!isAuthenticated && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-6 px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50">
                <Icon name="info" className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-purple-500" />
                Vos favoris sont sauvegardés dans ce navigateur. <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">Connectez-vous</Link> pour les synchroniser sur tous vos appareils.
              </p>
            )}
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e, i) => (
              <div key={e.id}
                className={`transition-all duration-600 ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${(i % 6) * 60}ms` }}>
                <EventCard event={e} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
