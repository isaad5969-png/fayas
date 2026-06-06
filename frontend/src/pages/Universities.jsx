import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { Icon } from '../components/Icons'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useAuth } from '../context/AuthContext'
import AmbientScene3D from '../components/LazyAmbientScene3D'
import toast from 'react-hot-toast'

/* ════════════════════════════════════
   BATTLE DES CAMPUS — score d'engagement
════════════════════════════════════ */
const VOTES_KEY = 'fayas_campus_votes'

/* Score transparent : soutiens (×6) + soirées (×12) + milliers d'étudiants (×2) */
export function campusScore(u) {
  return (u.votes || 0) * 6 + (u.event_count || 0) * 12 + Math.round((u.student_count || 0) / 1000) * 2
}

const PODIUM = [
  { ring: '#FFD700', glow: 'rgba(255,215,0,0.35)', label: 'Champion', emoji: '👑' },
  { ring: '#C0C0C0', glow: 'rgba(192,192,192,0.30)', label: 'Vice-champion', emoji: '🥈' },
  { ring: '#CD7F32', glow: 'rgba(205,127,50,0.30)', label: '3ᵉ place', emoji: '🥉' },
]

/* Carte podium (top 3) */
function PodiumCard({ u, rank, voted, onVote }) {
  const p = PODIUM[rank]
  return (
    <div className="relative rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-1.5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${p.ring}55`,
        boxShadow: `0 0 32px ${p.glow}`,
        marginTop: rank === 0 ? 0 : 24,
      }}>
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-extrabold"
        style={{ background: p.ring, color: '#1a1a1a' }}>
        #{rank + 1} · {p.label}
      </div>
      <div className="text-3xl mt-2 mb-1">{p.emoji}</div>
      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center overflow-hidden p-1.5 mb-3 shadow-lg">
        {u.logo_url
          ? <img src={u.logo_url} alt={u.short_name} className="w-full h-full object-contain" loading="lazy" />
          : <span className="font-extrabold" style={{ color: u.color }}>{u.short_name.slice(0, 3)}</span>}
      </div>
      <Link to={`/universities/${u.id}`} className="font-extrabold text-white text-sm hover:text-purple-300 transition-colors">
        {u.short_name}
      </Link>
      <p className="text-[11px] mt-0.5 mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{u.city}</p>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-extrabold tabular-nums" style={{ color: p.ring }}>{campusScore(u).toLocaleString('fr')}</span>
        <span className="text-[10px] uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>pts</span>
      </div>
      <VoteButton u={u} voted={voted} onVote={onVote} />
    </div>
  )
}

/* Ligne classement (#4+) */
function RankRow({ u, rank, maxScore, voted, onVote }) {
  const score = campusScore(u)
  const pct = maxScore > 0 ? Math.max(6, (score / maxScore) * 100) : 6
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/[0.03]"
      style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="w-7 text-center font-mono font-bold text-sm flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {rank + 1}
      </span>
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
        {u.logo_url
          ? <img src={u.logo_url} alt={u.short_name} className="w-full h-full object-contain" loading="lazy" />
          : <span className="text-[9px] font-extrabold" style={{ color: u.color }}>{u.short_name.slice(0, 3)}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <Link to={`/universities/${u.id}`} className="text-sm font-bold text-white truncate hover:text-purple-300 transition-colors">
            {u.short_name} <span className="font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>· {u.city}</span>
          </Link>
          <span className="text-sm font-extrabold tabular-nums flex-shrink-0" style={{ color: u.color }}>
            {score.toLocaleString('fr')}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${u.color}, ${u.color}99)` }} />
        </div>
      </div>
      <VoteButton u={u} voted={voted} onVote={onVote} compact />
    </div>
  )
}

/* Bouton de soutien */
function VoteButton({ u, voted, onVote, compact }) {
  return (
    <button
      onClick={() => onVote(u)}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-bold transition-all duration-200 flex-shrink-0
                  ${compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-4 py-2 text-xs w-full'}
                  ${voted ? 'text-white' : 'text-white/80 hover:text-white'}`}
      style={voted
        ? { background: u.color, boxShadow: `0 4px 14px ${u.color}66` }
        : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}
      title={voted ? 'Retirer mon soutien' : 'Soutenir ce campus'}
    >
      <Icon name="bolt" className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}
        style={voted ? { fill: 'currentColor' } : {}} />
      {voted ? `Soutenu · ${u.votes}` : `Soutenir · ${u.votes}`}
    </button>
  )
}

/* ── Logo avec fallback couleur ── */
function UniLogo({ u, size = 'sm' }) {
  const [err, setErr] = useState(false)
  const dim = size === 'sm' ? 'w-10 h-10' : 'w-14 h-14'
  const txt = size === 'sm' ? 'text-[10px]' : 'text-xs'
  if (u.logo_url && !err) {
    return (
      <img
        src={u.logo_url}
        alt={u.short_name}
        loading="lazy"
        onError={() => setErr(true)}
        className={`${dim} object-contain rounded-xl p-1 bg-white dark:bg-[#1a1a24] border border-gray-100 dark:border-white/[0.08] flex-shrink-0`}
      />
    )
  }
  return (
    <div className={`${dim} rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold ${txt}`}
      style={{ background: `${u.color}22`, color: u.color, border: `1px solid ${u.color}44` }}>
      {u.short_name.slice(0, 3)}
    </div>
  )
}

/* ── Ligne de tableau ── */
function UniRow({ u, index }) {
  return (
    <Link
      to={`/universities/${u.id}`}
      className="group flex items-center gap-4 px-5 py-3.5
                 border-b border-gray-100 dark:border-white/[0.04]
                 hover:bg-purple-50/60 dark:hover:bg-white/[0.03]
                 transition-colors duration-150"
    >
      {/* # */}
      <span className="w-6 text-[11px] text-gray-300 dark:text-white/20 font-mono text-right flex-shrink-0">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Logo */}
      <UniLogo u={u} size="sm" />

      {/* Sigle + nom */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
            {u.short_name}
          </span>
          {u.event_count > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--v2-vio-3)' }}>
              <Icon name="sparkles" className="w-2.5 h-2.5" />
              {u.event_count} soirée{u.event_count > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.name}</p>
      </div>

      {/* Ville */}
      <div className="hidden sm:flex items-center gap-1.5 w-32 flex-shrink-0">
        <Icon name="map" className="w-3 h-3 text-gray-400 dark:text-gray-600 flex-shrink-0" />
        <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{u.city}</span>
      </div>

      {/* Étudiants */}
      <div className="hidden md:block w-20 flex-shrink-0 text-right">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
          {u.student_count >= 1000 ? `${(u.student_count / 1000).toFixed(0)}K` : u.student_count}
        </span>
        <p className="text-[10px] text-gray-400 dark:text-gray-600">étudiants</p>
      </div>

      {/* Arrow */}
      <Icon name="arrow_right"
        className="w-4 h-4 text-gray-300 dark:text-white/20 group-hover:text-purple-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
    </Link>
  )
}

/* ── Carte grille ── */
function UniCard({ u, index, visible, isAuthenticated }) {
  const [logoError, setLogoError] = useState(false)
  const navigate = useNavigate()
  const showLogo = u.logo_url && !logoError
  return (
    <Link
      to={`/universities/${u.id}`}
      className={`group relative rounded-2xl overflow-hidden
                  shadow-sm hover:shadow-2xl hover:shadow-violet-500/15 dark:hover:shadow-violet-500/20
                  hover:-translate-y-2 hover:scale-[1.01]
                  transition-all duration-500 ease-out bg-white dark:bg-[#13131a]
                  border border-gray-100 dark:border-white/[0.06]
                  hover:border-purple-200/80 dark:hover:border-violet-500/30
                  card-accent-top flex flex-col
                  ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-97'}`}
      style={{ transitionDelay: `${(index % 6) * 65}ms`, transitionDuration: '550ms' }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 z-30 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
        style={{ backgroundColor: u.color }} />

      <div className="relative h-44 overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 transition-opacity duration-500"
             style={{ background: `linear-gradient(135deg, ${u.color}22 0%, ${u.color}08 100%)` }} />
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {showLogo ? (
            <img src={u.logo_url} alt={u.name} loading="lazy"
              onError={() => setLogoError(true)}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-sm" />
          ) : (
            <span className="text-5xl font-extrabold opacity-60 group-hover:opacity-80 transition-opacity select-none"
              style={{ color: u.color }}>{u.short_name}</span>
          )}
        </div>
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                        transition-transform duration-[1.2s] ease-out pointer-events-none
                        bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-md"
                style={{ backgroundColor: `${u.color}22`, color: u.color, borderColor: `${u.color}44` }}>
            <Icon name="graduation" className="w-3 h-3" />
            {u.short_name}
          </span>
        </div>
        {u.event_count > 0 && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-purple-700 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg shadow-purple-500/40">
              <Icon name="sparkles" className="w-3 h-3" />
              {u.event_count} soirée{u.event_count > 1 ? 's' : ''}
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <p className="text-xs font-medium inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Icon name="map" className="w-3 h-3" />
            {u.city}
          </p>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-10 rounded-full shrink-0 transition-all duration-300 group-hover:h-12" style={{ backgroundColor: u.color }} />
          <h3 className="font-extrabold text-gray-900 dark:text-white text-sm leading-snug group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
            {u.name}
          </h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{u.description}</p>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/[0.05]">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="font-extrabold text-purple-700 dark:text-purple-400">{(u.student_count / 1000).toFixed(0)}K</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">étudiants</p>
            </div>
            <div className="text-center">
              <p className="font-extrabold text-purple-700 dark:text-purple-400">{u.event_count ?? 0}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">événements</p>
            </div>
          </div>
          <span className="text-sm font-bold text-purple-600 dark:text-purple-400 group-hover:text-purple-800 dark:group-hover:text-purple-300 transition-all group-hover:translate-x-1 inline-flex items-center gap-1">
            Voir <Icon name="arrow_right" className="w-3.5 h-3.5" />
          </span>
        </div>
        {isAuthenticated && (
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); navigate(`/universities/${u.id}/submit`) }}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                       text-xs font-bold bg-gradient-to-br from-gray-50 to-gray-100
                       dark:from-[#1a1a24] dark:to-[#1a1a24] text-gray-700 dark:text-slate-300
                       border border-gray-200 dark:border-white/[0.07]
                       hover:from-purple-600 hover:to-purple-700 hover:text-white hover:border-transparent
                       dark:hover:from-violet-700 dark:hover:to-violet-800 dark:hover:text-white dark:hover:border-transparent
                       hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-250 ease-out">
            <Icon name="plus_circle" className="w-3.5 h-3.5" />
            Créer un événement
          </button>
        )}
      </div>
    </Link>
  )
}

/* ════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════ */
export default function Universities() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialView = ['list', 'grid', 'ranking'].includes(searchParams.get('view')) ? searchParams.get('view') : 'list'

  const [universities, setUniversities] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [view,         setViewState]    = useState(initialView) // 'list' | 'grid' | 'ranking'
  const [search,       setSearch]       = useState('')
  const [cityFilter,   setCityFilter]   = useState('all')
  const [myVotes,      setMyVotes]      = useState({})
  const [gridRef, gridVisible]          = useScrollReveal(0.02)
  const { isAuthenticated }             = useAuth()

  /* Vue synchronisée avec l'URL (?view=ranking) → lien partageable */
  const setView = useCallback((v) => {
    setViewState(v)
    setSearchParams(prev => {
      const p = new URLSearchParams(prev)
      if (v === 'list') p.delete('view'); else p.set('view', v)
      return p
    }, { replace: true })
  }, [setSearchParams])

  useEffect(() => {
    api.get('/universities').then(r => setUniversities(r.data)).finally(() => setLoading(false))
    try { setMyVotes(JSON.parse(localStorage.getItem(VOTES_KEY) || '{}')) } catch { /* ignore */ }
  }, [])

  /* ── Optimisation : listes dérivées mémoïsées ── */
  const cities = useMemo(
    () => ['all', ...Array.from(new Set(universities.map(u => u.city))).sort()],
    [universities],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return universities.filter(u => {
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.short_name.toLowerCase().includes(q) || u.city.toLowerCase().includes(q)
      const matchCity = cityFilter === 'all' || u.city === cityFilter
      return matchSearch && matchCity
    })
  }, [universities, search, cityFilter])

  const ranked = useMemo(
    () => [...filtered].sort((a, b) => campusScore(b) - campusScore(a)),
    [filtered],
  )
  const totalVotes = useMemo(
    () => universities.reduce((s, u) => s + (u.votes || 0), 0),
    [universities],
  )

  /* ── Vote « Battle des Campus » (visiteurs non connectés inclus) ── */
  const handleVote = useCallback((u) => {
    const voted = !!myVotes[u.id]
    // MAJ optimiste du compteur + score
    setUniversities(prev => prev.map(x =>
      x.id === u.id ? { ...x, votes: Math.max(0, (x.votes || 0) + (voted ? -1 : 1)) } : x,
    ))
    const nextVotes = { ...myVotes }
    if (voted) delete nextVotes[u.id]; else nextVotes[u.id] = true
    setMyVotes(nextVotes)
    try { localStorage.setItem(VOTES_KEY, JSON.stringify(nextVotes)) } catch { /* ignore */ }

    const req = voted ? api.delete(`/universities/${u.id}/vote`) : api.post(`/universities/${u.id}/vote`)
    req
      .then(() => { if (!voted) toast.success(`Merci d'avoir soutenu ${u.short_name} ! ⚡`) })
      .catch(() => {
        // rollback
        setUniversities(prev => prev.map(x =>
          x.id === u.id ? { ...x, votes: Math.max(0, (x.votes || 0) + (voted ? 1 : -1)) } : x,
        ))
        setMyVotes(myVotes)
        try { localStorage.setItem(VOTES_KEY, JSON.stringify(myVotes)) } catch { /* ignore */ }
        toast.error('Vote non enregistré — réessayez')
      })
  }, [myVotes])

  const maxScore = ranked.length ? campusScore(ranked[0]) : 0

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0d' }}>

      {/* ── Hero 3D ── */}
      <div className="relative py-24 text-white overflow-hidden page-header-3d"
        style={{ background: 'linear-gradient(180deg, #08001a 0%, #0d0020 50%, #0a0a0d 100%)' }}>

        {/* Ambient 3D — academic / violet / gold */}
        <AmbientScene3D
          colors={['#7c3aed', '#4f46e5', '#f59e0b', '#3b82f6', '#059669']}
          count={18}
          seed={99}
          style={{ zIndex: 0 }}
        />

        {/* Barre colorée top */}
        <div className="absolute top-0 left-0 right-0 h-0.5"
             style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5, #3b82f6, #059669)', zIndex: 2 }} />

        {/* Grille déco */}
        <div className="absolute inset-0 pointer-events-none" style={{
          zIndex: 1,
          backgroundImage: 'linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }} />

        <div className="relative max-w-4xl mx-auto px-4 text-center" style={{ zIndex: 2 }}>
          <span className="kicker-v2 mb-5">Campus</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 mt-4 leading-tight"
            style={{ letterSpacing: '-0.04em', color: 'var(--v2-tx1)', textShadow: '0 0 50px rgba(124,58,237,0.45)' }}>
            Universités du{' '}
            <em className="not-italic" style={{ color: 'var(--v2-vio-3)' }}>Maroc</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '17px' }}>
            {universities.length} établissements · Galas, soirées de fin d'année, événements exclusifs
          </p>

          {/* Stats pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { label: 'Établissements', val: universities.length || 55 },
              { label: 'Villes', val: cities.length > 1 ? cities.length - 1 : 14 },
              { label: 'Étudiants', val: '1M+' },
            ].map(s => (
              <div key={s.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold"
                style={{ background: 'rgba(124,58,237,0.12)', borderColor: 'rgba(124,58,237,0.35)', color: '#c4b5fd' }}>
                <span className="font-extrabold text-white">{s.val}</span>
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Barre de contrôle ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">

          {/* Recherche */}
          <div className="relative flex-1 max-w-sm">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--v2-tx3)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une université…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'var(--v2-tx1)',
              }}
            />
          </div>

          {/* Filtre ville */}
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="py-2.5 px-3 rounded-xl text-sm font-medium outline-none transition-all cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'var(--v2-tx1)',
            }}
          >
            <option value="all" style={{ background: '#13131a' }}>Toutes les villes</option>
            {cities.filter(c => c !== 'all').map(c => (
              <option key={c} value={c} style={{ background: '#13131a' }}>{c}</option>
            ))}
          </select>

          {/* Compteur résultats */}
          <span className="text-sm ml-auto" style={{ color: 'var(--v2-tx3)' }}>
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          </span>

          {/* Toggle vue */}
          <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
            <button
              onClick={() => setView('list')}
              className="px-3 py-2 transition-all"
              style={view === 'list'
                ? { background: 'rgba(124,58,237,0.25)', color: 'var(--v2-vio-3)' }
                : { background: 'transparent', color: 'var(--v2-tx3)' }}
              title="Vue liste"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
            <button
              onClick={() => setView('grid')}
              className="px-3 py-2 transition-all"
              style={view === 'grid'
                ? { background: 'rgba(124,58,237,0.25)', color: 'var(--v2-vio-3)' }
                : { background: 'transparent', color: 'var(--v2-tx3)' }}
              title="Vue grille"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button
              onClick={() => setView('ranking')}
              className="px-3 py-2 transition-all"
              style={view === 'ranking'
                ? { background: 'rgba(245,158,11,0.22)', color: '#fbbf24' }
                : { background: 'transparent', color: 'var(--v2-tx3)' }}
              title="Battle des campus"
            >
              <Icon name="crown" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.04]">
                <div className="w-6 h-3 rounded bg-white/[0.05] animate-pulse" />
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] animate-pulse flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-3.5 w-32 rounded bg-white/[0.05] animate-pulse mb-1.5" />
                  <div className="h-2.5 w-48 rounded bg-white/[0.05] animate-pulse" />
                </div>
                <div className="hidden sm:block h-3 w-20 rounded bg-white/[0.05] animate-pulse" />
                <div className="hidden md:block h-3 w-12 rounded bg-white/[0.05] animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="graduation" className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--v2-tx3)' }} />
            <p style={{ color: 'var(--v2-tx2)' }}>Aucune université trouvée pour cette recherche.</p>
          </div>
        ) : view === 'ranking' ? (
          /* ══ BATTLE DES CAMPUS ══ */
          <div className="space-y-8">
            {/* Bannière explicative */}
            <div className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
              style={{ background: 'linear-gradient(120deg, rgba(245,158,11,0.12), rgba(124,58,237,0.12))', border: '1px solid rgba(245,158,11,0.25)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(245,158,11,0.2)' }}>
                    <Icon name="crown" className="w-6 h-6" style={{ color: '#fbbf24' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                      Battle des Campus
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24' }}>NOUVEAU</span>
                    </h2>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Soutiens ton université d'un clic — pas besoin de compte. Le classement est mis à jour en direct.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl flex-shrink-0"
                  style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Icon name="bolt" className="w-4 h-4" style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  <span className="font-extrabold text-white tabular-nums">{totalVotes.toLocaleString('fr')}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>soutiens au total</span>
                </div>
              </div>
            </div>

            {/* Podium top 3 */}
            {ranked.length >= 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                {ranked.slice(0, 3).map((u, i) => (
                  <PodiumCard key={u.id} u={u} rank={i} voted={!!myVotes[u.id]} onVote={handleVote} />
                ))}
              </div>
            )}

            {/* Reste du classement */}
            {ranked.length > 3 && (
              <div className="rounded-2xl p-3 space-y-1.5"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                {ranked.slice(3).map((u, i) => (
                  <RankRow key={u.id} u={u} rank={i + 3} maxScore={maxScore} voted={!!myVotes[u.id]} onVote={handleVote} />
                ))}
              </div>
            )}
          </div>
        ) : view === 'list' ? (
          /* ══ VUE LISTE / TABLEAU ══ */
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
            {/* En-tête tableau */}
            <div className="flex items-center gap-4 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{ color: 'var(--v2-tx3)', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
              <span className="w-6 text-right flex-shrink-0">#</span>
              <span className="w-10 flex-shrink-0" />
              <span className="flex-1">Établissement</span>
              <span className="hidden sm:block w-32 flex-shrink-0">Ville</span>
              <span className="hidden md:block w-20 flex-shrink-0 text-right">Effectif</span>
              <span className="w-4 flex-shrink-0" />
            </div>
            {/* Lignes */}
            {filtered.map((u, i) => (
              <UniRow key={u.id} u={u} index={i} />
            ))}
          </div>
        ) : (
          /* ══ VUE GRILLE ══ */
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((u, i) => (
              <UniCard key={u.id} u={u} index={i} visible={gridVisible} isAuthenticated={isAuthenticated} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}