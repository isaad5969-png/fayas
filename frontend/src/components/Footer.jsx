import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icons'
import toast from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      return toast.error('Email invalide')
    }
    setSubscribing(true)
    setTimeout(() => {
      toast.success('Inscription réussie ! Vous recevrez nos meilleures soirées 💌')
      setEmail('')
      setSubscribing(false)
    }, 800)
  }

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-950 to-purple-950/40 text-gray-400 border-t border-purple-900/30 overflow-hidden">

      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-pink-600/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* Newsletter — premium card spanning full width */}
        <div className="mb-14 bg-gradient-to-r from-purple-900/60 via-purple-800/40 to-indigo-900/60 backdrop-blur-sm border border-purple-700/40 rounded-3xl p-8 md:p-10 shadow-2xl shadow-purple-900/30">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider mb-3">
                <Icon name="mail" className="w-3 h-3" />
                Newsletter
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                Restez à l'affût des meilleures soirées
              </h3>
              <p className="text-purple-200 text-sm leading-relaxed max-w-md">
                Recevez chaque semaine notre sélection d'événements exclusifs, en avant-première.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto md:min-w-[380px] gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.ma"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 focus:border-white/50 focus:bg-white/15 text-white placeholder-purple-200/60 text-sm focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="bg-white text-purple-700 hover:bg-purple-50 font-bold px-5 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-60 inline-flex items-center gap-2"
              >
                {subscribing ? '...' : <>S'inscrire <Icon name="arrow_right" className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">

          {/* About + socials */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center shadow-lg shadow-purple-500/40">
                <Icon name="ticket" className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <span className="text-white font-extrabold text-2xl bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent bg-gradient-sweep">
                Fayas
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-5 max-w-md">
              La plateforme premium de billetterie événementielle au Maroc.
              Galas exclusifs, soirées d'exception, événements universitaires dans toutes les grandes villes.
            </p>
            <div className="flex gap-2">
              {[
                { icon: 'whatsapp', label: 'WhatsApp',  color: 'hover:bg-emerald-600' },
                { icon: 'facebook', label: 'Facebook',  color: 'hover:bg-blue-600' },
                { icon: 'twitter',  label: 'Twitter',   color: 'hover:bg-sky-500' },
                { icon: 'mail',     label: 'Email',     color: 'hover:bg-purple-600' },
              ].map(({ icon, label, color }) => (
                <a key={label} href="#" aria-label={label}
                  className={`w-10 h-10 bg-gray-800/60 border border-gray-700/40 backdrop-blur-sm ${color}
                             rounded-xl flex items-center justify-center transition-all duration-200
                             hover:scale-110 hover:shadow-lg hover:border-transparent group`}>
                  <Icon name={icon} className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-2">
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              {[['/', 'Accueil'], ['/events', 'Événements'], ['/universities', 'Universités'], ['/favorites', 'Mes Favoris']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-purple-300 transition-colors inline-flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-purple-400 rounded transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compte */}
          <div className="md:col-span-2">
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Mon compte</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['/login', 'Connexion'],
                ['/register', 'Inscription'],
                ['/dashboard', 'Mes billets'],
                ['/loyalty', 'FayasCoins'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-purple-300 transition-colors inline-flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-purple-400 rounded transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-900/40 border border-purple-700/30 flex items-center justify-center flex-shrink-0">
                  <Icon name="mail" className="w-3.5 h-3.5 text-purple-300" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Email</p>
                  <a href="mailto:contact@fayas.ma" className="text-gray-300 hover:text-purple-300 transition-colors">contact@fayas.ma</a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-900/40 border border-purple-700/30 flex items-center justify-center flex-shrink-0">
                  <Icon name="map" className="w-3.5 h-3.5 text-purple-300" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Siège</p>
                  <p className="text-gray-300">Casablanca, Maroc</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-900/40 border border-purple-700/30 flex items-center justify-center flex-shrink-0">
                  <Icon name="phone" className="w-3.5 h-3.5 text-purple-300" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Téléphone</p>
                  <p className="text-gray-300">+212 5 22 00 00 00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment methods */}
        <div className="border-t border-gray-800/60 pt-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Paiements sécurisés</p>
              <div className="flex flex-wrap items-center gap-2">
                {['VISA', 'Mastercard', 'CMI', 'Cash Plus', 'PayPal'].map(method => (
                  <div key={method} className="px-3 py-1.5 bg-gray-800/60 border border-gray-700/50 rounded-lg text-xs font-bold text-gray-300">
                    {method}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 border border-emerald-700/40 rounded-lg">
                <Icon name="shield" className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">SSL Sécurisé</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-900/30 border border-purple-700/40 rounded-lg">
                <span className="text-base">🇲🇦</span>
                <span className="text-xs font-semibold text-purple-300">Fait au Maroc</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800/60 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
          <p className="text-gray-500">
            © 2026 <span className="text-purple-300 font-semibold">Fayas</span> — Tous droits réservés
          </p>
          <div className="flex gap-5 text-xs">
            <a href="#" className="text-gray-500 hover:text-purple-300 transition-colors">Confidentialité</a>
            <a href="#" className="text-gray-500 hover:text-purple-300 transition-colors">CGV</a>
            <a href="#" className="text-gray-500 hover:text-purple-300 transition-colors">Cookies</a>
            <a href="#" className="text-gray-500 hover:text-purple-300 transition-colors">Mentions légales</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
