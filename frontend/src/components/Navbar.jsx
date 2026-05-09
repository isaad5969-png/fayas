import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from './Icons'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Déconnexion réussie')
    navigate('/')
    setDropOpen(false)
    setMenuOpen(false)
  }

  const activeClass  = 'text-purple-600 font-semibold'
  const defaultClass = 'text-gray-600 hover:text-purple-600 font-medium transition-colors'
  const navLink = ({ isActive }) => isActive ? activeClass : defaultClass

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-lg group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800
                            flex items-center justify-center shadow-sm
                            group-hover:shadow-purple-200 group-hover:shadow-md transition-shadow">
              <Icon name="ticket" className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
              BilletterieMa
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            <NavLink to="/"            className={navLink} end>Accueil</NavLink>
            <NavLink to="/events"      className={navLink}>Événements</NavLink>
            <NavLink to="/universities"className={navLink}>Universités</NavLink>
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(v => !v)}
                  className="flex items-center gap-2.5 bg-gray-50 hover:bg-purple-50
                             border border-gray-200 hover:border-purple-200
                             px-3 py-2 rounded-xl transition-all duration-150"
                >
                  <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center
                                  text-white font-bold text-xs shadow-sm">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-800 text-sm">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <Icon name="filter"
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2.5} />
                </button>

                {dropOpen && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl
                                    border border-gray-100 py-1.5 z-50 animate-fade-up">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs text-gray-400 font-medium">Connecté en tant que</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700
                                   hover:bg-purple-50 hover:text-purple-700 transition-colors">
                        <Icon name="ticket" className="w-4 h-4" />
                        Mes billets
                      </Link>
                      <Link to="/loyalty" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700
                                   hover:bg-purple-50 hover:text-purple-700 transition-colors">
                        <Icon name="gem" className="w-4 h-4" />
                        BilletCoins
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setDropOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700
                                     hover:bg-purple-50 hover:text-purple-700 transition-colors">
                          <Icon name="tools" className="w-4 h-4" />
                          Administration
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm
                                     text-red-600 hover:bg-red-50 transition-colors">
                          <Icon name="arrow_right" className="w-4 h-4 rotate-180" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"    className="btn-outline text-sm py-2 px-4">Connexion</Link>
                <Link to="/register" className="btn-primary  text-sm py-2 px-4">
                  <Icon name="sparkles" className="w-3.5 h-3.5" />
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            {menuOpen
              ? <Icon name="x" className="w-5 h-5" />
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            }
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1 animate-fade-up">
          {[
            { to: '/', label: 'Accueil', end: true },
            { to: '/events', label: 'Événements' },
            { to: '/universities', label: 'Universités' },
          ].map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block py-2.5 px-3 rounded-xl font-medium text-sm transition-colors
                 ${isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'}`
              }>
              {label}
            </NavLink>
          ))}

          <div className="border-t border-gray-100 pt-3 mt-3">
            {isAuthenticated ? (
              <div className="space-y-1">
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium
                             text-gray-700 hover:bg-gray-50">
                  <Icon name="ticket" className="w-4 h-4 text-gray-400" /> Mes billets
                </Link>
                <Link to="/loyalty" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium
                             text-gray-700 hover:bg-gray-50">
                  <Icon name="gem" className="w-4 h-4 text-gray-400" /> BilletCoins
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium
                               text-gray-700 hover:bg-gray-50">
                    <Icon name="tools" className="w-4 h-4 text-gray-400" /> Administration
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="flex items-center gap-2 w-full py-2.5 px-3 rounded-xl text-sm
                             font-medium text-red-600 hover:bg-red-50">
                  <Icon name="arrow_right" className="w-4 h-4 rotate-180" /> Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login"    onClick={() => setMenuOpen(false)} className="flex-1 btn-outline text-sm justify-center">Connexion</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 btn-primary text-sm justify-center">Inscription</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
