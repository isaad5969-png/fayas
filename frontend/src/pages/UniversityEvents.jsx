import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import EventCard from '../components/EventCard'

export default function UniversityEvents() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/universities/${id}/events`)
      .then(r => setData(r.data))
      .catch(() => navigate('/universities'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { university, events } = data || {}

  return (
    <div>
      {/* Hero */}
      <div className="relative py-16 text-white overflow-hidden" style={{ backgroundColor: university?.color || '#7C3AED' }}>
        <div className="absolute inset-0 opacity-10 text-[20rem] flex items-center justify-center">🎓</div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/universities" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            ← Toutes les universités
          </Link>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-extrabold shrink-0">
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
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun événement programmé</h3>
            <p className="text-gray-400 mb-6">Il n'y a pas encore d'événements pour cette université.</p>
            <Link to="/events" className="btn-primary">Voir tous les événements</Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Soirées & événements — {university?.short_name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events?.map(e => <EventCard key={e.id} event={{ ...e, university_color: university?.color, university_short_name: university?.short_name }} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
