import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import TicketCard from '../components/TicketCard'
import { Icon } from '../components/Icons'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function Dashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('upcoming')

  const [statsRef, statsVisible] = useScrollReveal(0.1)
  const [listRef,  listVisible]  = useScrollReveal(0.05)

  useEffect(() => {
    api.get('/tickets/my').then(r => setTickets(r.data)).finally(() => setLoading(false))
  }, [])

  const now      = new Date()
  const upcoming = tickets.filter(t => new Date(t.date) >= now)
  const past     = tickets.filter(t => new Date(t.date) < now)
  const displayed  = tab === 'upcoming' ? upcoming : past
  const totalSpent = tickets.reduce((s, t) => s + t.total_price, 0)

  const STAT_CARDS = [
    { label: 'Billets achetés',    value: tickets.length,                              icon: 'ticket',      bg: 'bg-purple-50 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Événements à venir', value: upcoming.length,                             icon: 'calendar',    bg: 'bg-blue-50 dark:bg-blue-900/30',     color: 'text-blue-600 dark:text-blue-400'     },
    { label: 'Total dépensé',      value: `${totalSpent.toLocaleString('fr-MA')} MAD`, icon: 'credit_card', bg: 'bg-amber-50 dark:bg-amber-900/30',    color: 'text-amber-600 dark:text-amber-400'   },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* ══ Header ══ */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center
                            text-white text-xl font-extrabold shadow-lg shadow-purple-200 dark:shadow-purple-900/40
                            animate-scale-in">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="animate-fade-up">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Bonjour, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm">{user?.email}</p>
            </div>
            <div className="ml-auto animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <Link to="/loyalty"
                className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50
                           text-purple-700 dark:text-purple-400 font-semibold px-4 py-2.5 rounded-xl
                           transition-all duration-200 hover:scale-105 text-sm border border-purple-100 dark:border-purple-800">
                <Icon name="gem" className="w-4 h-4" />
                FayasCoins
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ══ Stats ══ */}
        <div ref={statsRef} className="grid grid-cols-3 gap-4 mb-8">
          {STAT_CARDS.map((s, i) => (
            <div key={s.label}
              className={`card-flat p-5 transition-all duration-700
                          ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${i * 80}ms` }}>
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon name={s.icon} className={`w-5 h-5 ${s.color}`} strokeWidth={2} />
              </div>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white tabular-nums">{s.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ══ Tabs ══ */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-100 dark:border-gray-800 shadow-sm w-fit transition-colors duration-300">
          {[
            { key: 'upcoming', label: 'À venir', count: upcoming.length },
            { key: 'past',     label: 'Passés',  count: past.length     },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                tab === t.key
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
                tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* ══ Ticket list ══ */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="sk-card fade-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                {/* ticket card top band */}
                <div className="skeleton h-16 rounded-none" />
                <div className="sk-card-body">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="sk-text" />
                      <div className="sk-text" style={{ width: '60%' }} />
                      <div className="sk-text" style={{ width: '45%' }} />
                    </div>
                    <div className="sk-avatar skeleton" style={{ width: '7rem', height: '7rem', borderRadius: '0.75rem' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name={tab === 'upcoming' ? 'calendar' : 'history'}
                className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2">
              {tab === 'upcoming' ? 'Aucun événement à venir' : 'Aucun événement passé'}
            </h3>
            {tab === 'upcoming' && (
              <>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
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
          <div ref={listRef} className="space-y-4">
            {displayed.map((ticket, i) => (
              <div key={ticket.id}
                className={`transition-all duration-600 ${listVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${i * 60}ms` }}>
                <TicketCard ticket={ticket} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
