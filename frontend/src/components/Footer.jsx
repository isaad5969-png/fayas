import { Link } from 'react-router-dom'
import { Icon } from './Icons'

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 border-t border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-sm">
                <Icon name="ticket" className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className="text-white font-bold text-xl bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                Fayas
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              La plateforme de référence pour la billetterie événementielle au Maroc.
              Galas, soirées, et événements universitaires dans toutes les grandes villes.
            </p>
            <div className="flex gap-3">
              {[
                { icon: 'flag',   label: 'Facebook' },
                { icon: 'camera', label: 'Instagram' },
                { icon: 'music',  label: 'TikTok'   },
                { icon: 'globe',  label: 'Web'      },
              ].map(({ icon, label }) => (
                <button key={label} aria-label={label}
                  className="w-9 h-9 bg-gray-800 dark:bg-gray-900 hover:bg-purple-600
                             rounded-lg flex items-center justify-center transition-all duration-200
                             hover:scale-110 hover:shadow-lg hover:shadow-purple-500/20">
                  <Icon name={icon} className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {[['/', 'Accueil'], ['/events', 'Événements'], ['/universities', 'Universités'], ['/login', 'Connexion']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-purple-400 transition-colors inline-flex items-center gap-1.5 group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-purple-500 rounded transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Icon name="eye" className="w-4 h-4 text-purple-500" /> contact@fayas.ma</li>
              <li className="flex items-center gap-2"><Icon name="map" className="w-4 h-4 text-purple-500" /> Casablanca, Maroc</li>
              <li className="pt-2">
                <span className="badge bg-purple-900/50 text-purple-300 border border-purple-700/50">🇲🇦 Fait au Maroc</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 dark:border-gray-900 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
          <p>© 2026 Fayas — Tous droits réservés</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-purple-400 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-purple-400 transition-colors">CGV</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
