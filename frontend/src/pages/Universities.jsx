import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { Icon } from '../components/Icons'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useAuth } from '../context/AuthContext'

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
      {/* Colored accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 z-30 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
        style={{ backgroundColor: u.color }} />

      <div className="relative h-44 overflow-hidden flex-shrink-0">
        {/* Gradient background */}
        <div className="absolute inset-0 transition-opacity duration-500"
             style={{ background: `linear-gradient(135deg, ${u.color}22 0%, ${u.color}08 100%)` }} />

        {/* Logo centered */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {showLogo ? (
            <img
              src={u.logo_url}
              alt={u.name}
              loading="lazy"
              onError={() => setLogoError(true)}
              className="max-w-full max-h-full object-contain
                         group-hover:scale-105 transition-transform duration-500 ease-out
                         drop-shadow-sm"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 select-none">
              <span className="text-5xl font-extrabold opacity-60 group-hover:opacity-80 transition-opacity"
                    style={{ color: u.color }}>
                {u.short_name}
              </span>
            </div>
          )}
        </div>

        {/* Sheen diagonal sweep */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                        transition-transform duration-[1.2s] ease-out pointer-events-none
                        bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />

        {/* Top badges */}
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
            <Icon name="location" className="w-3 h-3" />
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
            Voir
            <Icon name="arrow_right" className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* CTA : créer un événement — visible uniquement si authentifié */}
        {isAuthenticated && (
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); navigate(`/universities/${u.id}/submit`) }}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                       text-xs font-bold
                       bg-gradient-to-br from-gray-50 to-gray-100
                       dark:from-[#1a1a24] dark:to-[#1a1a24]
                       text-gray-700 dark:text-slate-300
                       border border-gray-200 dark:border-white/[0.07]
                       hover:from-purple-600 hover:to-purple-700 hover:text-white hover:border-transparent
                       dark:hover:from-violet-700 dark:hover:to-violet-800 dark:hover:text-white dark:hover:border-transparent
                       hover:shadow-lg hover:shadow-purple-500/30
                       transition-all duration-250 ease-out"
          >
            <Icon name="plus_circle" className="w-3.5 h-3.5" />
            Créer un événement
          </button>
        )}
      </div>
    </Link>
  )
}

export default function Universities() {
  const [universities, setUniversities] = useState([])
  const [loading, setLoading]           = useState(true)
  const [gridRef, gridVisible]          = useScrollReveal(0.02)
  const { isAuthenticated }             = useAuth()

  useEffect(() => {
    api.get('/universities').then(r => setUniversities(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors duration-300">
      {/* ── Hero — Mesh Premium ── */}
      <div className="relative bg-mesh-gradient py-20 text-white overflow-hidden">
        {/* Noise grain */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'a\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23a)\'/%3E%3C/svg%3E")' }} />

        <div className="absolute inset-0 opacity-10 text-[18rem] flex items-center justify-center select-none pointer-events-none leading-none">🎓</div>
        {/* Floating blobs */}
        <div className="absolute top-10 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-16 w-56 h-56 bg-purple-300/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-pink-400/10 rounded-full blur-2xl animate-float-fast" />

        <div className="relative max-w-4xl mx-auto px-4 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg shadow-purple-900/30">
            <Icon name="graduation" className="w-4 h-4" />
            Soirées Universitaires Maroc
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
            Chaque université,<br />
            <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent bg-gradient-sweep">ses propres soirées</span>
          </h1>
          <p className="text-white/75 text-lg max-w-2xl mx-auto leading-relaxed">
            Étudiants, retrouvez les galas, soirées de fin d'année et événements exclusifs
            organisés par et pour votre université. Vivez chaque moment avec votre promo.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Loading skeletons ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="sk-card fade-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="sk-card-img" style={{ height: '11rem' }} />
                <div className="sk-card-body">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="skeleton rounded-full" style={{ width: '0.75rem', height: '2.5rem' }} />
                    <div className="sk-title" style={{ width: '70%' }} />
                  </div>
                  <div className="sk-text" />
                  <div className="sk-text" style={{ width: '80%' }} />
                  <div className="skeleton h-px w-full mt-1" />
                  <div className="flex justify-between pt-1">
                    <div className="sk-text" style={{ width: '30%' }} />
                    <div className="sk-text" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((u, i) => (
              <UniCard key={u.id} u={u} index={i} visible={gridVisible} isAuthenticated={isAuthenticated} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
