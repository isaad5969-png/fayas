import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import TicketCard from '../components/TicketCard'
import { Icon } from '../components/Icons'

export default function Dashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('upcoming')

  useEffect(() => {
    api.get('/tickets/my').then(r => setTickets(r.data)).finally(() => setLoading(false))
  }, [])

  const now      = new Date()
  const upcoming = tickets.filter(t => new Date(t.date) >= now)
  const past     = tickets.filter(t => new Date(t.date) < now)
  const displayed = tab === 'upcoming' ? upcoming : past
  const totalSpent = tickets.reduce((s, t) => s + t.total_price, 0)

  const STAT_CARDS = [
    {
      label: 'Billets achetés',
      value: tickets.length,
      icon: 'ticket',
      bg: 'bg-purple-50',
      color: 'text-purple-600',
    },
    {
      label: 'Événements à venir',
      value: upcoming.length,
      icon: 'calendar',
      bg: 'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      label: 'Total dépensé',
      value: `${totalSpent.toLocaleString('fr-MA')} MAD`,
      icon: 'credit_card',
      bg: 'bg-amber-50',
      color: 'text-amber-600',
    },
  ]

  return (
    <div>
      {/* ══ Header ══ */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center
                            text-white text-xl font-extrabold shadow-lg shadow-purple-200">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Bonjour, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
            <div className="ml-auto">
              <Link to="/loyalty"
                className="inline-flex items-center gap-2 bg-purple-50 hover:bg-purple-100
                           text-purple-700 font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
                <Icon name="gem" className="w-4 h-4" />
                BilletCoins
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ══ Stats ══ */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {STAT_CARDS.map(s => (
            <div key={s.label} className="card-flat p-5">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon name={s.icon} className={`w-5 h-5 ${s.color}`} strokeWidth={2} />
              </div>
              <p className="text-xl font-extrabold text-gray-900 tabular-nums">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ══ Tabs ══ */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-fit">
          {[
            { key: 'upcoming', label: `À venir`, count: upcoming.length },
            { key: 'past',     label: `Passés`,  count: past.length     },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                tab === t.key
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}>
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
                tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* ══ Ticket list ══ */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl animate-shimmer" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name={tab === 'upcoming' ? 'calendar' : 'history'}
                className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-600 mb-2">
              {tab === 'upcoming' ? 'Aucun événement à venir' : 'Aucun événement passé'}
            </h3>
            {tab === 'upcoming' && (
              <>
                <p className="text-gray-400 text-sm mb-6">
                  Explorez nos événements et réservez votre prochain billet.
                </p>
                <Link to="/events" className="btn-primary">
                  <Icon name="sparkles" className="w-4 h-4" />
                  Explorer les événements
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
          </div>
        )}
      </div>
    </div>
  )
}
