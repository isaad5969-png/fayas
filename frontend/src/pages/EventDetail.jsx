import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/Icons'
import FavoriteButton from '../components/FavoriteButton'
import ShareButton from '../components/ShareButton'
import toast from 'react-hot-toast'

const TYPE_GRADIENT = {
  gala:      'from-purple-700 to-purple-900',
  soiree:    'from-indigo-600 to-purple-800',
  universite:'from-blue-600 to-indigo-800',
  concert:   'from-rose-600 to-pink-800',
  autre:     'from-gray-600 to-gray-900',
}
const TYPE_EMOJI = { gala: '✨', soiree: '🌙', universite: '🎓', concert: '🎵', autre: '🎉' }

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ticketType, setTicketType] = useState('standard')
  const [quantity, setQuantity] = useState(1)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    api.get(`/events/${id}`).then(r => setEvent(r.data)).catch(() => navigate('/events')).finally(() => setLoading(false))
  }, [id, navigate])

  const available = event ? event.capacity - event.tickets_sold : 0
  const unitPrice = event ? (ticketType === 'vip' ? event.price_vip : event.price_standard) : 0
  const total = unitPrice * quantity

  const goToCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour réserver')
      navigate('/login')
      return
    }
    setPurchasing(true)
    navigate('/checkout', { state: { event, ticketType, quantity } })
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0f] transition-colors duration-300">
      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!event) return null

  const gradient = event.university_color
    ? `background: linear-gradient(135deg, ${event.university_color}dd, ${event.university_color}55)`
    : undefined
  const gradientClass = !event.university_color ? TYPE_GRADIENT[event.type] || TYPE_GRADIENT.autre : ''

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors duration-300">
      {/* ── Hero ── */}
      <div className="relative min-h-[420px] flex items-end overflow-hidden text-white">

        {/* Background: real photo OR gradient */}
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ filter: 'brightness(0.75)' }}
          />
        ) : (
          <div
            className={`absolute inset-0 ${!gradient ? `bg-gradient-to-br ${gradientClass}` : ''}`}
            style={gradient ? { backgroundImage: `linear-gradient(135deg, ${event.university_color}cc, ${event.university_color}77)` } : {}}
          >
            <div className="absolute inset-0 flex items-center justify-center text-[22rem] opacity-10 select-none pointer-events-none">
              {TYPE_EMOJI[event.type] || '🎉'}
            </div>
          </div>
        )}

        {/* Gradient scrim — makes text readable over any photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content */}
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-24 animate-fade-up">
          <div className="flex items-center justify-between gap-3 mb-6">
            <Link to="/events" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              ← Retour aux événements
            </Link>

            {/* Quick actions: favorite + share */}
            <div className="relative flex items-center gap-2 h-10">
              <FavoriteButton eventId={event.id} eventTitle={event.title} variant="hero" />
              <ShareButton variant="hero" eventTitle={event.title} />
            </div>
          </div>

          {event.university_name && (
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm mb-4">
              🎓 {event.university_name}
            </div>
          )}

          <h1 className="text-3xl md:text-5xl font-extrabold mb-5 leading-tight drop-shadow-lg">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-3">
            {[
              { icon: 'calendar', text: `${formatDate(event.date)} à ${event.time}` },
              { icon: 'location', text: `${event.venue}, ${event.city}` },
              ...(event.dress_code ? [{ icon: 'shirt', text: event.dress_code }] : []),
            ].map(({ icon, text }) => (
              <span key={text} className="inline-flex items-center gap-1.5 text-sm bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full text-white/90">
                <Icon name={icon} className="w-3.5 h-3.5 opacity-80" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-3 gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">À propos de cet événement</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{event.description}</p>
          </div>

          {/* Info grid */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Informations pratiques</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: 'calendar',    label: 'Date',             value: formatDate(event.date),           color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
                { icon: 'clock',       label: 'Heure',            value: event.time,                       color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-900/30'     },
                { icon: 'location',    label: 'Lieu',             value: event.venue,                      color: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-50 dark:bg-rose-900/30'     },
                { icon: 'building',    label: 'Ville',            value: event.city,                       color: 'text-teal-600 dark:text-teal-400',     bg: 'bg-teal-50 dark:bg-teal-900/30'     },
                { icon: 'shirt',       label: 'Dress code',       value: event.dress_code || '—',          color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/30'   },
                { icon: 'ticket',      label: 'Places restantes', value: `${available} / ${event.capacity}`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
              ].map(({ icon, label, value, color, bg }) => (
                <div key={label} className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-100 dark:border-white/[0.06]">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={icon} className={`w-4.5 h-4.5 ${color}`} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate capitalize">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* University info */}
          {event.university_name && (
            <div className="card p-6 border-l-4" style={{ borderColor: event.university_color || '#7C3AED' }}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Icon name="graduation" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                {event.university_name}
              </h2>
              {event.university_description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{event.university_description}</p>
              )}
              {event.student_count && (
                <p className="text-purple-600 dark:text-purple-400 font-semibold mt-2 text-sm">
                  {(event.student_count / 1000).toFixed(0)}K étudiants inscrits
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Ticket Purchase */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Réserver des billets</h2>

            {available <= 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-[#1a1a24] flex items-center justify-center">
                  <Icon name="ticket" className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-bold text-gray-700 dark:text-gray-300">Événement complet</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Il n'y a plus de places disponibles.</p>
              </div>
            ) : (
              <>
                {/* Ticket type */}
                <div className="space-y-3 mb-5">
                  <label className="label">Type de billet</label>
                  {[
                    { value: 'standard', label: 'Standard', price: event.price_standard, desc: 'Accès à l\'événement' },
                    ...(event.price_vip > 0 ? [{ value: 'vip', label: '⭐ VIP', price: event.price_vip, desc: 'Accès prioritaire + avantages' }] : []),
                  ].map(opt => (
                    <label key={opt.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        ticketType === opt.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-white/[0.08] hover:border-purple-200 dark:hover:border-violet-500/50'
                      }`}>
                      <input type="radio" name="ticketType" value={opt.value} checked={ticketType === opt.value}
                        onChange={e => setTicketType(e.target.value)} className="accent-purple-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{opt.label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{opt.desc}</p>
                      </div>
                      <span className="font-bold text-purple-700 dark:text-purple-400">{opt.price} MAD</span>
                    </label>
                  ))}
                </div>

                {/* Quantity */}
                <div className="mb-5">
                  <label className="label">Nombre de billets</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-xl border border-gray-300 dark:border-white/[0.08] font-bold text-lg hover:bg-gray-50 dark:hover:bg-[#1a1a24] transition-colors text-gray-700 dark:text-gray-300">−</button>
                    <span className="w-12 text-center font-bold text-xl text-gray-900 dark:text-white">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(available, q + 1))}
                      className="w-10 h-10 rounded-xl border border-gray-300 dark:border-white/[0.08] font-bold text-lg hover:bg-gray-50 dark:hover:bg-[#1a1a24] transition-colors text-gray-700 dark:text-gray-300">+</button>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-xl p-4 mb-5">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>{quantity} × {unitPrice} MAD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Total</span>
                    <span className="text-2xl font-extrabold text-purple-700 dark:text-purple-400">{total} MAD</span>
                  </div>
                </div>

                {/* FayasCoins preview */}
                <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-xl px-4 py-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                    <Icon name="gem" className="w-5 h-5 text-purple-600 dark:text-purple-400" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Vous gagnerez</p>
                    <p className="text-purple-800 dark:text-purple-300 font-extrabold">
                      +{ticketType === 'vip' ? Math.round(unitPrice * quantity * 1.5) : Math.round(unitPrice * quantity)} FayasCoins
                    </p>
                  </div>
                  <Link to="/loyalty" className="text-xs text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors">
                    Voir mes points
                  </Link>
                </div>

                <button onClick={goToCheckout} disabled={purchasing}
                  className="btn-primary w-full text-center justify-center disabled:opacity-60 disabled:cursor-not-allowed">
                  <Icon name={isAuthenticated ? 'credit_card' : 'lock'} className="w-4 h-4" />
                  {isAuthenticated ? 'Réserver & Payer' : 'Se connecter pour réserver'}
                </button>

                {!isAuthenticated && (
                  <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
                    <Link to="/login" className="text-purple-600 dark:text-purple-400">Connexion</Link> ou{' '}
                    <Link to="/register" className="text-purple-600 dark:text-purple-400">inscription</Link> requise
                  </p>
                )}

                {available <= 20 && (
                  <p className="flex items-center justify-center gap-1.5 text-sm text-red-500 dark:text-red-400 mt-3 font-medium">
                    <Icon name="alert" className="w-4 h-4" />
                    Plus que {available} places disponibles !
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
