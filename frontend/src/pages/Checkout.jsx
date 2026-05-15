import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-MA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function PaymentForm({ onSuccess }) {
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

    if (error) {
      toast.error(error.message || 'Erreur de paiement')
      setProcessing(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      await onSuccess(paymentIntent.id, setProcessing)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: 'tabs' }} />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn-primary w-full text-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
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

    api.post('/payments/create-intent', {
      event_id: event.id,
      ticket_type: ticketType,
      quantity,
    })
      .then(r => setClientSecret(r.data.clientSecret))
      .catch(err => setError(err.response?.data?.error || 'Erreur lors de la création du paiement'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSuccess = async (paymentIntentId, setProcessing) => {
    try {
      const res = await api.post('/payments/confirm', { payment_intent_id: paymentIntentId })
      const pts = res.data.points_earned || 0
      const bonus = res.data.bonus_first
        ? ' (+100 pts bonus bienvenue 🎁)'
        : res.data.bonus_streak ? ' (+150 pts bonus régularité 🔥)' : ''
      toast.success(`🎉 Paiement réussi ! +${pts} FayasCoins gagnés${bonus}`, { duration: 5000 })
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la confirmation')
      setProcessing(false)
    }
  }

  const unitPrice = ticketType === 'vip' ? event?.price_vip : event?.price_standard
  const total = (unitPrice || 0) * (quantity || 0)
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
        {event && (
          <Link to={`/events/${event.id}`} className="btn-primary">
            ← Retour à l'événement
          </Link>
        )}
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
        <Link
          to={`/events/${event?.id}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors mb-8 text-sm"
        >
          ← Retour à l'événement
        </Link>

        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 animate-fade-up">
          Paiement
        </h1>

        <div className="grid lg:grid-cols-2 gap-8 animate-fade-up">
          {/* Récapitulatif commande */}
          <div className="card p-6 h-fit">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Récapitulatif</h2>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{event?.title}</h3>
              {event?.date && (
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                  📅 {formatDate(event.date)} à {event.time}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                📍 {event?.venue}, {event?.city}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Type de billet</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {ticketType === 'vip' ? '⭐ VIP' : 'Standard'}
                </span>
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
              <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold">
                +{fayasCoins} FayasCoins après paiement
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <span>🔒</span>
              <span>Paiement 100% sécurisé via Stripe</span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <span>📧</span>
              <span>Un email de confirmation vous sera envoyé</span>
            </div>
          </div>

          {/* Formulaire de paiement Stripe */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
              Informations de paiement
            </h2>
            {clientSecret && (
              <Elements stripe={stripePromise} options={stripeOptions}>
                <PaymentForm onSuccess={handleSuccess} />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
