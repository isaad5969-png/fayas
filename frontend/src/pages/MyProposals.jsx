import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/Icons'
import toast from 'react-hot-toast'

const ORG_LEVELS = {
  rookie: { label: 'Rookie',  emoji: '🌱', desc: '1er événement',          color: 'from-gray-400 to-gray-600',           next: 'Pro (à 2 événements)' },
  pro:    { label: 'Pro',     emoji: '⭐', desc: 'Organisateur confirmé',  color: 'from-blue-500 to-cyan-500',          next: 'Legend (à 5 événements)' },
  legend: { label: 'Legend',  emoji: '👑', desc: '5+ événements',          color: 'from-amber-500 via-orange-500 to-rose-500', next: null },
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-MA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MyProposals() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchData()
  }, [isAuthenticated, navigate])

  const fetchData = () => {
    setLoading(true)
    api.get('/submissions/mine')
      .then(r => setData(r.data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`Supprimer définitivement la proposition « ${title} » ?`)) return
    setDeletingId(id)
    try {
      await api.delete(`/submissions/${id}`)
      toast.success('Proposition supprimée')
      fetchData()
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { submissions = [], stats = {} } = data || {}
  const level = ORG_LEVELS[stats.organizer_level] || ORG_LEVELS.rookie

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

      {/* ── Hero with stats ── */}
      <div className="relative overflow-hidden bg-mesh-gradient text-white py-16">
        <div className="absolute inset-0 opacity-[0.07] text-[18rem] flex items-center justify-center select-none pointer-events-none leading-none">🎤</div>
        <div className="absolute top-10 right-20 w-40 h-40 rounded-full bg-white/10 blur-3xl animate-blob" />
        <div className="absolute bottom-10 left-20 w-56 h-56 rounded-full bg-pink-300/10 blur-3xl animate-float-slow" />

        <div className="relative container-wide animate-fade-up">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            ← Mon tableau de bord
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-3">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                Organisateur étudiant
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Mes propositions
              </h1>
              <p className="text-white/70 text-sm md:text-base mt-2 max-w-xl">
                Gérez tous vos événements soumis. Suivez l'intérêt communautaire et progressez vers le niveau Legend.
              </p>
            </div>

            {/* Organizer level badge */}
            <div className={`inline-flex items-center gap-3 bg-gradient-to-r ${level.color} px-5 py-3 rounded-2xl shadow-2xl shadow-black/30 border border-white/20`}>
              <span className="text-3xl">{level.emoji}</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Niveau</p>
                <p className="text-xl font-extrabold leading-tight">{level.label}</p>
                <p className="text-[10px] text-white/80">{level.desc}</p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            {[
              { label: 'Propositions',    value: stats.total || 0,          icon: 'sparkles' },
              { label: 'Soutiens reçus',  value: stats.total_interests || 0,icon: 'heart'    },
              { label: 'Validées par communauté', value: stats.validated || 0,      icon: 'check_circle' },
              { label: 'Prochain palier', value: level.next ? '🎯' : '✨ Max', icon: 'rocket', hint: level.next || 'Vous êtes au top !' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={s.icon} className="w-4 h-4 text-white/70" />
                  <p className="text-[10px] uppercase tracking-wider text-white/60 font-bold">{s.label}</p>
                </div>
                <p className="text-2xl font-extrabold tabular-nums">{s.value}</p>
                {s.hint && <p className="text-[10px] text-white/70 mt-0.5">{s.hint}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container-wide py-10">
        {submissions.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20 card-elevated">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-5 flex items-center justify-center shadow-2xl shadow-purple-500/40">
              <Icon name="sparkles" className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
              Aucune proposition pour le moment
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Vous n'avez pas encore proposé d'événement. Lancez-vous et organisez votre première soirée !
            </p>
            <Link to="/universities" className="btn-primary">
              <Icon name="plus_circle" className="w-4 h-4" />
              Proposer un événement
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {submissions.length} proposition{submissions.length > 1 ? 's' : ''}
              </h2>
              <Link to="/universities" className="btn-primary text-sm">
                <Icon name="plus_circle" className="w-4 h-4" />
                Nouvelle proposition
              </Link>
            </div>

            <div className="space-y-4">
              {submissions.map(sub => {
                const threshold = sub.interest_threshold || 10
                const count = sub.interest_count || 0
                const pct = Math.min(100, (count / threshold) * 100)
                const validated = count >= threshold

                return (
                  <div key={sub.id}
                    className={`card-elevated overflow-hidden ${validated ? 'ring-2 ring-emerald-400 dark:ring-emerald-500' : ''}`}>
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="md:w-56 h-44 md:h-auto relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-500 shrink-0">
                        {sub.image_url ? (
                          <img src={sub.image_url} alt={sub.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">🎉</div>
                        )}
                        {/* Status badge */}
                        <div className="absolute top-3 left-3">
                          {validated ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/95 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                              <Icon name="check_circle" className="w-3 h-3" />
                              Validée
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                              <Icon name="pending" className="w-3 h-3" />
                              En attente
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5 flex-1 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight">
                              {sub.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <span className="inline-flex items-center gap-1">
                                <Icon name="calendar" className="w-3 h-3" />{formatDate(sub.date)}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Icon name="location" className="w-3 h-3" />{sub.venue}, {sub.city}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Icon name="ticket" className="w-3 h-3" />{sub.capacity} places
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleDelete(sub.id, sub.title)}
                              disabled={deletingId === sub.id}
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-50"
                              title="Supprimer"
                            >
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Interest progress */}
                        <div className={`rounded-xl p-3 ${validated
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50'
                            : 'bg-purple-50 dark:bg-purple-900/15 border border-purple-100 dark:border-purple-900/30'
                        }`}>
                          <div className="flex justify-between items-center text-[11px] mb-1.5">
                            <span className={`font-semibold ${validated ? 'text-emerald-700 dark:text-emerald-400' : 'text-purple-700 dark:text-purple-300'}`}>
                              {validated ? '🎯 Seuil communautaire atteint !' : 'Intérêt communautaire'}
                            </span>
                            <span className={`font-bold tabular-nums ${validated ? 'text-emerald-700 dark:text-emerald-400' : 'text-purple-700 dark:text-purple-300'}`}>
                              {count} / {threshold} soutiens
                            </span>
                          </div>
                          <div className="h-2 bg-white dark:bg-gray-800/60 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${validated
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                : 'bg-gradient-to-r from-purple-500 to-pink-400'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Team members */}
                        {sub.team_members && sub.team_members.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Icon name="users" className="w-3.5 h-3.5" />
                            <span>Équipe : {sub.team_members.map(m => m.name).filter(Boolean).join(', ')}</span>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Soumise le {new Date(sub.created_at).toLocaleDateString('fr-MA')}
                            {sub.updated_at && ` · Modifiée le ${new Date(sub.updated_at).toLocaleDateString('fr-MA')}`}
                          </span>
                          {sub.university_id && (
                            <Link to={`/universities/${sub.university_id}`}
                              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 inline-flex items-center gap-1 transition-colors">
                              Voir la page université
                              <Icon name="arrow_right" className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
