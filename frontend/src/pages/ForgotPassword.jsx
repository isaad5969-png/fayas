import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icons'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [demoInfo, setDemoInfo] = useState(null)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      setSent(true)
      if (data.demo_url) setDemoInfo(data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Une erreur est survenue')
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
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {sent ? 'Email envoyé !' : 'Mot de passe oublié'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {sent
              ? 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.'
              : 'Entrez votre email pour recevoir un lien de réinitialisation.'}
          </p>
        </div>

        <div className="card p-8">
          {!sent ? (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="label">Adresse email</label>
                <input
                  type="email" required className="input"
                  placeholder="vous@exemple.ma"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Icon name="check_circle" className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Si l'adresse <strong>{email}</strong> est associée à un compte Fayas, vous recevrez un email dans quelques minutes.
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">
                Pensez à vérifier vos spams. Le lien expire dans 1 heure.
              </p>

              {/* Mode démo : affiche le lien directement */}
              {demoInfo && (
                <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left">
                  <p className="text-amber-800 dark:text-amber-300 text-xs font-semibold mb-2">
                    Mode démo — aucun email configuré :
                  </p>
                  <a
                    href={demoInfo.demo_url}
                    className="text-purple-600 dark:text-purple-400 text-xs underline break-all"
                  >
                    {demoInfo.demo_url}
                  </a>
                </div>
              )}

              <button
                onClick={() => { setSent(false); setDemoInfo(null) }}
                className="btn-secondary w-full mt-2"
              >
                Renvoyer un lien
              </button>
            </div>
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
