import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

// City landmark photos — Wikipedia Commons verified URLs for Moroccan cities
const CITY_BANNERS = {
  'Casablanca':  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Hassan_II_mosque_at_twilight%2C_Casablanca%2C_Morocco.jpg/1280px-Hassan_II_mosque_at_twilight%2C_Casablanca%2C_Morocco.jpg',
  'Rabat':       'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Tour_Hassan_Rabat.JPG/1280px-Tour_Hassan_Rabat.JPG',
  'Marrakech':   'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Koutoubia-Mosquee-Marrakech.jpg/1280px-Koutoubia-Mosquee-Marrakech.jpg',
  'Fès':         'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Fes_bou_inania.jpg/1280px-Fes_bou_inania.jpg',
  'Agadir':      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Agadir_bay.jpg/1280px-Agadir_bay.jpg',
  'Tanger':      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tangier%2C_Morocco_%28Tanger%29_%282%29.jpg/1280px-Tangier%2C_Morocco_%28Tanger%29_%282%29.jpg',
  'Meknès':      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Bab_Mansour_Meknes.jpg/1280px-Bab_Mansour_Meknes.jpg',
  'Oujda':       'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Oujda_avenue_Mohammed_V.jpg/1280px-Oujda_avenue_Mohammed_V.jpg',
  'Kénitra':     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Kenitra_from_above.jpg/1280px-Kenitra_from_above.jpg',
  'Tétouan':     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Tetouan_Panorama.jpg/1280px-Tetouan_Panorama.jpg',
  'Settat':      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Settat_panorama.jpg/1280px-Settat_panorama.jpg',
  'El Jadida':   'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/El_jadida.jpg/1280px-El_jadida.jpg',
  'Béni Mellal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Beni_Mellal_panorama.jpg/1280px-Beni_Mellal_panorama.jpg',
  'Ben Guerir':  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/UM6P_campus_aerial.jpg/1280px-UM6P_campus_aerial.jpg',
  'Ifrane':      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Al_Akhawayn_University_Ifrane.jpg/1280px-Al_Akhawayn_University_Ifrane.jpg',
  'Essaouira':   'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Essaouira-1.jpg/1280px-Essaouira-1.jpg',
}

// Fallback: consistent city-seeded photo (picsum) per city when Wikimedia fails
function cityFallbackPhoto(city) {
  return `https://picsum.photos/seed/${encodeURIComponent(city || 'maroc')}-campus/1600/500`
}
import api from '../api/axios'
import EventCard from '../components/EventCard'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/Icons'
import toast from 'react-hot-toast'

/* Éclaircit (percent > 0) ou assombrit (percent < 0) une couleur hex */
function shade(hex, percent) {
  const h = (hex || '#7C3AED').replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const num = parseInt(full, 16)
  let r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255
  const t = percent < 0 ? 0 : 255
  const p = Math.abs(percent) / 100
  r = Math.round((t - r) * p) + r
  g = Math.round((t - g) * p) + g
  b = Math.round((t - b) * p) + b
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

const ORG_LEVELS = {
  rookie: { label: 'Rookie',  color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',           emoji: '🌱', desc: '1er événement'  },
  pro:    { label: 'Pro',     color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',         emoji: '⭐', desc: 'Organisateur confirmé' },
  legend: { label: 'Legend',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',     emoji: '👑', desc: '5+ événements' },
}

const TYPE_LABEL = {
  conference: { label: 'Conférence',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  soiree:     { label: 'Soirée',       color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
  concert:    { label: 'Concert',      color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  universite: { label: 'Universitaire',color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  gala:       { label: 'Gala',         color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  autre:      { label: 'Événement',    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-MA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function SubmissionCard({ event, color, isAuthenticated, onInterestToggle }) {
  const type = TYPE_LABEL[event.type] || TYPE_LABEL.autre
  const orgLevel = ORG_LEVELS[event.organizer_level] || ORG_LEVELS.rookie
  const placeholderGradient = `linear-gradient(135deg, ${color}cc, ${color}66)`

  const interestCount = event.interest_count || 0
  const threshold = event.interest_threshold || 10
  const interestPct = Math.min(100, (interestCount / threshold) * 100)
  const isCommunityValidated = event.community_validated
  const iAmInterested = event.i_am_interested

  const [loading, setLoading] = useState(false)
  const [localInterested, setLocalInterested] = useState(iAmInterested)
  const [localCount, setLocalCount] = useState(interestCount)

  const handleInterest = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour soutenir cette proposition')
      return
    }
    setLoading(true)
    const wasInterested = localInterested
    // Optimistic
    setLocalInterested(!wasInterested)
    setLocalCount(c => c + (wasInterested ? -1 : 1))
    try {
      if (wasInterested) {
        await api.delete(`/submissions/${event.id}/interest`)
        toast('Soutien retiré', { icon: '👋' })
      } else {
        await api.post(`/submissions/${event.id}/interest`)
        toast.success('Merci pour votre soutien ! 🙌')
      }
      onInterestToggle?.()
    } catch (err) {
      // revert
      setLocalInterested(wasInterested)
      setLocalCount(c => c + (wasInterested ? 1 : -1))
      toast.error('Erreur — réessayez')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`card overflow-hidden flex flex-col group
                     card-accent-top
                     transition-all duration-400 ease-out
                     hover:-translate-y-1.5 hover:scale-[1.005]
                     hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-900/30
                     ${isCommunityValidated
                        ? 'ring-2 ring-emerald-400/70 dark:ring-emerald-500/60'
                        : ''}`}>
      {/* Photo */}
      <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-800 img-zoom">
        {event.image_url ? (
          <img
            src={event.image_url} alt={event.title}
            className="w-full h-full object-cover img-target"
            style={{ filter: 'brightness(0.9)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30 select-none"
            style={{ backgroundImage: placeholderGradient }}>
            🎓
          </div>
        )}
        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {isCommunityValidated ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/95 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
              <Icon name="check_circle" className="w-3 h-3" />
              Validé par la communauté
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
              <Icon name="pending" className="w-3 h-3" />
              En attente
            </span>
          )}
        </div>

        {/* Type badge */}
        <div className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full ${type.color} backdrop-blur-sm`}>
          {type.label}
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
          <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 drop-shadow">{event.title}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-3">

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: 'calendar', text: formatDate(event.date) },
            { icon: 'clock',    text: event.time },
            { icon: 'location', text: event.venue },
            { icon: 'building', text: event.city },
          ].map(({ icon, text }) => (
            <div key={icon} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Icon name={icon} className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              <span className="truncate">{text}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Price + capacity */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">À partir de</span>
            <p className="font-bold text-purple-700 dark:text-purple-400 text-sm">{event.price_standard} MAD</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Capacité</span>
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{event.capacity} places</p>
          </div>
        </div>

        {/* ── INTEREST METER (innovation : crowd-validation) ── */}
        <div className={`rounded-xl p-3 ${isCommunityValidated
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50'
            : 'bg-purple-50 dark:bg-purple-900/15 border border-purple-100 dark:border-purple-900/30'
        }`}>
          <div className="flex justify-between items-center text-[11px] mb-1.5">
            <span className={`font-semibold ${isCommunityValidated
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-purple-700 dark:text-purple-300'}`}>
              {isCommunityValidated ? '🎯 Seuil atteint !' : 'Intérêt communautaire'}
            </span>
            <span className={`font-bold tabular-nums ${isCommunityValidated
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-purple-700 dark:text-purple-300'}`}>
              {localCount} / {threshold}
            </span>
          </div>
          <div className="h-2 bg-white dark:bg-gray-800/60 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isCommunityValidated
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-purple-500 to-pink-400'}`}
              style={{ width: `${interestPct}%` }}
            />
          </div>

          {/* CTA Interest */}
          <button
            onClick={handleInterest}
            disabled={loading}
            className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              localInterested
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/40'
            } disabled:opacity-60`}
          >
            <Icon name="heart" className="w-3.5 h-3.5" strokeWidth={localInterested ? 0 : 2}
              style={localInterested ? { fill: 'currentColor' } : {}} />
            {localInterested ? 'Je soutiens cet événement' : 'Je suis intéressé(e)'}
          </button>
        </div>

        {/* Dress code */}
        {event.dress_code && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 rounded-lg px-3 py-1.5">
            <Icon name="shirt" className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{event.dress_code}</span>
          </div>
        )}

        {/* Submitted by + organizer level badge */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 min-w-0">
            <Icon name="user" className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              Par <span className="font-medium text-gray-700 dark:text-gray-300">{event.submitter_name}</span>
            </span>
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${orgLevel.color} flex-shrink-0`}
            title={`${orgLevel.desc} (${event.organizer_event_count || 0} événement${event.organizer_event_count > 1 ? 's' : ''})`}>
            <span>{orgLevel.emoji}</span>
            <span>{orgLevel.label}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UniversityEvents() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [gridRef, gridVisible] = useScrollReveal(0.02)
  const [subRef, subVisible] = useScrollReveal(0.02)

  const fetchData = () => {
    api.get(`/universities/${id}/events`)
      .then(r => setData(r.data))
      .catch(() => navigate('/universities'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [id, navigate])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { university, events = [], submissions = [] } = data || {}
  const uniColor = university?.color || '#7C3AED'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Hero */}
      <div className="relative py-20 text-white overflow-hidden" style={{ minHeight: 240 }}>
        {/* Background photo — city landmark (Wikimedia) with picsum fallback */}
        <img
          src={CITY_BANNERS[university?.city] || cityFallbackPhoto(university?.city)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'saturate(0.3) brightness(0.5)' }}
          onError={e => {
            // If Wikimedia fails, try picsum city fallback
            if (!e.currentTarget.dataset.fallback) {
              e.currentTarget.dataset.fallback = '1'
              e.currentTarget.src = cityFallbackPhoto(university?.city)
            } else {
              e.currentTarget.style.display = 'none'
            }
          }}
        />
        {/* Themed gradient — diagonal blend unique to each university */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, ${shade(uniColor, 18)} 0%, ${uniColor} 42%, ${shade(uniColor, -50)} 100%)`,
          opacity: 0.93,
        }} />
        {/* Soft radial glow in the university tint */}
        <div className="absolute inset-0" style={{
          background: `radial-gradient(120% 80% at 20% 0%, ${shade(uniColor, 35)}66 0%, transparent 55%)`,
        }} />
        {/* Gradient scrim — darkens bottom for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        {/* Subtle dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)',
          backgroundSize: '28px 28px'
        }} />
        {/* Large blurred logo watermark on the right */}
        {university?.logo_url && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none select-none hidden md:block"
            style={{ opacity: 0.07, filter: 'blur(1px) invert(1) brightness(10)' }}>
            <img src={university.logo_url} alt="" className="w-full h-full object-contain" />
          </div>
        )}
        {/* Blobs — lighter tint top-right, darker shade bottom-left */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full -translate-y-1/2 translate-x-1/3"
          style={{ background: `${shade(uniColor, 40)}55`, filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full translate-y-1/3 -translate-x-1/4"
          style={{ background: `${shade(uniColor, -55)}66`, filter: 'blur(30px)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-up">
          <Link to="/universities"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            ← Toutes les universités
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* University info */}
            <div className="flex items-center gap-5 flex-1">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-white/40 shadow-lg overflow-hidden p-2">
                {university?.logo_url ? (
                  <img
                    src={university.logo_url}
                    alt={university.short_name}
                    className="w-full h-full object-contain"
                    onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
                  />
                ) : null}
                <span
                  className="w-full h-full items-center justify-center text-2xl font-extrabold"
                  style={{ color: uniColor, display: university?.logo_url ? 'none' : 'flex' }}
                >
                  {university?.short_name?.slice(0, 2)}
                </span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{university?.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-white/80 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Icon name="location" className="w-3.5 h-3.5" />
                    {university?.city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="users" className="w-3.5 h-3.5" />
                    {(university?.student_count / 1000).toFixed(0)}K étudiants
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="ticket" className="w-3.5 h-3.5" />
                    {events?.length} événement{events?.length !== 1 ? 's' : ''}
                  </span>
                  {submissions.length > 0 && (
                    <span className="flex items-center gap-1.5 bg-amber-400/25 border border-amber-300/40 px-2.5 py-0.5 rounded-full text-amber-100">
                      <Icon name="pending" className="w-3 h-3" />
                      {submissions.length} proposition{submissions.length > 1 ? 's' : ''} en attente
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CTA: propose event */}
            {isAuthenticated ? (
              <Link to={`/universities/${id}/submit`}
                className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-50 transition-colors font-bold px-5 py-3 rounded-xl shadow-lg text-sm shrink-0">
                <Icon name="plus_circle" className="w-4 h-4" style={{ color: uniColor }} />
                Proposer un événement
              </Link>
            ) : (
              <Link to="/login"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm text-white transition-colors font-semibold px-5 py-3 rounded-xl text-sm shrink-0">
                <Icon name="lock" className="w-4 h-4" />
                Connectez-vous pour proposer
              </Link>
            )}
          </div>

          {university?.description && (
            <p className="mt-4 text-white/80 max-w-2xl leading-relaxed">{university.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

        {/* ── Published events ── */}
        {events?.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Icon name="calendar" className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Aucun événement programmé</h3>
            <p className="text-gray-400 dark:text-gray-500 mb-6">Il n'y a pas encore d'événements publiés pour cette université.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/events" className="btn-secondary">Voir tous les événements</Link>
              {isAuthenticated && (
                <Link to={`/universities/${id}/submit`} className="btn-primary">
                  <Icon name="plus_circle" className="w-4 h-4" />
                  Proposer le premier événement
                </Link>
              )}
            </div>
          </div>
        ) : (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${uniColor}22` }}>
                <Icon name="ticket" className="w-4 h-4" style={{ color: uniColor }} />
              </span>
              Soirées &amp; événements — {university?.short_name}
            </h2>
            <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events?.map((e, i) => (
                <div key={e.id}
                  className={`transition-all duration-600 ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${(i % 6) * 60}ms` }}>
                  <EventCard event={{ ...e, university_color: university?.color, university_short_name: university?.short_name }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Student submissions ── */}
        {submissions.length > 0 && (
          <section>
            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 text-sm font-semibold px-4 py-1.5 rounded-full">
                <Icon name="pending" className="w-4 h-4" />
                Propositions d'événements étudiants
              </div>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 mb-6">
              <p className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <Icon name="info" className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Ces événements ont été soumis par des étudiants et sont en attente de validation par l'équipe Fayas avant publication officielle.
              </p>
            </div>

            <div ref={subRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map((e, i) => (
                <div key={e.id}
                  className={`transition-all duration-600 ${subVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${(i % 6) * 60}ms` }}>
                  <SubmissionCard
                    event={e}
                    color={uniColor}
                    isAuthenticated={isAuthenticated}
                    onInterestToggle={fetchData}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Prompt to submit if authenticated and no submissions yet */}
        {isAuthenticated && submissions.length === 0 && events.length > 0 && (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${uniColor}22` }}>
              <Icon name="plus_circle" className="w-7 h-7" style={{ color: uniColor }} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">Vous organisez un événement ?</h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-4 max-w-sm mx-auto">
              Soumettez votre événement pour qu'il apparaisse sur la page de votre université.
            </p>
            <Link to={`/universities/${id}/submit`} className="btn-primary">
              <Icon name="plus_circle" className="w-4 h-4" />
              Proposer un événement
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
