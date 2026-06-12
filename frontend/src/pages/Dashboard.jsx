import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import TicketCard from '../components/TicketCard'
import { Icon } from '../components/Icons'
import { useScrollReveal } from '../hooks/useScrollReveal'
import toast from 'react-hot-toast'

const money = new Intl.NumberFormat('fr-MA')
const receiptDate = (d) => new Date(d).toLocaleDateString('fr-MA', { day: 'numeric', month: 'short', year: 'numeric' })

/* Reçu de paiement imprimable, ouvert dans une fenêtre dédiée */
function openReceipt(t, userName) {
  const ref       = String(t.payment_intent_id || t.id).replace(/-/g, '').slice(0, 18).toUpperCase()
  const purchased = t.purchased_at ? new Date(t.purchased_at).toLocaleString('fr-MA') : '—'
  const evDate    = new Date(t.date).toLocaleDateString('fr-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const cancelled = t.status === 'cancelled'
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Reçu Fayas — ${ref}</title><style>
*{box-sizing:border-box}body{font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#15151f;max-width:640px;margin:36px auto;padding:0 28px;line-height:1.5}
.brand{font-size:24px;font-weight:800;color:#7c3aed}
.tag{margin-left:auto;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;background:${cancelled ? '#f1f1f1;color:#888' : '#ecfdf5;color:#059669'}}
hr{border:none;border-top:1px solid #ececf1;margin:18px 0}
.row{display:flex;justify-content:space-between;padding:7px 0;font-size:14px}.row .k{color:#777}.row .v{font-weight:600;text-align:right}
.total{display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:14px;border-top:2px solid #15151f}.total .amt{font-size:26px;font-weight:800;color:#7c3aed}
.foot{margin-top:26px;font-size:12px;color:#999;text-align:center}
</style></head><body>
<div style="display:flex;align-items:center"><span class="brand">🎫 Fayas</span><span class="tag">${cancelled ? 'ANNULÉ' : 'PAYÉ'}</span></div>
<p style="color:#777;font-size:13px;margin:6px 0 0">Reçu de paiement · Réf ${ref}</p><hr/>
<div class="row"><span class="k">Client</span><span class="v">${userName || '—'}</span></div>
<div class="row"><span class="k">Date d'achat</span><span class="v">${purchased}</span></div><hr/>
<div class="row"><span class="k">Événement</span><span class="v">${t.event_title}</span></div>
<div class="row"><span class="k">Date</span><span class="v">${evDate} · ${t.time || ''}</span></div>
<div class="row"><span class="k">Lieu</span><span class="v">${t.venue || ''}, ${t.city || ''}</span></div>
<div class="row"><span class="k">Billet</span><span class="v">${t.ticket_type === 'vip' ? 'VIP' : 'Standard'} × ${t.quantity}</span></div>
<div class="row"><span class="k">Prix unitaire</span><span class="v">${money.format(Number(t.unit_price))} MAD</span></div>
<div class="total"><span style="font-weight:700">Total payé</span><span class="amt">${money.format(Number(t.total_price))} MAD</span></div>
<p class="foot">Merci pour votre confiance — Fayas, billetterie événementielle au Maroc.<br/>Pour toute question : contact@fayas.ma</p>
<script>window.onload=function(){window.print()}<\/script></body></html>`
  const w = window.open('', '_blank', 'width=720,height=820')
  if (!w) { toast.error('Autorisez les pop-ups pour afficher le reçu'); return }
  w.document.write(html)
  w.document.close()
}

function formatDate(date) {
  return new Intl.DateTimeFormat('fr-MA', { day: 'numeric', month: 'short' }).format(new Date(date))
}

function nextEventLabel(ticket) {
  if (!ticket) return 'Aucun billet'
  const days = Math.max(0, Math.ceil((new Date(ticket.date) - new Date()) / 86400000))
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return 'Demain'
  return `Dans ${days} jours`
}

function StatCard({ item, visible, delay }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.045] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{item.label}</p>
          <p className="mt-2 truncate text-2xl font-black text-white">{item.value}</p>
        </div>
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${item.tone}`}>
          <Icon name={item.icon} className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{item.hint}</p>
    </div>
  )
}

function PaymentHtmlPanel({ totalSpent, ticketsCount }) {
  const [selected, setSelected] = useState('card')
  const methods = [
    { id: 'card', label: 'Carte bancaire', icon: 'credit_card', meta: 'Visa, Mastercard' },
    { id: 'wallet', label: 'Fayas Wallet', icon: 'gem', meta: 'Coins + cashback' },
    { id: 'cash', label: 'Paiement local', icon: 'building', meta: 'Agence / partenaire' },
  ]

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-[#0d0d16] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-violet-200">
            <Icon name="shield" className="h-3.5 w-3.5" />
            Paiement HTML
          </span>
          <h2 className="mt-3 text-xl font-black text-white">Centre de paiement</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">Interface codée en HTML/JSX, prête à brancher sur Stripe ou CMI.</p>
        </div>
        <div className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-right text-emerald-200">
          <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">Statut</p>
          <p className="text-sm font-black">Secure</p>
        </div>
      </div>

      <div className="mb-5 rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-700 to-slate-950 p-5 text-white shadow-[0_24px_70px_rgba(124,58,237,0.28)]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">Fayas Pay</span>
          <Icon name="logo" className="h-6 w-6 text-white/80" />
        </div>
        <p className="mt-8 font-mono text-lg tracking-[0.2em] text-white/90">4242 4242 4242 4242</p>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">Titulaire</p>
            <p className="text-sm font-black">FAYAS MEMBER</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">Depenses</p>
            <p className="text-sm font-black">{money.format(totalSpent)} MAD</p>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        {methods.map(method => (
          <button
            type="button"
            key={method.id}
            onClick={() => setSelected(method.id)}
            className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
              selected === method.id
                ? 'border-violet-400/70 bg-violet-500/15 text-white'
                : 'border-white/[0.07] bg-white/[0.035] text-slate-300 hover:border-white/[0.16] hover:bg-white/[0.06]'
            }`}
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.08]">
              <Icon name={method.icon} className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black">{method.label}</span>
              <span className="block text-xs text-slate-500">{method.meta}</span>
            </span>
            {selected === method.id && <Icon name="check_circle" className="h-5 w-5 text-violet-200" />}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Transactions</p>
          <p className="mt-1 text-xl font-black text-white">{ticketsCount}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Protection</p>
          <p className="mt-1 text-xl font-black text-white">3DS</p>
        </div>
      </div>

      <Link to="/events" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition-transform hover:scale-[1.01]">
        <Icon name="ticket" className="h-4 w-4" />
        Acheter un nouveau billet
      </Link>
    </section>
  )
}

function SmartAssistant({ nextTicket, upcomingCount }) {
  const title = nextTicket
    ? `Preparez ${nextTicket.event_title}`
    : 'Trouvez votre prochaine sortie'
  const body = nextTicket
    ? `Arrivee conseillee 35 minutes avant ${nextTicket.time}. Gardez votre QR code pret.`
    : 'Explorez les evenements populaires et laissez le concierge intelligent vous guider.'

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-slate-950 via-[#111122] to-[#1b102d] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200">
          <Icon name="bolt" className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/80">Assistant smart</p>
          <h2 className="mt-2 text-xl font-black">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          { label: 'A venir', value: upcomingCount },
          { label: 'QR', value: nextTicket ? 'Pret' : '-' },
          { label: 'Mode', value: 'VIP' },
        ].map(item => (
          <div key={item.label} className="rounded-2xl bg-white/[0.06] p-3 text-center">
            <p className="text-lg font-black">{item.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('upcoming')

  const [statsRef, statsVisible] = useScrollReveal(0.1)
  const [listRef, listVisible] = useScrollReveal(0.05)

  useEffect(() => {
    api.get('/tickets/my')
      .then(r => setTickets(r.data.data ?? r.data))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const upcoming = useMemo(
    () => tickets.filter(t => new Date(t.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date)),
    [tickets] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const past = useMemo(
    () => tickets.filter(t => new Date(t.date) < now).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [tickets] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const displayed = tab === 'upcoming' ? upcoming : past
  const nextTicket = upcoming[0]
  const totalSpent = tickets.reduce((sum, ticket) => sum + Number(ticket.total_price || 0), 0)
  const fayasCoins = Math.round(totalSpent * 0.9 + tickets.length * 25)
  const firstName = user?.name?.split(' ')[0] || 'Fayas'

  const stats = [
    { label: 'Billets', value: tickets.length, icon: 'ticket', hint: 'Tous vos achats confirmes.', tone: 'bg-violet-500/15 text-violet-200' },
    { label: 'A venir', value: upcoming.length, icon: 'calendar', hint: nextEventLabel(nextTicket), tone: 'bg-cyan-500/15 text-cyan-200' },
    { label: 'Depenses', value: `${money.format(totalSpent)} MAD`, icon: 'credit_card', hint: 'Paiements et reservations.', tone: 'bg-amber-500/15 text-amber-200' },
    { label: 'Coins', value: fayasCoins, icon: 'gem', hint: 'Estimation fidelite.', tone: 'bg-emerald-500/15 text-emerald-200' },
  ]

  return (
    <div className="min-h-screen bg-[#08080d] text-white">
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 50% at 20% 0%, rgba(124,58,237,0.26), transparent 62%), radial-gradient(ellipse 45% 45% at 86% 10%, rgba(34,211,238,0.12), transparent 58%)',
        }} />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-blue-600 text-2xl font-black shadow-[0_18px_50px_rgba(124,58,237,0.36)]">
                {firstName[0]?.toUpperCase()}
              </div>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Dashboard membre
                </span>
                <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Bonjour, {firstName}</h1>
                <p className="mt-2 text-sm text-slate-400">{user?.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/events" className="btn-neon-v2">
                <Icon name="sparkles" className="h-4 w-4" />
                Explorer
              </Link>
              <Link to="/loyalty" className="btn-glass-v2">
                <Icon name="gem" className="h-4 w-4" />
                FayasCoins
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="min-w-0 lg:col-span-2">
          <div ref={statsRef} className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {stats.map((item, index) => (
              <StatCard key={item.label} item={item} visible={statsVisible} delay={index * 70} />
            ))}
          </div>

          <section className="mb-6 rounded-3xl border border-white/[0.08] bg-white/[0.045] p-4 backdrop-blur-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black">Mes billets</h2>
                <p className="mt-1 text-sm text-slate-500">QR codes, acces et historique de reservations.</p>
              </div>
              <div className="inline-flex w-fit rounded-2xl border border-white/[0.08] bg-black/20 p-1">
                {[
                  { key: 'upcoming', label: 'A venir', count: upcoming.length },
                  { key: 'past', label: 'Passes', count: past.length },
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTab(item.key)}
                    className={`flex min-w-[108px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                      tab === item.key ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                    <span className={`rounded-lg px-1.5 py-0.5 text-[10px] font-black ${tab === item.key ? 'bg-white/20 text-white' : 'bg-white/[0.08]'}`}>
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-48 animate-pulse rounded-3xl bg-white/[0.05]" />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.045] px-6 py-20 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.06]">
                <Icon name={tab === 'upcoming' ? 'calendar' : 'history'} className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-xl font-black">{tab === 'upcoming' ? 'Aucun evenement a venir' : 'Aucun evenement passe'}</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {tab === 'upcoming'
                  ? 'Votre prochaine experience Fayas apparaitra ici apres reservation.'
                  : 'Votre historique sera disponible apres vos sorties.'}
              </p>
              {tab === 'upcoming' && (
                <Link to="/events" className="btn-neon-v2 mt-6">
                  <Icon name="ticket" className="h-4 w-4" />
                  Reserver maintenant
                </Link>
              )}
            </div>
          ) : (
            <div ref={listRef} className="space-y-4">
              {displayed.map((ticket, index) => (
                <div
                  key={ticket.id}
                  className={`transition-all duration-700 ${listVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  <TicketCard ticket={ticket} />
                </div>
              ))}
            </div>
          )}

          {!loading && tickets.length > 0 && (
            <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.045] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-200">
                    <Icon name="credit_card" className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-lg font-black">Paiements &amp; reçus</h2>
                    <p className="text-xs text-slate-500">
                      {tickets.filter(t => t.status !== 'cancelled').length} transaction(s) · {money.format(totalSpent)} MAD
                    </p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-white/[0.05]">
                {tickets.map(t => {
                  const cancelled = t.status === 'cancelled'
                  return (
                    <div key={t.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.03]">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">{t.event_title}</p>
                        <p className="text-xs text-slate-500">
                          {t.purchased_at ? `Acheté le ${receiptDate(t.purchased_at)}` : receiptDate(t.date)} · {t.ticket_type === 'vip' ? 'VIP' : 'Standard'} × {t.quantity}
                        </p>
                      </div>
                      <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-black sm:inline-flex ${
                        cancelled ? 'bg-white/[0.06] text-slate-400' : 'bg-emerald-500/15 text-emerald-200'
                      }`}>{cancelled ? 'Annulé' : 'Payé'}</span>
                      <span className={`w-24 text-right text-sm font-black tabular-nums ${cancelled ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {money.format(Number(t.total_price))} MAD
                      </span>
                      <button type="button" onClick={() => openReceipt(t, user?.name)}
                        className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-violet-200 transition-colors hover:bg-violet-500/15"
                        title="Télécharger le reçu">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        <span className="hidden sm:inline">Reçu</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:col-span-1">
          <SmartAssistant nextTicket={nextTicket} upcomingCount={upcoming.length} />
          {nextTicket && (
            <section className="rounded-3xl border border-white/[0.08] bg-white/[0.045] p-5">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Prochaine sortie</p>
              <h2 className="mt-2 text-lg font-black text-white">{nextTicket.event_title}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.05] p-3">
                  <Icon name="calendar" className="mb-2 h-4 w-4 text-violet-300" />
                  <p className="text-sm font-black">{formatDate(nextTicket.date)}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.05] p-3">
                  <Icon name="clock" className="mb-2 h-4 w-4 text-cyan-300" />
                  <p className="text-sm font-black">{nextTicket.time}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-400">{nextTicket.venue}, {nextTicket.city}</p>
            </section>
          )}
          <PaymentHtmlPanel totalSpent={totalSpent} ticketsCount={tickets.length} />
        </aside>
      </main>
    </div>
  )
}
