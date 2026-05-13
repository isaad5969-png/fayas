import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import EventCard from '../components/EventCard'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function UniversityEvents() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [gridRef, gridVisible] = useScrollReveal(0.02)

  useEffect(() => {
    api.get(`/universities/${id}/events`)
      .then(r => setData(r.data))
      .catch(() => navigate('/universities'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { university, events } = data || {}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Hero */}
      <div className="relative py-16 text-white overflow-hidden" style={{ backgroundColor: university?.color || '#7C3AED' }}>
        <div className="absolute inset-0 opacity-10 text-[20rem] flex items-center justify-center select-none pointer-events-none">🎓</div>
        {/* Subtle blob overlay */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-up">
          <Link to="/universities"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            ← Toutes les universités
          </Link>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-extrabold shrink-0 border border-white/30">
              {university?.short_name?.slice(0, 2)}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{university?.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-white/80 text-sm">
                <span>📍 {university?.city}</span>
                <span>👥 {(university?.student_count / 1000).toFixed(0)}K étudiants</span>
                <span>🎉 {events?.length} événement{events?.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          {university?.description && (
            <p className="mt-4 text-white/80 max-w-2xl leading-relaxed">{university.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {events?.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Aucun événement programmé</h3>
            <p className="text-gray-400 dark:text-gray-500 mb-6">Il n'y a pas encore d'événements pour cette université.</p>
            <Link to="/events" className="btn-primary">Voir tous les événements</Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Soirées & événements — {university?.short_name}
            </h2>
            <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events?.map((e, i) => (
                <div key={e.id}
                  className={`transition-all duration-600 ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${(i % 6) * 60}ms` }}>
                  <EventCard event={{ ...e, university_color: university?.color, university_short_name: university?.short_name }} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
