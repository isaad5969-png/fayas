import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useFavorites } from '../context/FavoritesContext'
import { Icon } from './Icons'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { isDark, toggle } = useTheme()
  const { count: favCount } = useFavorites()
  const navigate = useNavigate()
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [dropOpen,   setDropOpen]   = useState(false)
  const [scrolled,   setScrolled]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal,  setSearchVal]  = useState('')
  const searchRef = useRef(null)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => { setScrolled(window.scrollY > 20); raf = 0 })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])

  const handleLogout = () => {
    logout()
    toast.success('Déconnexion réussie')
    navigate('/')
    setDropOpen(false)
    setMenuOpen(false)
  }

  const handleSearch = e => {
    e.preventDefault()
    if (!searchVal.trim()) return
    navigate(`/events?search=${encodeURIComponent(searchVal)}`)
    setSearchOpen(false)
    setSearchVal('')
  }

  /* ── Link classes ── */
  const activeClass  = isDark
    ? 'text-violet-400 font-semibold relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-px after:bg-gradient-to-r after:from-violet-500 after:to-blue-500'
    : 'text-purple-600 font-semibold relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-px after:bg-gradient-to-r after:from-purple-500 after:to-pink-500'
  const defaultClass = isDark
    ? 'text-slate-400 hover:text-white font-medium transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-px after:bg-gradient-to-r after:from-violet-500 after:to-blue-500 after:transition-all after:duration-300 hover:after:w-full'
    : 'text-gray-600 hover:text-purple-700 font-medium transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-px after:bg-gradient-to-r after:from-purple-500 after:to-pink-500 after:transition-all after:duration-300 hover:after:w-full'
  const navLink = ({ isActive }) => isActive ? activeClass : defaultClass

  /* ── Navbar base classes ── */
  const navBase = isDark
    ? `sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'navbar-v2-scrolled' : 'navbar-night'}`
    : `sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-2xl shadow-xl shadow-purple-500/5 border-b border-gray-100/80' : 'bg-white/95 backdrop-blur-md border-b border-gray-100'}`

  /* ── Icon button classes ── */
  const iconBtn = isDark
    ? 'w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.07] text-slate-400 hover:text-white transition-all duration-200'
    : 'w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-purple-100 text-gray-500 hover:text-purple-600 transition-all duration-200'

  return (
    <nav className={navBase}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-14' : 'h-16'}`}>

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300
              bg-gradient-to-br from-violet-600 via-violet-700 to-violet-900
              ${isDark ? 'shadow-lg shadow-violet-500/40 group-hover:shadow-violet-500/70 group-hover:scale-110' : 'shadow-md shadow-purple-500/30 group-hover:shadow-purple-500/50 group-hover:scale-110'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Icon name="ticket" className="w-4 h-4 text-white relative z-10" strokeWidth={2} />
            </div>
            <span className={`font-extrabold text-lg tracking-tight ${isDark ? 'text-white' : ''} bg-gradient-to-r from-violet-500 via-purple-400 to-blue-400 bg-clip-text text-transparent bg-gradient-sweep`}>
              Fayas
            </span>
          </Link>

          {/* ── Desktop links ── */}
          <div className="hidden md:flex items-center gap-7">
            <NavLink to="/"             className={navLink} end>Accueil</NavLink>
            <NavLink to="/events"       className={navLink}>Événements</NavLink>
            <NavLink to="/universities" className={navLink}>Universités</NavLink>
            <NavLink to="/map"          className={navLink}>
              <span className="flex items-center gap-1.5">
                <Icon name="map" className="w-3.5 h-3.5" />
                Carte
              </span>
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/favorites" className={navLink}>
                Favoris
                {favCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm">
                    {favCount}
                  </span>
                )}
              </NavLink>
            )}
          </div>

          {/* ── Desktop actions ── */}
          <div className="hidden md:flex items-center gap-2">

            {/* Search */}
            <button onClick={() => setSearchOpen(v => !v)} aria-label="Rechercher" className={iconBtn}>
              <Icon name="search" className="w-4 h-4" strokeWidth={2} />
            </button>

            {/* Theme toggle */}
            <button onClick={toggle} aria-label="Thème" className={iconBtn}>
              <span key={isDark ? 'sun' : 'moon'} className="animate-theme-swap">
                <Icon name={isDark ? 'sun' : 'moon'} className={`w-4 h-4 ${isDark ? 'text-amber-300' : ''}`} strokeWidth={2} />
              </span>
            </button>

            {/* Favorites (non-logged) */}
            {!isAuthenticated && favCount > 0 && (
              <Link to="/favorites" aria-label="Favoris" className={`${iconBtn} relative`}>
                <Icon name="heart" className="w-4 h-4" strokeWidth={2} />
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[9px] font-bold rounded-full bg-rose-500 text-white flex items-center justify-center">
                  {favCount}
                </span>
              </Link>
            )}

            {/* Separator */}
            <div className={`w-px h-6 mx-1 ${isDark ? 'bg-white/[0.07]' : 'bg-gray-200'}`} />

            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setDropOpen(v => !v)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                    isDark
                      ? 'bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] hover:border-violet-500/40'
                      : 'bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200'
                  }`}>
                  <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-violet-900 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-violet-500/40">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  <Icon name="filter" className={`w-3.5 h-3.5 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''} ${isDark ? 'text-slate-500' : 'text-gray-400'}`} strokeWidth={2.5} />
                </button>

                {dropOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
                    <div className={`absolute right-0 mt-2 w-56 rounded-2xl py-1.5 z-50 animate-scale-in ${
                      isDark
                        ? 'bg-[#13131a] border border-white/[0.08] shadow-2xl shadow-black/60'
                        : 'bg-white border border-gray-100 shadow-2xl shadow-purple-500/10'
                    }`}>
                      <div className={`px-4 py-2.5 border-b mb-1 ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
                        <p className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Connecté en tant que</p>
                        <p className={`text-sm font-semibold truncate ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>{user?.name}</p>
                      </div>

                      {[
                        { to: '/dashboard', icon: 'ticket', label: 'Mes billets' },
                        { to: '/loyalty',   icon: 'gem',    label: 'FayasCoins' },
                        ...(isAdmin ? [{ to: '/admin', icon: 'tools', label: 'Administration' }] : []),
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setDropOpen(false)}
                          className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                            isDark
                              ? 'text-slate-300 hover:bg-violet-500/10 hover:text-violet-300'
                              : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                          }`}>
                          <Icon name={item.icon} className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}
                      <Link to="/favorites" onClick={() => setDropOpen(false)}
                        className={`flex items-center justify-between gap-2.5 px-4 py-2 text-sm transition-colors ${
                          isDark ? 'text-slate-300 hover:bg-rose-500/10 hover:text-rose-300' : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600'
                        }`}>
                        <span className="flex items-center gap-2.5"><Icon name="heart" className="w-4 h-4" />Mes favoris</span>
                        {favCount > 0 && <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600'}`}>{favCount}</span>}
                      </Link>

                      <div className={`border-t mt-1 pt-1 ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
                        <button onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
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
                <Link to="/login" className={`text-sm px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  isDark
                    ? 'text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06]'
                    : 'text-gray-600 hover:text-purple-700 border border-gray-200 hover:border-purple-300 hover:bg-purple-50/60'
                }`}>
                  Connexion
                </Link>
                <Link to="/register" className="btn-neon text-sm py-2 px-4">
                  <Icon name="sparkles" className="w-3.5 h-3.5" />
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile actions ── */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && favCount > 0 && (
              <Link to="/favorites" aria-label="Favoris" className={`${iconBtn} relative`}>
                <Icon name="heart" className="w-4 h-4 text-rose-400" strokeWidth={2} />
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[9px] font-bold rounded-full bg-rose-500 text-white flex items-center justify-center">{favCount}</span>
              </Link>
            )}
            <button onClick={toggle} className={iconBtn}>
              <span key={isDark ? 'sun-m' : 'moon-m'} className="animate-theme-swap">
                <Icon name={isDark ? 'sun' : 'moon'} className={`w-4 h-4 ${isDark ? 'text-amber-300' : ''}`} strokeWidth={2} />
              </span>
            </button>
            <button className={`${iconBtn}`} onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
              {menuOpen
                ? <Icon name="x" className="w-5 h-5" />
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>}
            </button>
          </div>
        </div>

        {/* ── Search bar dropdown ── */}
        {searchOpen && (
          <div className="hidden md:block pb-3 animate-fade-up">
            <form onSubmit={handleSearch} className="relative">
              <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Rechercher un événement, une ville, un lieu…"
                className={`w-full pl-11 pr-24 py-3 rounded-xl text-sm transition-all ${
                  isDark ? 'input-night' : 'border-2 border-gray-200 bg-white text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10'
                }`}
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-neon text-xs py-1.5 px-3">
                Chercher
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className={`md:hidden border-t px-4 py-4 space-y-1 animate-fade-up ${
          isDark ? 'bg-[#0d0d15] border-white/[0.06]' : 'bg-white border-gray-100'
        }`}>
          <form onSubmit={handleSearch} className="relative mb-3">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={searchVal} onChange={e => setSearchVal(e.target.value)}
              placeholder="Rechercher…"
              className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-sm ${isDark ? 'input-night' : 'border border-gray-200 bg-white focus:border-purple-500 focus:outline-none'}`} />
          </form>

          {[
            { to: '/',            label: 'Accueil',       end: true  },
            { to: '/events',      label: 'Événements',    end: false },
            { to: '/universities',label: 'Universités',   end: false },
            { to: '/map',         label: 'Carte',         end: false },
            ...(isAuthenticated ? [{ to: '/favorites', label: 'Mes Favoris', badge: favCount }] : []),
          ].map(({ to, label, end, badge }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between py-2.5 px-3 rounded-xl font-medium text-sm transition-colors ${
                  isActive
                    ? isDark ? 'bg-violet-500/10 text-violet-300' : 'bg-purple-50 text-purple-700'
                    : isDark ? 'text-slate-300 hover:bg-white/[0.05] hover:text-white' : 'text-gray-700 hover:bg-gray-50'
                }`
              }>
              {label}
              {badge > 0 && <span className="text-[10px] font-bold rounded-full bg-rose-500 text-white px-2 py-0.5">{badge}</span>}
            </NavLink>
          ))}

          <div className={`border-t pt-3 mt-3 ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            {isAuthenticated ? (
              <div className="space-y-1">
                {[
                  { to: '/dashboard', icon: 'ticket', label: 'Mes billets' },
                  { to: '/loyalty',   icon: 'gem',    label: 'FayasCoins' },
                  ...(isAdmin ? [{ to: '/admin', icon: 'tools', label: 'Administration' }] : []),
                ].map(item => (
                  <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${
                      isDark ? 'text-slate-300 hover:bg-white/[0.05] hover:text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                    <Icon name={item.icon} className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                    {item.label}
                  </Link>
                ))}
                <button onClick={handleLogout}
                  className="flex items-center gap-2 w-full py-2.5 px-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                  <Icon name="arrow_right" className="w-4 h-4 rotate-180" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login"    onClick={() => setMenuOpen(false)} className={`flex-1 text-center py-2.5 rounded-xl text-sm font-medium transition-colors ${isDark ? 'text-slate-300 border border-white/[0.08] hover:bg-white/[0.05]' : 'text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Connexion</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 btn-neon text-sm text-center justify-center">Inscription</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
