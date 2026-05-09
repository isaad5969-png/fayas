import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

function UniCard({ u }) {
  const [imgError, setImgError] = useState(false)
  const showPhoto = u.image_url && !imgError
  return (
    <Link
      to={`/universities/${u.id}`}
      className="group rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 bg-white border border-gray-100 flex flex-col"
    >
      <div className="relative h-44 overflow-hidden flex-shrink-0">
        {showPhoto ? (
          <img
            src={u.image_url}
            alt={u.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
               style={{ background: `linear-gradient(135deg, ${u.color}dd, ${u.color}66)` }}>
            <span className="text-7xl opacity-20 select-none">🎓</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="text-xs font-bold text-white bg-black/40 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded-full">
            🎓 {u.short_name}
          </span>
        </div>
        {u.event_count > 0 && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-bold text-white bg-purple-600/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {u.event_count} soirée{u.event_count > 1 ? 's' : ''}
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <p className="text-white/90 text-xs font-medium">📍 {u.city}</p>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-10 rounded-full shrink-0" style={{ backgroundColor: u.color }} />
          <h3 className="font-extrabold text-gray-900 text-sm leading-snug group-hover:text-purple-700 transition-colors">
            {u.name}
          </h3>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{u.description}</p>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="font-extrabold text-purple-700">{(u.student_count / 1000).toFixed(0)}K</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">étudiants</p>
            </div>
            <div className="text-center">
              <p className="font-extrabold text-purple-700">{u.event_count ?? 0}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">événements</p>
            </div>
          </div>
          <span className="text-sm font-bold text-purple-600 group-hover:text-purple-800 transition-colors">
            Voir les soirées →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function Universities() {
  const [universities, setUniversities] = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    api.get('/universities').then(r => setUniversities(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 py-20 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-[18rem] flex items-center justify-center select-none pointer-events-none">🎓</div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            🎓 Soirées Universitaires Maroc
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Chaque université,<br />ses propres soirées
          </h1>
          <p className="text-white/75 text-lg max-w-2xl mx-auto">
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
              <div key={i} className="rounded-2xl overflow-hidden shadow-sm bg-white animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map(u => (
              <UniCard key={u.id} u={u} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
