import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icons'

const MOODS = [
  { id: 'party', label: 'Sortir danser', types: ['soiree', 'concert'], keywords: ['dj', 'night', 'party', 'club', 'festival'] },
  { id: 'premium', label: 'Soiree premium', types: ['gala'], keywords: ['gala', 'luxe', 'vip', 'diner'] },
  { id: 'learn', label: 'Apprendre', types: ['conference', 'universite'], keywords: ['conference', 'forum', 'workshop', 'campus'] },
  { id: 'culture', label: 'Culture & decouverte', types: ['concert', 'autre'], keywords: ['art', 'culture', 'live', 'show'] },
]

const TIMES = [
  { id: 'any', label: 'Flexible' },
  { id: 'weekend', label: 'Week-end' },
  { id: 'evening', label: 'Soir' },
  { id: 'soon', label: 'Bientot' },
]

const formatDate = new Intl.DateTimeFormat('fr-MA', { day: 'numeric', month: 'short' })

function eventText(event) {
  return `${event.title || ''} ${event.type || ''} ${event.venue || ''} ${event.city || ''}`.toLowerCase()
}

function daysUntil(date) {
  const target = new Date(date)
  if (Number.isNaN(target.getTime())) return 999
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

function isWeekend(date) {
  const day = new Date(date).getDay()
  return day === 5 || day === 6 || day === 0
}

function isEvening(time = '') {
  const match = String(time).match(/(\d{1,2})/)
  if (!match) return false
  const hour = Number(match[1])
  return hour >= 18 || hour <= 3
}

function scoreEvent(event, profile) {
  const mood = MOODS.find(item => item.id === profile.mood) || MOODS[0]
  const available = Math.max((event.capacity || 0) - (event.tickets_sold || 0), 0)
  const fillPct = event.capacity ? Math.round(((event.tickets_sold || 0) / event.capacity) * 100) : 0
  const price = Number(event.price_standard || 0)
  const text = eventText(event)
  const reasons = []
  let score = 35

  if (mood.types.includes(event.type)) {
    score += 24
    reasons.push(`Match ${mood.label.toLowerCase()}`)
  }

  if (mood.keywords.some(word => text.includes(word))) {
    score += 12
    reasons.push('Vibe detectee dans le titre')
  }

  if (profile.city !== 'all' && event.city === profile.city) {
    score += 20
    reasons.push(`Dans votre ville: ${event.city}`)
  } else if (profile.city === 'all') {
    score += 4
  }

  if (price <= profile.budget) {
    const spare = Math.max(profile.budget - price, 0)
    score += Math.min(18, 6 + Math.round(spare / 50))
    reasons.push(`${price} MAD, dans le budget`)
  } else {
    score -= Math.min(22, Math.round((price - profile.budget) / 20))
  }

  if (profile.time === 'weekend' && isWeekend(event.date)) {
    score += 12
    reasons.push('Parfait pour le week-end')
  }
  if (profile.time === 'evening' && isEvening(event.time)) {
    score += 12
    reasons.push('Horaire du soir')
  }
  if (profile.time === 'soon') {
    const days = daysUntil(event.date)
    if (days >= 0 && days <= 14) {
      score += 14
      reasons.push('A venir tres bientot')
    }
  }

  if (available <= 0) {
    score -= 45
    reasons.push('Complet')
  } else if (fillPct >= 85) {
    score += 10
    reasons.push('Forte demande')
  } else if (fillPct >= 55) {
    score += 5
    reasons.push('Deja populaire')
  }

  return {
    event,
    score: Math.max(0, Math.min(99, score)),
    reasons: reasons.slice(0, 3),
    available,
  }
}

export default function SmartConcierge({ events, currentCity, onApply }) {
  const cities = useMemo(() => {
    const unique = [...new Set(events.map(event => event.city).filter(Boolean))]
    return ['all', ...unique.sort((a, b) => a.localeCompare(b))]
  }, [events])

  const [profile, setProfile] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('fayas-smart-profile') || '{}')
      return {
        mood: saved.mood || 'party',
        budget: saved.budget || 500,
        city: saved.city || currentCity || 'all',
        time: saved.time || 'any',
      }
    } catch {
      return { mood: 'party', budget: 500, city: currentCity || 'all', time: 'any' }
    }
  })

  useEffect(() => {
    localStorage.setItem('fayas-smart-profile', JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    if (currentCity && currentCity !== 'all') {
      setProfile(prev => ({ ...prev, city: currentCity }))
    }
  }, [currentCity])

  const ranked = useMemo(() => {
    return events
      .map(event => scoreEvent(event, profile))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [events, profile])

  const top = ranked[0]
  const intelligence = top
    ? Math.round(ranked.reduce((sum, item) => sum + item.score, 0) / ranked.length)
    : 0

  const update = (key, value) => setProfile(prev => ({ ...prev, [key]: value }))

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-violet-200/70 dark:border-violet-500/25 bg-white dark:bg-[#0d0d16] shadow-sm dark:shadow-[0_24px_80px_rgba(124,58,237,0.12)]">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative p-5 md:p-6 bg-gradient-to-br from-violet-700 via-indigo-700 to-slate-950 text-white">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }} />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white/80">
              <Icon name="sparkles" className="w-3.5 h-3.5" />
              Concierge intelligent
            </span>
            <h2 className="mt-4 text-2xl md:text-3xl font-extrabold leading-tight">
              Trouvez la sortie qui vous correspond vraiment.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/72">
              Fayas analyse vos envies, votre budget, la ville et le timing pour classer les evenements avec des raisons claires.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { label: 'Score moyen', value: `${intelligence}%` },
                { label: 'Evenements lus', value: events.length },
                { label: 'Top picks', value: ranked.length },
              ].map(item => (
                <div key={item.label} className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
                  <p className="text-lg font-extrabold leading-none">{item.value}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-white/55">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">Envie</p>
              <div className="grid grid-cols-2 gap-2">
                {MOODS.map(mood => (
                  <button
                    key={mood.id}
                    onClick={() => update('mood', mood.id)}
                    className={`rounded-xl border px-3 py-2 text-left text-xs font-bold transition-all ${
                      profile.mood === mood.id
                        ? 'border-violet-400 bg-violet-50 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200'
                        : 'border-gray-200 text-gray-500 hover:border-violet-300 dark:border-white/[0.08] dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">Budget max</p>
                  <span className="text-sm font-extrabold text-violet-600 dark:text-violet-300">{profile.budget} MAD</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1500"
                  step="50"
                  value={profile.budget}
                  onChange={event => update('budget', Number(event.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={profile.city}
                  onChange={event => update('city', event.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200"
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city === 'all' ? 'Toutes les villes' : city}</option>
                  ))}
                </select>
                <select
                  value={profile.time}
                  onChange={event => update('time', event.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200"
                >
                  {TIMES.map(time => <option key={time.id} value={time.id}>{time.label}</option>)}
                </select>
              </div>

              <button
                onClick={() => onApply?.({ city: profile.city, type: (MOODS.find(item => item.id === profile.mood)?.types?.[0]) || 'all' })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.01]"
              >
                <Icon name="bolt" className="w-4 h-4" />
                Appliquer les filtres intelligents
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {ranked.map(({ event, score, reasons, available }, index) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 transition-all hover:border-violet-300 hover:bg-white hover:shadow-md dark:border-white/[0.07] dark:bg-white/[0.035] dark:hover:bg-white/[0.06]"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm dark:bg-violet-500/15 dark:text-violet-200">
                  <span className="text-sm font-black">#{index + 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-extrabold text-gray-900 dark:text-white">{event.title}</p>
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-black text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">{score}%</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-medium text-gray-500 dark:text-slate-400">
                    {event.city} · {formatDate.format(new Date(event.date))} · {event.price_standard} MAD · {available > 0 ? `${available} places` : 'Complet'}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-gray-400 dark:text-slate-500">
                    {reasons.length ? reasons.join(' · ') : 'Recommendation basee sur vos preferences'}
                  </p>
                </div>
                <Icon name="arrow_right" className="w-4 h-4 flex-shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-violet-500" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
