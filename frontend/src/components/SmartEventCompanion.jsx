import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Icon } from './Icons'

const dateLong = new Intl.DateTimeFormat('fr-MA', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function parseHour(time = '') {
  const match = String(time).match(/(\d{1,2})(?::|h)?(\d{2})?/)
  if (!match) return { hour: 20, minute: 0 }
  return { hour: Number(match[1]), minute: Number(match[2] || 0) }
}

function minutesToLabel(total) {
  const normalized = ((total % 1440) + 1440) % 1440
  const hour = Math.floor(normalized / 60)
  const minute = normalized % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function formatIcsDate(date, time) {
  const { hour, minute } = parseHour(time)
  const value = new Date(date)
  value.setHours(hour, minute, 0, 0)
  return value.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function daysUntil(date) {
  const target = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

function outfitIdea(type, dressCode) {
  if (dressCode) return dressCode
  if (type === 'gala') return 'Tenue elegante, couleurs sobres'
  if (type === 'concert') return 'Tenue confortable, chaussures pratiques'
  if (type === 'universite') return 'Smart casual, badge et carte etudiante'
  if (type === 'conference') return 'Business casual, carnet ou laptop'
  return 'Tenue soignee et confortable'
}

export default function SmartEventCompanion({ event, ticketType, quantity, unitPrice }) {
  const [people, setPeople] = useState(Math.max(2, quantity))
  const [transport, setTransport] = useState(80)
  const [arrivalBuffer, setArrivalBuffer] = useState(45)

  const plan = useMemo(() => {
    const { hour, minute } = parseHour(event.time)
    const eventMinutes = hour * 60 + minute
    const arrival = minutesToLabel(eventMinutes - arrivalBuffer)
    const leave = minutesToLabel(eventMinutes - arrivalBuffer - 35)
    const ticketTotal = unitPrice * quantity
    const totalBudget = ticketTotal + Number(transport || 0)
    const perPerson = Math.ceil(totalBudget / Math.max(people, 1))
    const urgency = daysUntil(event.date)

    return {
      arrival,
      leave,
      ticketTotal,
      totalBudget,
      perPerson,
      urgency,
      coins: Math.round(ticketTotal * (ticketType === 'vip' ? 1.5 : 1)),
      outfit: outfitIdea(event.type, event.dress_code),
    }
  }, [arrivalBuffer, event, people, quantity, ticketType, transport, unitPrice])

  const inviteText = `Plan Fayas: ${event.title}
Date: ${dateLong.format(new Date(event.date))} a ${event.time}
Lieu: ${event.venue}, ${event.city}
Arrivee conseillee: ${plan.arrival}
Budget estime: ${plan.perPerson} MAD/personne
Lien: ${window.location.href}`

  const copyInvite = async () => {
    await navigator.clipboard.writeText(inviteText)
    toast.success('Invitation copiee')
  }

  const downloadCalendar = () => {
    const start = formatIcsDate(event.date, event.time)
    const endDate = new Date(event.date)
    const { hour, minute } = parseHour(event.time)
    endDate.setHours(hour + 3, minute, 0, 0)
    const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Fayas//Smart Event Companion//FR',
      'BEGIN:VEVENT',
      `UID:fayas-${event.id}@local`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${event.title}`,
      `LOCATION:${event.venue}, ${event.city}`,
      `DESCRIPTION:${event.description || 'Evenement Fayas'}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `fayas-${event.id}.ics`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Ajoute a votre calendrier')
  }

  const saveAlert = () => {
    const alerts = JSON.parse(localStorage.getItem('fayas-price-alerts') || '[]')
    const next = alerts.filter(item => item.id !== event.id)
    next.push({
      id: event.id,
      title: event.title,
      city: event.city,
      price: unitPrice,
      savedAt: new Date().toISOString(),
    })
    localStorage.setItem('fayas-price-alerts', JSON.stringify(next))
    toast.success('Alerte locale activee')
  }

  return (
    <div className="card p-6 overflow-hidden relative">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">
            <Icon name="bolt" className="w-3.5 h-3.5" />
            Compagnon intelligent
          </span>
          <h2 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">Votre plan de sortie pret a partager</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-slate-400">
            Fayas prepare l'arrivee, le budget de groupe, l'invitation et le rappel calendrier.
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-right dark:border-violet-500/20 dark:bg-violet-500/10">
          <p className="text-[10px] font-bold uppercase tracking-wide text-violet-500">Timing</p>
          <p className="text-2xl font-black text-violet-700 dark:text-violet-200">
            {plan.urgency >= 0 ? `J-${plan.urgency}` : 'Passe'}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3 mb-5">
        {[
          { icon: 'clock', label: 'Depart conseille', value: plan.leave },
          { icon: 'location', label: 'Arrivee ideale', value: plan.arrival },
          { icon: 'shirt', label: 'Tenue', value: plan.outfit },
        ].map(item => (
          <div key={item.label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-white/[0.07] dark:bg-white/[0.035]">
            <Icon name={item.icon} className="w-5 h-5 text-violet-500 mb-3" />
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">{item.label}</p>
            <p className="mt-1 text-sm font-extrabold text-gray-900 dark:text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.2fr]">
        <label className="block">
          <span className="label">Personnes</span>
          <input
            type="number"
            min="1"
            max="20"
            value={people}
            onChange={e => setPeople(Number(e.target.value))}
            className="input dark:input-night"
          />
        </label>
        <label className="block">
          <span className="label">Transport estime</span>
          <input
            type="number"
            min="0"
            step="10"
            value={transport}
            onChange={e => setTransport(Number(e.target.value))}
            className="input dark:input-night"
          />
        </label>
        <label className="block">
          <div className="mb-2 flex items-center justify-between">
            <span className="label mb-0">Marge d'arrivee</span>
            <span className="text-xs font-bold text-violet-600 dark:text-violet-300">{arrivalBuffer} min</span>
          </div>
          <input
            type="range"
            min="15"
            max="90"
            step="15"
            value={arrivalBuffer}
            onChange={e => setArrivalBuffer(Number(e.target.value))}
            className="w-full accent-violet-600"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-gray-900 p-4 text-white dark:bg-black/30">
          <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">Budget total</p>
          <p className="mt-1 text-2xl font-black">{plan.totalBudget} MAD</p>
        </div>
        <div className="rounded-2xl bg-violet-600 p-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">Par personne</p>
          <p className="mt-1 text-2xl font-black">{plan.perPerson} MAD</p>
        </div>
        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 dark:border-purple-500/20 dark:bg-purple-500/10">
          <p className="text-[10px] font-bold uppercase tracking-wide text-purple-500">FayasCoins prevus</p>
          <p className="mt-1 text-2xl font-black text-purple-700 dark:text-purple-200">+{plan.coins}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={copyInvite} className="btn-secondary">
          <Icon name="copy" className="w-4 h-4" />
          Copier l'invitation
        </button>
        <button onClick={downloadCalendar} className="btn-secondary">
          <Icon name="calendar" className="w-4 h-4" />
          Ajouter au calendrier
        </button>
        <button onClick={saveAlert} className="btn-secondary">
          <Icon name="alert" className="w-4 h-4" />
          Alerte prix/places
        </button>
      </div>
    </div>
  )
}
