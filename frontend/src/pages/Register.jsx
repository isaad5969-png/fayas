import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [universities, setUniversities] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', university_id: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    api.get('/universities').then(r => setUniversities(r.data))
  }, [])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 dark:from-gray-950 to-white dark:to-gray-900 flex items-center justify-center px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-purple-900/40">
            <span className="text-2xl">🎉</span>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Téléphone (optionnel)</label>
              <input name="phone" type="tel" className="input" placeholder="+212 6 00 00 00 00"
                value={form.phone} onChange={handle} />
            </div>
            <div>
              <label className="label">Université (si vous êtes étudiant)</label>
              <select name="university_id" className="input dark:bg-gray-800" value={form.university_id} onChange={handle}>
                <option value="">— Non étudiant / Autre —</option>
                {universities.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.city})</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>

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
