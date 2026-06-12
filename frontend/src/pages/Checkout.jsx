import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/Icons'
import toast from 'react-hot-toast'

const STRIPE_KEY     = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
const STRIPE_ENABLED = !!STRIPE_KEY
const stripePromise  = STRIPE_ENABLED ? loadStripe(STRIPE_KEY) : null

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-MA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

/* ─────────────────────────────────────────────
   Formulaire Stripe (production — clés configurées)
───────────────────────────────────────────── */
function StripePaymentForm({ onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/dashboard' },
      redirect: 'if_required',
    })
    if (error) { toast.error(error.message || 'Erreur de paiement'); setProcessing(false); return }
    if (paymentIntent?.status === 'succeeded') await onSuccess(paymentIntent.id, setProcessing)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: 'tabs' }} />
      <button type="submit" disabled={!stripe || processing}
        className="btn-primary w-full text-center justify-center disabled:opacity-60 disabled:cursor-not-allowed">
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Traitement en cours...
          </span>
        ) : '💳 Payer maintenant'}
      </button>
    </form>
  )
}

/* ─────────────────────────────────────────────
   Formulaire démo (sans Stripe) — carte interactive
───────────────────────────────────────────── */
function DemoPaymentForm({ total, onPay }) {
  const [card, setCard] = useState('')
  const [exp, setExp]   = useState('')
  const [cvc, setCvc]   = useState('')
  const [name, setName] = useState('')
  const [processing, setProcessing] = useState(false)

  const digits = card.replace(/\D/g, '')
  const brand  = digits.startsWith('4') ? 'VISA' : /^5[1-5]/.test(digits) ? 'Mastercard' : 'CARTE'
  const valid  = digits.length >= 16 && exp.length === 5 && cvc.length >= 3 && name.trim().length > 1

  const fmtCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const fmtExp  = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d }

  const fillTest = () => { setCard('4242 4242 4242 4242'); setExp('12/34'); setCvc('123'); setName(n => n || 'Amine Benkeroum') }

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return
    setProcessing(true)
    setTimeout(() => onPay(setProcessing), 1000) // simulate gateway latency
  }

  const display = (digits.padEnd(16, '•').match(/.{1,4}/g) || []).join(' ')

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Carte visuelle */}
      <div className="relative rounded-2xl p-5 text-white overflow-hidden h-44 flex flex-col justify-between"
        style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 45%, #2563eb 100%)' }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="flex justify-between items-start relative">
          <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-300 to-yellow-500 opacity-90" />
          <span className="font-extrabold italic tracking-wide">{brand}</span>
        </div>
        <div className="relative font-mono text-xl tracking-[0.18em] tabular-nums">{display}</div>
        <div className="relative flex justify-between text-xs">
          <div>
            <p className="opacity-50 text-[9px] uppercase tracking-wider">Titulaire</p>
            <p className="font-semibold uppercase truncate max-w-[150px]">{name || 'VOTRE NOM'}</p>
          </div>
          <div className="text-right">
            <p className="opacity-50 text-[9px] uppercase tracking-wider">Expire</p>
            <p className="font-semibold">{exp || 'MM/AA'}</p>
          </div>
        </div>
      </div>

      {/* Mode démo */}
      <div className="flex items-center justify-between gap-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-2.5 text-sm">
        <span className="text-purple-700 dark:text-purple-300"><strong>Mode démo</strong> — aucun débit réel</span>
        <button type="button" onClick={fillTest}
          className="text-purple-600 dark:text-purple-400 font-semibold hover:underline whitespace-nowrap">
          Carte test
        </button>
      </div>

      <div>
        <label className="label">Numéro de carte</label>
        <div className="relative">
          <Icon name="credit_card" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-10 font-mono tracking-wider" inputMode="numeric" placeholder="4242 4242 4242 4242"
            value={card} onChange={e => setCard(fmtCard(e.target.value))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Expiration</label>
          <input className="input font-mono" inputMode="numeric" placeholder="MM/AA"
            value={exp} onChange={e => setExp(fmtExp(e.target.value))} maxLength={5} />
        </div>
        <div>
          <label className="label">CVC</label>
          <input className="input font-mono" inputMode="numeric" placeholder="123"
            value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} />
        </div>
      </div>
      <div>
        <label className="label">Nom sur la carte</label>
        <input className="input" placeholder="Votre nom" value={name} onChange={e => setName(e.target.value)} />
      </div>

      <button type="submit" disabled={!valid || processing}
        className="btn-primary w-full text-center justify-center disabled:opacity-60 disabled:cursor-not-allowed">
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Traitement en cours...
          </span>
        ) : (
          <span className="flex items-center gap-2"><Icon name="lock" className="w-4 h-4" /> Payer {total} MAD</span>
        )}
      </button>
    </form>
  )
}

export default function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [clientSecret, setClientSecret] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { event, ticketType, quantity } = location.state || {}

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!event || !ticketType || !quantity) { navigate('/events'); return }

    if (!STRIPE_ENABLED) { setLoading(false); return } // démo : pas d'intent Stripe

    api.post('/payments/create-intent', { event_id: event.id, ticket_type: ticketType, quantity })
      .then(r => setClientSecret(r.data.clientSecret))
      .catch(err => setError(err.response?.data?.error || 'Erreur lors de la création du paiement'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* Succès Stripe → confirme côté serveur (crée le billet + points) */
  const handleStripeSuccess = async (paymentIntentId, setProcessing) => {
    try {
      const res = await api.post('/payments/confirm', { payment_intent_id: paymentIntentId })
      announceSuccess(res.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la confirmation')
      setProcessing(false)
    }
  }

  /* Paiement démo → crée directement le billet via /tickets/purchase */
  const handleDemoPay = async (setProcessing) => {
    try {
      const res = await api.post('/tickets/purchase', { event_id: event.id, ticket_type: ticketType, quantity })
      announceSuccess(res.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors du paiement')
      setProcessing(false)
    }
  }

  const announceSuccess = (data) => {
    const pts = data.points_earned || 0
    const bonus = data.bonus_first ? ' (+100 pts bienvenue 🎁)'
      : data.bonus_streak ? ' (+150 pts régularité 🔥)' : ''
    toast.success(`🎉 Paiement réussi ! +${pts} FayasCoins gagnés${bonus}`, { duration: 5000 })
    navigate('/dashboard')
  }

  const unitPrice  = ticketType === 'vip' ? event?.price_vip : event?.price_standard
  const total      = (unitPrice || 0) * (quantity || 0)
  const fayasCoins = ticketType === 'vip' ? Math.round(total * 1.5) : Math.round(total)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="card p-8 text-center max-w-md">
        <div className="text-5xl mb-4">😔</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Erreur</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        {event && <Link to={`/events/${event.id}`} className="btn-primary">← Retour à l'événement</Link>}
      </div>
    </div>
  )

  const isDark = document.documentElement.classList.contains('dark')
  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: isDark ? 'night' : 'stripe',
      variables: { colorPrimary: '#7c3aed', borderRadius: '12px', fontFamily: 'inherit' },
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={`/events/${event?.id}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors mb-8 text-sm">
          ← Retour à l'événement
        </Link>

        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 animate-fade-up">Paiement</h1>

        <div className="grid lg:grid-cols-2 gap-8 animate-fade-up">
          {/* Récapitulatif */}
          <div className="card p-6 h-fit">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Récapitulatif</h2>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{event?.title}</h3>
              {event?.date && (
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                  📅 {formatDate(event.date)} à {event.time}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">📍 {event?.venue}, {event?.city}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Type de billet</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{ticketType === 'vip' ? '⭐ VIP' : 'Standard'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Quantité</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{quantity} billet(s)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Prix unitaire</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{unitPrice} MAD</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-2xl font-extrabold text-purple-700 dark:text-purple-400">{total} MAD</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-xl px-4 py-2">
              <span className="text-lg">💎</span>
              <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold">+{fayasCoins} FayasCoins après paiement</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <span>🔒</span><span>Paiement {STRIPE_ENABLED ? '100% sécurisé via Stripe' : 'sécurisé (mode démonstration)'}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <span>📧</span><span>Un email de confirmation vous sera envoyé</span>
            </div>
          </div>

          {/* Paiement */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Informations de paiement</h2>
            {STRIPE_ENABLED
              ? (clientSecret && (
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <StripePaymentForm onSuccess={handleStripeSuccess} />
                  </Elements>
                ))
              : <DemoPaymentForm total={total} onPay={handleDemoPay} />}
          </div>
        </div>
      </div>
    </div>
  )
}
