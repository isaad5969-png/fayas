import { QRCodeSVG } from 'qrcode.react'

const TYPE_LABELS = { standard: 'Standard', vip: 'VIP' }
const EVENT_EMOJI = { gala: '✨', soiree: '🌙', universite: '🎓', concert: '🎵', autre: '🎉' }

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function TicketCard({ ticket }) {
  const isPast = new Date(ticket.date) < new Date()
  const isVip = ticket.ticket_type === 'vip'
  const emoji = EVENT_EMOJI[ticket.event_type] || '🎉'

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border transition-colors duration-300 ${
      isPast ? 'opacity-70 border-gray-100 dark:border-gray-800' : 'border-purple-100 dark:border-purple-900/50'
    }`}>
      {/* Top band */}
      <div className={`px-6 py-4 flex items-center justify-between ${isVip ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-gradient-to-r from-purple-600 to-purple-800'}`}>
        <div>
          <span className="text-white/80 text-xs font-medium uppercase tracking-wide">
            {isVip ? '⭐ VIP' : '🎫 Standard'} — {ticket.quantity} billet(s)
          </span>
          <p className="text-white font-bold text-lg mt-0.5 leading-tight">{ticket.event_title}</p>
        </div>
        <span className="text-4xl">{emoji}</span>
      </div>

      <div className="p-6 flex flex-col sm:flex-row gap-6">
        {/* Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg">📅</span>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Date & Heure</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{formatDate(ticket.date)}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{ticket.time}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">📍</span>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Lieu</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{ticket.venue}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{ticket.city}</p>
            </div>
          </div>
          {ticket.dress_code && (
            <div className="flex items-start gap-3">
              <span className="text-lg">👔</span>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Dress Code</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{ticket.dress_code}</p>
              </div>
            </div>
          )}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Total payé</span>
              <span className="font-bold text-purple-700 dark:text-purple-400 text-lg">{ticket.total_price} MAD</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-400 dark:text-gray-500 text-xs">Réf. billet</span>
              <span className="text-gray-500 dark:text-gray-400 text-xs font-mono">{ticket.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="p-3 bg-gray-50 dark:bg-white rounded-xl border border-gray-200 dark:border-gray-700">
            <QRCodeSVG
              value={JSON.stringify({ id: ticket.id, event: ticket.event_title, type: ticket.ticket_type, qty: ticket.quantity })}
              size={120}
              fgColor="#6D28D9"
              level="M"
            />
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 text-center">Scanner à l'entrée</span>
          {isPast && <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">Passé</span>}
          {!isPast && <span className="badge bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">Confirmé ✓</span>}
        </div>
      </div>
    </div>
  )
}
