import { useState } from 'react'
import { useFavorites } from '../context/FavoritesContext'
import { Icon } from './Icons'
import toast from 'react-hot-toast'

/**
 * Bouton cœur réutilisable.
 * Variants:
 *   - "floating" : bouton flottant pour cartes (rond, glassmorphism)
 *   - "inline"   : bouton inline pour pages détail
 *   - "minimal"  : icône simple (pour listes denses)
 */
export default function FavoriteButton({ eventId, variant = 'floating', eventTitle = 'cet événement' }) {
  const { isFavorite, toggle } = useFavorites()
  const [popping, setPopping] = useState(false)
  const fav = isFavorite(eventId)

  const handleClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setPopping(true)
    setTimeout(() => setPopping(false), 400)
    const nowFav = await toggle(eventId)
    if (nowFav) {
      toast.success(`Ajouté à vos favoris ❤️`, { duration: 1800 })
    } else {
      toast(`Retiré de vos favoris`, { duration: 1500, icon: '💔' })
    }
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        className={`group/fav transition-all duration-200 ${popping ? 'animate-heart-pop' : ''}`}
      >
        <Icon
          name="heart"
          className={`w-4 h-4 transition-all ${fav
            ? 'text-rose-500 fill-rose-500'
            : 'text-gray-400 hover:text-rose-500'}`}
          strokeWidth={fav ? 0 : 2}
        />
      </button>
    )
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        className={`group/fav inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border-2 ${
          fav
            ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
            : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400'
        } ${popping ? 'animate-heart-pop' : ''}`}
      >
        <Icon
          name="heart"
          className={`w-4 h-4 transition-transform group-hover/fav:scale-110 ${fav ? 'fill-current' : ''}`}
          strokeWidth={fav ? 0 : 2}
        />
        {fav ? 'Dans vos favoris' : 'Ajouter aux favoris'}
      </button>
    )
  }

  if (variant === 'hero') {
    // Variant pour utilisation dans une barre d'actions de hero (inline, fond sombre)
    return (
      <button
        onClick={handleClick}
        aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        className={`group/fav w-10 h-10 rounded-xl flex items-center justify-center
                    bg-white/10 hover:bg-white/20 backdrop-blur-sm
                    border border-white/20 hover:border-white/40
                    text-white transition-all duration-200
                    hover:scale-105 active:scale-95
                    ${popping ? 'animate-heart-pop' : ''}`}
      >
        <Icon
          name="heart"
          className={`w-4 h-4 transition-all ${fav ? 'text-rose-400 fill-rose-400 drop-shadow-glow' : 'text-white group-hover/fav:text-rose-300'}`}
          strokeWidth={fav ? 0 : 2}
        />
      </button>
    )
  }

  // floating (par défaut, pour cartes)
  return (
    <button
      onClick={handleClick}
      aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`group/fav absolute top-3 right-3 z-30 w-10 h-10 rounded-full
                  bg-black/40 hover:bg-black/60 backdrop-blur-md
                  border border-white/20 hover:border-white/40
                  flex items-center justify-center
                  transition-all duration-200
                  hover:scale-110 active:scale-95
                  ${popping ? 'animate-heart-pop' : ''}`}
    >
      <Icon
        name="heart"
        className={`w-4 h-4 transition-all duration-300 ${
          fav ? 'text-rose-400 fill-rose-400 drop-shadow-glow' : 'text-white group-hover/fav:text-rose-300'
        }`}
        strokeWidth={fav ? 0 : 2}
      />
    </button>
  )
}
