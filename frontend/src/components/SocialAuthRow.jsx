import GoogleAuthButton from './GoogleAuthButton'
import toast from 'react-hot-toast'

/* Boutons sociaux. Google est réel (si VITE_GOOGLE_CLIENT_ID est défini).
   Apple & Facebook : UI prête — à brancher avec leurs OAuth respectifs. */
export default function SocialAuthRow({ onSuccess }) {
  const soon = (name) =>
    toast(`Connexion ${name} bientôt disponible`, { icon: '🚧' })

  return (
    <div className="space-y-2.5">
      <GoogleAuthButton onSuccess={onSuccess} />

      <div className="grid grid-cols-2 gap-2.5">
        <button type="button" onClick={() => soon('Apple')}
          className="btn-secondary w-full justify-center gap-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          Apple
        </button>
        <button type="button" onClick={() => soon('Facebook')}
          className="btn-secondary w-full justify-center gap-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
            <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
          </svg>
          Facebook
        </button>
      </div>
    </div>
  )
}
