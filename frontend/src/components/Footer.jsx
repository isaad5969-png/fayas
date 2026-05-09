import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎫</span>
              <span className="text-white font-bold text-xl">BilletterieMa</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              La plateforme de référence pour la billetterie événementielle au Maroc.
              Galas, soirées, et événements universitaires dans toutes les grandes villes.
            </p>
            <div className="flex gap-3">
              {['📘', '📸', '🐦', '▶️'].map((icon, i) => (
                <button key={i} className="w-9 h-9 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors text-sm">
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {[['/', 'Accueil'], ['/events', 'Événements'], ['/universities', 'Universités'], ['/login', 'Connexion']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-purple-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>📧 contact@billetterie.ma</li>
              <li>📞 +212 5 22 00 00 00</li>
              <li>📍 Casablanca, Maroc</li>
              <li className="pt-2">
                <span className="badge bg-purple-900 text-purple-300">🇲🇦 Fait au Maroc</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
          <p>© 2026 BilletterieMa — Tous droits réservés</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-purple-400 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-purple-400 transition-colors">CGV</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
