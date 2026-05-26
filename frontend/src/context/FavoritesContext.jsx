import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState(() => {
    // Fallback : pour les visiteurs non connectés, on garde les favoris en localStorage
    const saved = localStorage.getItem('favorites')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })
  const [loading, setLoading] = useState(false)

  // Sync from server when authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    setLoading(true)
    api.get('/favorites')
      .then(r => {
        const serverIds = new Set(r.data.event_ids)
        // Merge local guest favorites with server
        const local = JSON.parse(localStorage.getItem('favorites') || '[]')
        const toUpload = local.filter(id => !serverIds.has(id))
        Promise.all(toUpload.map(id => api.post(`/favorites/${id}`).catch(() => {})))
          .then(() => {
            local.forEach(id => serverIds.add(id))
            setFavoriteIds(new Set(serverIds))
            localStorage.removeItem('favorites')
          })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  // Persist guest favorites locally
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('favorites', JSON.stringify([...favoriteIds]))
    }
  }, [favoriteIds, isAuthenticated])

  const isFavorite = useCallback(id => favoriteIds.has(id), [favoriteIds])

  const toggle = useCallback(async (eventId) => {
    const wasFavorite = favoriteIds.has(eventId)
    // Optimistic update
    setFavoriteIds(prev => {
      const next = new Set(prev)
      if (wasFavorite) next.delete(eventId)
      else next.add(eventId)
      return next
    })
    if (isAuthenticated) {
      try {
        if (wasFavorite) await api.delete(`/favorites/${eventId}`)
        else await api.post(`/favorites/${eventId}`)
      } catch {
        // Revert on error
        setFavoriteIds(prev => {
          const next = new Set(prev)
          if (wasFavorite) next.add(eventId)
          else next.delete(eventId)
          return next
        })
      }
    }
    return !wasFavorite
  }, [favoriteIds, isAuthenticated])

  return (
    <FavoritesContext.Provider value={{
      favoriteIds,
      count: favoriteIds.size,
      isFavorite,
      toggle,
      loading,
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => useContext(FavoritesContext)
