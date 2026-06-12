import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SocialAuthRow from '../components/SocialAuthRow'
import PhoneAuthPanel from '../components/PhoneAuthPanel'
import { Icon } from '../components/Icons'
import api from '../api/axios'
import toast from 'react-hot-toast'

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

function getPasswordStrength(pwd) {
  if (!pwd) return null
  const hasLower   = /[a-z]/.test(pwd)
  const hasUpper   = /[A-Z]/.test(pwd)
  const hasDigit   = /[0-9]/.test(pwd)
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd)
  const types = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length

  if (pwd.length < 6)               return { bars: 1, label: 'Trop court',  color: 'bg-red-500' }
  if (pwd.length < 8 || types < 2)  return { bars: 1, label: 'Faible',      color: 'bg-red-500' }
  if (pwd.length < 10 || types < 3) return { bars: 2, label: 'Moyen',       color: 'bg-yellow-500' }
  if (types < 4)                    return { bars: 3, label: 'Fort',         color: 'bg-green-500' }
  return                                   { bars: 4, label: 'Très fort',   color: 'bg-emerald-500' }
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const [method, setMethod] = useState('email')

  const [universities, setUniversities] = useState([])
  const [uniLoading, setUniLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', university_id: '' })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [touched, setTouched] = useState({})

  useEffect(() => {
    api.get('/universities')
      .then(r => setUniversities(r.data))
      .catch(() => {})
      .finally(() => setUniLoading(false))
  }, [])

  const uniByShortName = Object.fromEntries(universities.map(u => [u.short_name, u]))

  const handle = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setTouched(t => ({ ...t, [e.target.name]: true }))
  }

  const strength = getPasswordStrength(form.password)
  const passwordMismatch = touched.confirmPassword && confirmPassword && form.password !== confirmPassword

  const submit = async e => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (form.password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    setLoading(true)
    try {
      const user = await register(form)
      toast.success(`Compte créé ! Bienvenue, ${user.name.split(' ')[0]} ! 🎉`)
      navigate(from)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

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
          {/* Sélecteur de méthode */}
          <div className="grid grid-cols-2 gap-1 p-1 mb-6 rounded-xl bg-gray-100 dark:bg-white/[0.04]">
            {[
              { id: 'email', label: 'Email',     icon: 'mail'  },
              { id: 'phone', label: 'Téléphone', icon: 'phone' },
            ].map(m => (
              <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  method === m.id
                    ? 'bg-white dark:bg-white/[0.08] text-purple-700 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}>
                <Icon name={m.icon} className="w-4 h-4" /> {m.label}
              </button>
            ))}
          </div>

          {method === 'phone' ? (
            <PhoneAuthPanel onSuccess={() => navigate(from)} withName />
          ) : (
          <form onSubmit={submit} className="space-y-5">

            {/* Nom */}
            <div>
              <label className="label">Nom complet *</label>
              <input
                name="name" required className="input"
                placeholder="Votre prénom et nom"
                value={form.name} onChange={handle}
              />
              {touched.name && form.name.trim().length > 0 && form.name.trim().length < 2 && (
                <p className="text-xs text-red-500 mt-1">Nom trop court (2 caractères min.)</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="label">Adresse email *</label>
              <input
                name="email" type="email" required className="input"
                placeholder="vous@exemple.ma"
                value={form.email} onChange={handle}
              />
            </div>

            {/* Mot de passe + force */}
            <div>
              <label className="label">Mot de passe * (min. 6 caractères)</label>
              <div className="relative">
                <input
                  name="password" type={showPass ? 'text' : 'password'} required
                  className="input pr-12" placeholder="••••••••"
                  value={form.password} onChange={handle}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <Icon name={showPass ? 'eye_off' : 'eye'} className="w-4 h-4" />
                </button>
              </div>

              {/* Barre de force du mot de passe */}
              {strength && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 mb-1">
                    {[1,2,3,4].map(i => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.bars ? strength.color : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength.bars === 1 ? 'text-red-500' :
                    strength.bars === 2 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {strength.label}
                    {strength.bars < 3 && (
                      <span className="font-normal text-gray-400 dark:text-gray-500"> — ajoutez majuscules, chiffres ou symboles</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Confirmer le mot de passe */}
            <div>
              <label className="label">Confirmer le mot de passe *</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPass ? 'text' : 'password'} required
                  className={`input pr-12 ${passwordMismatch ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value)
                    setTouched(t => ({ ...t, confirmPassword: true }))
                  }}
                />
                <button type="button" onClick={() => setShowConfirmPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <Icon name={showConfirmPass ? 'eye_off' : 'eye'} className="w-4 h-4" />
                </button>
              </div>
              {passwordMismatch && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <Icon name="x" className="w-3 h-3" /> Les mots de passe ne correspondent pas
                </p>
              )}
              {touched.confirmPassword && confirmPassword && !passwordMismatch && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Icon name="check_circle" className="w-3 h-3" /> Mots de passe identiques
                </p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="label">Téléphone (optionnel)</label>
              <input
                name="phone" type="tel" className="input"
                placeholder="+212 6 00 00 00 00"
                value={form.phone} onChange={handle}
              />
            </div>

            {/* Université */}
            <div>
              <label className="label flex items-center justify-between">
                <span>Université (si vous êtes étudiant)</span>
                {uniLoading && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-normal animate-pulse">Chargement…</span>
                )}
              </label>
              <select
                name="university_id"
                className="input dark:bg-gray-800"
                value={form.university_id}
                onChange={handle}
              >
                <option value="">— Non étudiant / Autre —</option>
                {STATIC_GROUPS.map(group => {
                  const options = group.keys.map(key => uniByShortName[key]).filter(Boolean)
                  if (options.length === 0) return null
                  return (
                    <optgroup key={group.label} label={group.label}>
                      {options.map(u => (
                        <option key={u.id} value={u.id}>{u.name} — {u.city}</option>
                      ))}
                    </optgroup>
                  )
                })}
                {(() => {
                  const knownKeys = STATIC_GROUPS.flatMap(g => g.keys)
                  const others = universities.filter(u => !knownKeys.includes(u.short_name))
                  if (others.length === 0) return null
                  return (
                    <optgroup label="Autres établissements">
                      {others.map(u => (
                        <option key={u.id} value={u.id}>{u.name} — {u.city}</option>
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
          )}

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
            <span className="text-xs font-semibold uppercase text-gray-400">ou</span>
            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
          </div>

          <SocialAuthRow onSuccess={() => navigate(from)} />

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
