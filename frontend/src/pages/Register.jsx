import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GoogleAuthButton from '../components/GoogleAuthButton'
import { Icon } from '../components/Icons'
import api from '../api/axios'
import toast from 'react-hot-toast'

/* Universities grouped by category — shown instantly before API responds */
const STATIC_GROUPS = [
  {
    label: 'Universités Publiques',
    keys: ['UM5','UH2C','UCA','USMBA','UIT','UIZ','UAE','UMI','UH1','UM1','UCD','USMS','UAQ'],
  },
  {
    label: 'Grandes Écoles & Instituts',
    keys: ['EMI','ENSIAS','INPT','INSEA','EHTP','IAV','ISCAE','HEM','ENCG-CASA','ENCG-FES'],
  },
  {
    label: 'Universités Privées',
    keys: ['UIR','UM6P','UAA','UIC','UEMF','UPM','MUNDIAPOLIS'],
  },
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [universities, setUniversities] = useState([])
  const [uniLoading, setUniLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', university_id: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    api.get('/universities')
      .then(r => setUniversities(r.data))
      .catch(() => {}) // silently fallback to empty — options already grouped statically
      .finally(() => setUniLoading(false))
  }, [])

  /* Build a lookup map: short_name → university object */
  const uniByShortName = Object.fromEntries(universities.map(u => [u.short_name, u]))

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    setLoading(true)
    try {
      const user = await register(form)
      toast.success(`Compte créé ! Bienvenue, ${user.name.split(' ')[0]} ! 🎉`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = () => navigate('/')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 dark:from-gray-950 to-white dark:to-gray-900 flex items-center justify-center px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-purple-900/40">
            <Icon name="sparkles" className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Créer un compte</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Rejoignez Fayas gratuitement</p>
        </div>

        <div className="card p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Nom complet *</label>
              <input name="name" required className="input" placeholder="Votre prénom et nom"
                value={form.name} onChange={handle} />
            </div>
            <div>
              <label className="label">Adresse email *</label>
              <input name="email" type="email" required className="input" placeholder="vous@exemple.ma"
                value={form.email} onChange={handle} />
            </div>
            <div>
              <label className="label">Mot de passe * (min. 6 caractères)</label>
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'} required className="input pr-12"
                  placeholder="••••••••" value={form.password} onChange={handle} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <Icon name={showPass ? 'eye_off' : 'eye'} className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="label">Téléphone (optionnel)</label>
              <input name="phone" type="tel" className="input" placeholder="+212 6 00 00 00 00"
                value={form.phone} onChange={handle} />
            </div>

            {/* ── University dropdown ── */}
            <div>
              <label className="label flex items-center justify-between">
                <span>Université (si vous êtes étudiant)</span>
                {uniLoading && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-normal animate-pulse">
                    Chargement…
                  </span>
                )}
              </label>
              <select
                name="university_id"
                className="input dark:bg-gray-800"
                value={form.university_id}
                onChange={handle}
              >
                <option value="">— Non étudiant / Autre —</option>

                {/* Grouped by category using <optgroup> */}
                {STATIC_GROUPS.map(group => {
                  /* Collect universities for this group that exist in API response */
                  const options = group.keys
                    .map(key => uniByShortName[key])
                    .filter(Boolean)

                  if (options.length === 0) return null
                  return (
                    <optgroup key={group.label} label={group.label}>
                      {options.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.city}
                        </option>
                      ))}
                    </optgroup>
                  )
                })}

                {/* Any university not in static groups (future additions) */}
                {(() => {
                  const knownKeys = STATIC_GROUPS.flatMap(g => g.keys)
                  const others = universities.filter(u => !knownKeys.includes(u.short_name))
                  if (others.length === 0) return null
                  return (
                    <optgroup label="Autres établissements">
                      {others.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.city}
                        </option>
                      ))}
                    </optgroup>
                  )
                })()}
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
            <span className="text-xs font-semibold uppercase text-gray-400">ou</span>
            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
          </div>

          <GoogleAuthButton onSuccess={handleGoogleSuccess} />

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
