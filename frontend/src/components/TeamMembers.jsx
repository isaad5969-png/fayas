import { Icon } from './Icons'

/**
 * Composant pour gérer l'équipe d'organisation (co-organisateurs).
 * Permet d'inviter jusqu'à 4 co-organisateurs avec un rôle chacun.
 *
 * Props:
 *   - members: array of { name, email, role }
 *   - onChange: callback(newMembers)
 *   - accentColor: pour le badge de rôle
 */

export const TEAM_ROLES = [
  { id: 'lead',      label: 'Lead',         icon: '🎯', desc: 'Coordinateur général', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { id: 'treasurer', label: 'Trésorier',    icon: '💰', desc: 'Budget & finances',     color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { id: 'comm',      label: 'Comm',         icon: '📣', desc: 'Promo & réseaux',       color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  { id: 'logistics', label: 'Logistique',   icon: '🚚', desc: 'Lieu, son, sécurité',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { id: 'creative',  label: 'Créa',         icon: '🎨', desc: 'Design & déco',         color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
]

const MAX_MEMBERS = 4

export default function TeamMembers({ members = [], onChange, accentColor = '#7C3AED' }) {
  const addMember = () => {
    if (members.length >= MAX_MEMBERS) return
    onChange([...members, { name: '', email: '', role: 'comm' }])
  }

  const updateMember = (idx, field, value) => {
    const next = [...members]
    next[idx] = { ...next[idx], [field]: value }
    onChange(next)
  }

  const removeMember = (idx) => {
    onChange(members.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
            <Icon name="users" className="w-4 h-4" style={{ color: accentColor }} />
            Équipe d'organisation
            <span className="text-xs font-normal text-gray-400 dark:text-gray-500">(optionnel)</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Invitez jusqu'à {MAX_MEMBERS} co-organisateurs avec un rôle chacun.
          </p>
        </div>
        {members.length < MAX_MEMBERS && (
          <button
            type="button"
            onClick={addMember}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm hover:scale-105 active:scale-95 transition-all"
            style={{ backgroundColor: accentColor }}
          >
            <Icon name="plus_circle" className="w-3.5 h-3.5" />
            Ajouter
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-5 text-center">
          <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15` }}>
            <Icon name="users" className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Organiser un événement seul, c'est dur. Constituez une équipe !
          </p>
          <button
            type="button"
            onClick={addMember}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-purple-700 dark:text-purple-300 border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all"
          >
            <Icon name="plus_circle" className="w-3.5 h-3.5" />
            Ajouter un co-organisateur
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((m, idx) => {
            const role = TEAM_ROLES.find(r => r.id === m.role) || TEAM_ROLES[0]
            return (
              <div key={idx} className="card p-4 border-2 border-gray-100 dark:border-gray-800">
                <div className="flex items-start gap-3">
                  {/* Avatar with role icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${role.color} shrink-0`}>
                    {role.icon}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Prénom Nom"
                        value={m.name}
                        onChange={e => updateMember(idx, 'name', e.target.value)}
                        className="input text-sm py-2"
                      />
                      <input
                        type="email"
                        placeholder="email@univ.ma"
                        value={m.email}
                        onChange={e => updateMember(idx, 'email', e.target.value)}
                        className="input text-sm py-2"
                      />
                    </div>

                    {/* Role selector */}
                    <div className="flex flex-wrap gap-1.5">
                      {TEAM_ROLES.map(r => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => updateMember(idx, 'role', r.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                            m.role === r.id
                              ? r.color + ' ring-2 ring-current ring-offset-1 dark:ring-offset-gray-900'
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          title={r.desc}
                        >
                          <span>{r.icon}</span>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeMember(idx)}
                    aria-label="Retirer ce membre"
                    className="text-gray-400 hover:text-rose-500 transition-colors shrink-0 p-1"
                  >
                    <Icon name="x" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}

          {members.length < MAX_MEMBERS && (
            <button
              type="button"
              onClick={addMember}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-700 dark:hover:text-purple-300 transition-all"
            >
              + Ajouter un autre co-organisateur ({members.length}/{MAX_MEMBERS})
            </button>
          )}
        </div>
      )}
    </div>
  )
}
