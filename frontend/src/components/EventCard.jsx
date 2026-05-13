import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icons'

const TYPE_CONFIG = {
  gala:       { label: 'Gala',          gradient: 'from-purple-800 via-purple-900 to-black'   },
  soiree:     { label: 'Soirée',        gradient: 'from-indigo-700 via-purple-800 to-black'   },
  universite: { label: 'Universitaire', gradient: 'from-blue-700  via-blue-900  to-black'     },
  concert:    { label: 'Concert',       gradient: 'from-rose-600  via-pink-800  to-black'     },
  autre:      { label: 'Événement',     gradient: 'from-slate-600 via-slate-800 to-black'     },
}

const TYPE_ACCENT = {
  gala:       'bg-purple-500/20 text-purple-300 border-purple-400/30',
  soiree:     'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
  universite: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  concert:    'bg-rose-500/20 text-rose-300 border-rose-400/30',
  autre:      'bg-slate-500/20 text-slate-300 border-slate-400/30',
}

const dateFormatter = new Intl.DateTimeFormat('fr-MA', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function formatDate(dateStr) {
  return dateFormatter.format(new Date(dateStr))
}

function EventCard({ event }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError,  setImgError]  = useState(false)

  const cfg       = TYPE_CONFIG[event.type] || TYPE_CONFIG.autre
  const accent    = TYPE_ACCENT[event.type]  || TYPE_ACCENT.autre
  const available = event.capacity - event.tickets_sold
  const fillPct   = Math.round((event.tickets_sold / event.capacity) * 100)
  const isFull    = available <= 0
  const isHot     = fillPct >= 90 && !isFull
  const isWarm    = fillPct >= 70 && fillPct < 90
  const uColor    = event.type === 'universite' && event.university_color
                      ? event.university_color : null
  const showPhoto = event.image_url && !imgError

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex flex-col h-full rounded-2xl overflow-hidden
                 bg-white dark:bg-gray-900
                 border border-gray-100 dark:border-gray-800
                 shadow-sm card-glow
                 transition-colors duration-300"
    >
      {/* ══ PHOTO HEADER ══ */}
      <div className="relative h-52 overflow-hidden flex-shrink-0 bg-gray-900">

        {/* Shimmer while loading */}
        {!imgLoaded && !imgError && event.image_url && (
          <div className="absolute inset-0 z-10 animate-shimmer" />
        )}

        {/* Real photo */}
        {showPhoto && (
          <img
            src={event.image_url}
            alt={event.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`absolute inset-0 w-full h-full object-cover object-center
                        group-hover:scale-110 transition-transform duration-700
                        ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Gradient fallback */}
        {!showPhoto && (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${uColor ? '' : cfg.gradient}`}
            style={uColor
              ? { background: `linear-gradient(150deg, ${uColor}cc 0%, ${uColor}33 50%, #000 100%)` }
              : {}}
          />
        )}

        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t
                        from-black/85 via-black/25 to-black/10
                        group-hover:from-black/90 transition-all duration-500" />

        {/* Badges — top left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`photo-badge border ${accent}`}>
            {cfg.label}
          </span>
          {isHot && (
            <span className="photo-badge border border-red-400/40 bg-red-500/80 animate-pulse">
              Presque complet
            </span>
          )}
          {isWarm && !isHot && (
            <span className="photo-badge border border-amber-400/30 bg-amber-500/70">
              Populaire
            </span>
          )}
        </div>

        {/* University badge — top right */}
        {event.university_short_name && (
          <div className="absolute top-3 right-3">
            <span className="photo-badge border border-white/20">
              {event.university_short_name}
            </span>
          </div>
        )}

        {/* COMPLET overlay */}
        {isFull && (
          <div className="absolute inset-0 bg-black/65 flex items-center justify-center z-20">
            <span className="text-white font-bold text-sm tracking-[0.25em] uppercase
                             border border-white/40 px-5 py-2 rounded-xl backdrop-blur-sm">
              Complet
            </span>
          </div>
        )}

        {/* City + date at bottom */}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-3 pt-6
                        bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-3 text-white/80 text-xs font-medium">
            <span className="flex items-center gap-1">
              <Icon name="map" className="w-3 h-3" />
              {event.city}
            </span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1">
              <Icon name="calendar" className="w-3 h-3" />
              {formatDate(event.date)}
            </span>
          </div>
        </div>
      </div>

      {/* ══ CARD BODY ══ */}
      <div className="p-5 flex flex-col flex-1">

        {/* Title */}
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-snug mb-3
                       group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
          {event.title}
        </h3>

        {/* Meta rows */}
        <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">
          <div className="flex items-center gap-2">
            <Icon name="clock" className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="building" className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
            <span className="truncate">{event.venue}</span>
          </div>
          {event.dress_code && (
            <div className="flex items-center gap-2">
              <Icon name="tag" className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
              <span className="truncate text-gray-400 dark:text-gray-500 italic text-xs">{event.dress_code}</span>
            </div>
          )}
        </div>

        {/* Availability bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-gray-400 dark:text-gray-500">
              {available > 0 ? `${available} places disponibles` : 'Complet'}
            </span>
            <span className={`font-semibold tabular-nums ${
              fillPct >= 90 ? 'text-red-500' : fillPct >= 70 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'
            }`}>{fillPct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                fillPct >= 90 ? 'bg-red-400'
                : fillPct >= 70 ? 'bg-amber-400'
                : 'bg-emerald-400'
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium">
              À partir de
            </p>
            <p className="font-extrabold text-purple-700 dark:text-purple-400 text-xl leading-tight">
              {event.price_standard}
              <span className="text-sm font-semibold ml-1">MAD</span>
            </p>
          </div>
          <span className={`px-4 py-2 rounded-xl text-sm font-semibold
                            transition-all duration-200 ${
            isFull
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white group-hover:bg-purple-700 group-hover:shadow-lg group-hover:shadow-purple-500/30'
          }`}>
            {isFull ? 'Complet' : 'Réserver'}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default memo(EventCard)
