import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Bienvenue, ${user.name.split(' ')[0]} ! 👋`)
      navigate(user.role === 'admin' ? '/admin' : from)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎫</div>
          <h1 className="text-2xl font-extrabold text-gray-900">Connexion</h1>
          <p className="text-gray-500 mt-2">Accédez à votre espace BilletterieMa</p>
        </div>

        <div className="card p-8">
          {/* Demo hint */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-6 text-sm text-purple-700">
            <strong>Démo admin:</strong> admin@billetterie.ma / Admin123!
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Adresse email</label>
              <input name="email" type="email" required className="input" placeholder="vous@exemple.ma"
                value={form.email} onChange={handle} />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'} required className="input pr-12"
                  placeholder="••••••••" value={form.password} onChange={handle} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-purple-600 font-semibold hover:text-purple-700">
              S'inscrire gratuitement
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
