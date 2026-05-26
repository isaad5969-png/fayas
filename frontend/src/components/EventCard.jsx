import { memo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icons'
import FavoriteButton from './FavoriteButton'
import ShareButton from './ShareButton'

const TYPE_CONFIG = {
  conference: { label: 'Conférence',    gradient: 'from-blue-900  via-blue-950  to-black'    },
  gala:       { label: 'Gala',          gradient: 'from-purple-900 via-violet-950 to-black'  },
  soiree:     { label: 'Soirée',        gradient: 'from-indigo-900 via-purple-950 to-black'  },
  universite: { label: 'Universitaire', gradient: 'from-violet-900 via-violet-950 to-black'  },
  concert:    { label: 'Concert',       gradient: 'from-rose-900  via-pink-950  to-black'    },
  autre:      { label: 'Événement',     gradient: 'from-slate-800 via-slate-900 to-black'    },
}

const TYPE_ACCENT = {
  conference: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
  gala:       'bg-purple-500/20 text-purple-200 border-purple-400/30',
  soiree:     'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
  universite: 'bg-violet-500/20 text-violet-200 border-violet-400/30',
  concert:    'bg-rose-500/20 text-rose-200 border-rose-400/30',
  autre:      'bg-slate-500/20 text-slate-200 border-slate-400/30',
}

const FILL_COLORS = {
  hot:  'bg-gradient-to-r from-red-600 to-rose-500',
  warm: 'bg-gradient-to-r from-amber-500 to-orange-400',
  ok:   'bg-gradient-to-r from-violet-600 to-blue-500',
}

const dateFormatter = new Intl.DateTimeFormat('fr-MA', { day: 'numeric', month: 'short', year: 'numeric' })
const formatDate = d => dateFormatter.format(new Date(d))

function EventCard({ event }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError,  setImgError]  = useState(false)
  const [tilt,      setTilt]      = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)

  const cfg       = TYPE_CONFIG[event.type] || TYPE_CONFIG.autre
  const accent    = TYPE_ACCENT[event.type]  || TYPE_ACCENT.autre
  const available = event.capacity - event.tickets_sold
  const fillPct   = Math.round((event.tickets_sold / event.capacity) * 100)
  const isFull    = available <= 0
  const isHot     = fillPct >= 90 && !isFull
  const isWarm    = fillPct >= 70 && fillPct < 90
  const uColor    = event.type === 'universite' && event.university_color ? event.university_color : null
  const showPhoto = event.image_url && !imgError
  const fillColor = isHot ? FILL_COLORS.hot : isWarm ? FILL_COLORS.warm : FILL_COLORS.ok

  const handleMouseMove = e => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    setTilt({ x: y * -5, y: x * 5 })
  }
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 })

  const eventUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/events/${event.id}`
    : `/events/${event.id}`

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.2s ease-out',
      }}
      className="relative h-full"
    >
      {/* Floating actions */}
      <FavoriteButton eventId={event.id} eventTitle={event.title} />
      <ShareButton variant="floating" eventTitle={event.title} eventUrl={eventUrl} />

      <Link
        to={`/events/${event.id}`}
        className="group flex flex-col h-full rounded-2xl overflow-hidden
                   bg-white dark:bg-[#0d0d16]
                   border border-gray-100 dark:border-white/[0.07]
                   shadow-sm dark:shadow-none
                   hover:shadow-2xl hover:shadow-violet-500/15
                   dark:hover:shadow-[0_20px_60px_-10px_rgba(124,58,237,0.35),0_0_0_1px_rgba(124,58,237,0.25)]
                   dark:hover:border-violet-500/40
                   transition-all duration-500
                   card-accent-top"
      >
        {/* ══ PHOTO ══ */}
        <div className="relative h-52 overflow-hidden flex-shrink-0 bg-[#0d0d14] img-zoom">

          {/* Shimmer */}
          {!imgLoaded && !imgError && event.image_url && (
            <div className="absolute inset-0 z-10 animate-shimmer" />
          )}

          {/* Photo */}
          {showPhoto && (
            <img
              src={event.image_url}
              alt={event.title}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`absolute inset-0 w-full h-full object-cover object-center img-target ${imgLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
            />
          )}

          {/* Gradient fallback */}
          {!showPhoto && (
            <div className={`absolute inset-0 bg-gradient-to-br ${uColor ? '' : cfg.gradient}`}
              style={uColor ? { background: `linear-gradient(150deg, ${uColor}bb 0%, ${uColor}22 50%, #000 100%)` } : {}} />
          )}

          {/* Neon sheen hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-violet-400/0 to-violet-400/10
                          opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10
                          group-hover:from-black/95 transition-all duration-500" />

          {/* Type badge + status — top left */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20 max-w-[60%]">
            <span className={`photo-badge backdrop-blur-md border ${accent}`}>{cfg.label}</span>
            {isHot  && <span className="photo-badge border border-red-500/40 bg-red-600/70 backdrop-blur-md animate-pulse">🔥 Presque complet</span>}
            {isWarm && !isHot && <span className="photo-badge border border-amber-400/30 bg-amber-500/60 backdrop-blur-md">Populaire</span>}
          </div>

          {/* University badge */}
          {event.university_short_name && (
            <div className="absolute bottom-11 left-3 z-20">
              <span className="photo-badge border border-white/20 bg-white/10 backdrop-blur-md">
                <Icon name="graduation" className="w-3 h-3" />
                {event.university_short_name}
              </span>
            </div>
          )}

          {/* COMPLET overlay */}
          {isFull && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
              <span className="text-white font-bold text-sm tracking-[0.25em] uppercase border border-white/30 px-5 py-2 rounded-xl backdrop-blur-sm">
                Complet
              </span>
            </div>
          )}

          {/* City + date */}
          <div className="absolute bottom-0 inset-x-0 px-4 pb-3 pt-6 bg-gradient-to-t from-black/75 to-transparent z-10">
            <div className="flex items-center gap-3 text-white/85 text-xs font-medium">
              <span className="flex items-center gap-1"><Icon name="map" className="w-3 h-3" />{event.city}</span>
              <span className="opacity-30">·</span>
              <span className="flex items-center gap-1"><Icon name="calendar" className="w-3 h-3" />{formatDate(event.date)}</span>
            </div>
          </div>
        </div>

        {/* ══ BODY ══ */}
        <div className="p-5 flex flex-col flex-1 bg-white dark:glass-card-body-2026">

          {/* Title */}
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-snug mb-3 line-clamp-2
                         group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
            {event.title}
          </h3>

          {/* Meta */}
          <div className="space-y-1.5 text-sm text-gray-500 dark:text-slate-400 mb-4 flex-1">
            <div className="flex items-center gap-2">
              <Icon name="clock"    className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-slate-600" />
              <span className="font-medium text-gray-700 dark:text-slate-300">{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="building" className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-slate-600" />
              <span className="truncate">{event.venue}</span>
            </div>
            {event.dress_code && (
              <div className="flex items-center gap-2">
                <Icon name="tag"    className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-slate-600" />
                <span className="truncate italic text-xs text-gray-400 dark:text-slate-500">{event.dress_code}</span>
              </div>
            )}
          </div>

          {/* Availability bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-gray-400 dark:text-slate-500">
                {available > 0 ? `${available} places` : 'Complet'}
              </span>
              <span className={`font-bold tabular-nums ${isHot ? 'text-red-500' : isWarm ? 'text-amber-500' : 'text-violet-500 dark:text-violet-400'}`}>
                {fillPct}%
              </span>
            </div>
            <div className="h-1 bg-gray-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${fillColor}`} style={{ width: `${fillPct}%` }} />
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/[0.05]">
            <div>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-medium">
                À partir de
              </p>
              <p className="font-extrabold text-xl leading-tight">
                <span className="bg-gradient-to-r from-violet-600 to-blue-500 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
                  {event.price_standard}
                </span>
                <span className="text-sm font-semibold ml-1 text-violet-600 dark:text-violet-400">MAD</span>
              </p>
            </div>

            <span className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              isFull
                ? 'bg-gray-100 dark:bg-white/[0.05] text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-br from-violet-600 to-violet-700 text-white group-hover:from-violet-500 group-hover:to-blue-600 group-hover:shadow-lg group-hover:shadow-violet-500/40 group-hover:scale-105'
            }`}>
              {isFull ? 'Complet' : 'Réserver'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default memo(EventCard)
