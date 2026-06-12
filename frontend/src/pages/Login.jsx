import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SocialAuthRow from '../components/SocialAuthRow'
import PhoneAuthPanel from '../components/PhoneAuthPanel'
import { Icon } from '../components/Icons'
import toast from 'react-hot-toast'

const METHODS = [
  { id: 'email', label: 'Email',     icon: 'mail'  },
  { id: 'phone', label: 'Téléphone', icon: 'phone' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const [method, setMethod] = useState('email')
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const goAfterAuth = (user) => navigate(user.role === 'admin' ? '/admin' : from)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Bienvenue, ${user.name.split(' ')[0]} ! 👋`)
      goAfterAuth(user)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 dark:from-gray-950 to-white dark:to-gray-900 flex items-center justify-center px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-purple-900/40">
            <Icon name="ticket" className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Connexion</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Accédez à votre espace Fayas</p>
        </div>

        <div className="card p-8">
          {/* Sélecteur de méthode */}
          <div className="grid grid-cols-2 gap-1 p-1 mb-6 rounded-xl bg-gray-100 dark:bg-white/[0.04]">
            {METHODS.map(m => (
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

          {method === 'email' ? (
            <>
              {/* Démo admin */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-3 mb-6 text-sm text-purple-700 dark:text-purple-300">
                <strong>Démo admin :</strong> admin@billetterie.ma / Admin123!
              </div>

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="label">Adresse email</label>
                  <div className="relative">
                    <Icon name="mail" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="email" type="email" required className="input pl-10" placeholder="vous@exemple.ma"
                      value={form.email} onChange={handle} autoComplete="email" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="label !mb-0">Mot de passe</label>
                    <Link to="/forgot-password"
                      className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Icon name="lock" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="password" type={showPass ? 'text' : 'password'} required className="input pl-10 pr-12"
                      placeholder="••••••••" value={form.password} onChange={handle} autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <Icon name={showPass ? 'eye_off' : 'eye'} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>
            </>
          ) : (
            <PhoneAuthPanel onSuccess={goAfterAuth} />
          )}

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
            <span className="text-xs font-semibold uppercase text-gray-400">ou</span>
            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
          </div>

          <SocialAuthRow onSuccess={goAfterAuth} />

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300">
              S'inscrire gratuitement
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
