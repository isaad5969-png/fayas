import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icons'
import api from '../api/axios'
import toast from 'react-hot-toast'

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

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const strength = getPasswordStrength(form.password)
  const mismatch = form.confirm && form.password !== form.confirm

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Lien de réinitialisation invalide.</p>
          <Link to="/forgot-password" className="btn-primary">Faire une nouvelle demande</Link>
        </div>
      </div>
    )
  }

  const submit = async e => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password: form.password })
      setSuccess(true)
      toast.success('Mot de passe modifié avec succès !')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 dark:from-gray-950 to-white dark:to-gray-900 flex items-center justify-center px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-purple-900/40">
            <Icon name="lock" className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Nouveau mot de passe</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Choisissez un mot de passe sécurisé</p>
        </div>

        <div className="card p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Icon name="check_circle" className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">Mot de passe modifié !</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Redirection vers la connexion…</p>
              <Link to="/login" className="btn-primary w-full block text-center">Se connecter</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              {/* Nouveau mot de passe */}
              <div>
                <label className="label">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} required
                    className="input pr-12" placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <Icon name={showPass ? 'eye_off' : 'eye'} className="w-4 h-4" />
                  </button>
                </div>
                {strength && (
                  <div className="mt-2">
                    <div className="flex gap-1 h-1.5 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.bars ? strength.color : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      strength.bars === 1 ? 'text-red-500' :
                      strength.bars === 2 ? 'text-yellow-600' : 'text-green-600'
                    }`}>{strength.label}</p>
                  </div>
                )}
              </div>

              {/* Confirmer */}
              <div>
                <label className="label">Confirmer le mot de passe</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'} required
                    className={`input pr-12 ${mismatch ? 'border-red-400 focus:ring-red-400' : ''}`}
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <Icon name={showConfirm ? 'eye_off' : 'eye'} className="w-4 h-4" />
                  </button>
                </div>
                {mismatch && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <Icon name="x" className="w-3 h-3" /> Les mots de passe ne correspondent pas
                  </p>
                )}
                {form.confirm && !mismatch && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Icon name="check_circle" className="w-3 h-3" /> Mots de passe identiques
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe'}
              </button>
            </form>
          )}

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
            <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 flex items-center justify-center gap-1">
              <Icon name="arrow_right" className="w-3 h-3 rotate-180" /> Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
