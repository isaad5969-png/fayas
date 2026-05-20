import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import EventCard from '../components/EventCard'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/Icons'

const TYPE_LABEL = {
  soiree:     { label: 'Soirée',       color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
  concert:    { label: 'Concert',      color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  universite: { label: 'Universitaire',color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  gala:       { label: 'Gala',         color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  autre:      { label: 'Événement',    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-MA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function SubmissionCard({ event, color }) {
  const type = TYPE_LABEL[event.type] || TYPE_LABEL.autre
  const placeholderGradient = `linear-gradient(135deg, ${color}cc, ${color}66)`

  return (
    <div className="card overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Photo */}
      <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-800">
        {event.image_url ? (
          <img
            src={event.image_url} alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ filter: 'brightness(0.9)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30 select-none"
            style={{ backgroundImage: placeholderGradient }}>
            🎓
          </div>
        )}
        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Pending badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
          <Icon name="pending" className="w-3 h-3" />
          En attente
        </div>

        {/* Type badge */}
        <div className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full ${type.color} backdrop-blur-sm`}>
          {type.label}
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
          <h3 className="font-bold text-white text-sm leading-tight line-clamp-2">{event.title}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: 'calendar', text: formatDate(event.date) },
            { icon: 'clock',    text: event.time },
            { icon: 'location', text: event.venue },
            { icon: 'building', text: event.city },
          ].map(({ icon, text }) => (
            <div key={icon} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Icon name={icon} className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              <span className="truncate">{text}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Price + capacity */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500">À partir de</span>
            <p className="font-bold text-purple-700 dark:text-purple-400 text-sm">{event.price_standard} MAD</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 dark:text-gray-500">Capacité</span>
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{event.capacity} places</p>
          </div>
        </div>

        {/* Dress code */}
        {event.dress_code && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 rounded-lg px-3 py-2">
            <Icon name="shirt" className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{event.dress_code}</span>
          </div>
        )}

        {/* Submitted by */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          <Icon name="user" className="w-3.5 h-3.5" />
          <span>Proposé par <span className="font-medium text-gray-600 dark:text-gray-400">{event.submitter_name}</span></span>
        </div>
      </div>
    </div>
  )
}

export default function UniversityEvents() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [gridRef, gridVisible] = useScrollReveal(0.02)
  const [subRef, subVisible] = useScrollReveal(0.02)

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

  const { university, events = [], submissions = [] } = data || {}
  const uniColor = university?.color || '#7C3AED'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Hero */}
      <div className="relative py-16 text-white overflow-hidden" style={{ backgroundColor: uniColor }}>
        <div className="absolute inset-0 opacity-[0.07] text-[20rem] flex items-center justify-center select-none pointer-events-none leading-none">🎓</div>
        {/* blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-up">
          <Link to="/universities"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            ← Toutes les universités
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* University info */}
            <div className="flex items-center gap-5 flex-1">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-extrabold shrink-0 border border-white/30">
                {university?.short_name?.slice(0, 2)}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{university?.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-white/80 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Icon name="location" className="w-3.5 h-3.5" />
                    {university?.city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="users" className="w-3.5 h-3.5" />
                    {(university?.student_count / 1000).toFixed(0)}K étudiants
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="ticket" className="w-3.5 h-3.5" />
                    {events?.length} événement{events?.length !== 1 ? 's' : ''}
                  </span>
                  {submissions.length > 0 && (
                    <span className="flex items-center gap-1.5 bg-amber-400/25 border border-amber-300/40 px-2.5 py-0.5 rounded-full text-amber-100">
                      <Icon name="pending" className="w-3 h-3" />
                      {submissions.length} proposition{submissions.length > 1 ? 's' : ''} en attente
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CTA: propose event */}
            {isAuthenticated ? (
              <Link to={`/universities/${id}/submit`}
                className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-50 transition-colors font-bold px-5 py-3 rounded-xl shadow-lg text-sm shrink-0">
                <Icon name="plus_circle" className="w-4 h-4" style={{ color: uniColor }} />
                Proposer un événement
              </Link>
            ) : (
              <Link to="/login"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm text-white transition-colors font-semibold px-5 py-3 rounded-xl text-sm shrink-0">
                <Icon name="lock" className="w-4 h-4" />
                Connectez-vous pour proposer
              </Link>
            )}
          </div>

          {university?.description && (
            <p className="mt-4 text-white/80 max-w-2xl leading-relaxed">{university.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

        {/* ── Published events ── */}
        {events?.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Icon name="calendar" className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Aucun événement programmé</h3>
            <p className="text-gray-400 dark:text-gray-500 mb-6">Il n'y a pas encore d'événements publiés pour cette université.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/events" className="btn-secondary">Voir tous les événements</Link>
              {isAuthenticated && (
                <Link to={`/universities/${id}/submit`} className="btn-primary">
                  <Icon name="plus_circle" className="w-4 h-4" />
                  Proposer le premier événement
                </Link>
              )}
            </div>
          </div>
        ) : (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${uniColor}22` }}>
                <Icon name="ticket" className="w-4 h-4" style={{ color: uniColor }} />
              </span>
              Soirées &amp; événements — {university?.short_name}
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
          </section>
        )}

        {/* ── Student submissions ── */}
        {submissions.length > 0 && (
          <section>
            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 text-sm font-semibold px-4 py-1.5 rounded-full">
                <Icon name="pending" className="w-4 h-4" />
                Propositions d'événements étudiants
              </div>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 mb-6">
              <p className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <Icon name="info" className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Ces événements ont été soumis par des étudiants et sont en attente de validation par l'équipe Fayas avant publication officielle.
              </p>
            </div>

            <div ref={subRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map((e, i) => (
                <div key={e.id}
                  className={`transition-all duration-600 ${subVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${(i % 6) * 60}ms` }}>
                  <SubmissionCard event={e} color={uniColor} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Prompt to submit if authenticated and no submissions yet */}
        {isAuthenticated && submissions.length === 0 && events.length > 0 && (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${uniColor}22` }}>
              <Icon name="plus_circle" className="w-7 h-7" style={{ color: uniColor }} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">Vous organisez un événement ?</h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-4 max-w-sm mx-auto">
              Soumettez votre événement pour qu'il apparaisse sur la page de votre université.
            </p>
            <Link to={`/universities/${id}/submit`} className="btn-primary">
              <Icon name="plus_circle" className="w-4 h-4" />
              Proposer un événement
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
