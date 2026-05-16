import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const GOOGLE_SCRIPT_ID = 'google-identity-services'

function loadGoogleScript() {
  if (document.getElementById(GOOGLE_SCRIPT_ID)) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default function GoogleAuthButton({ onSuccess }) {
  const ref = useRef(null)
  const { googleLogin } = useAuth()
  const [ready, setReady] = useState(false)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!clientId) return
    let cancelled = false

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google || !ref.current) return

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            try {
              const user = await googleLogin(credential)
              toast.success(`Bienvenue, ${user.name.split(' ')[0]} !`)
              onSuccess?.(user)
            } catch (err) {
              toast.error(err.response?.data?.error || 'Connexion Google impossible')
            }
          },
        })

        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'continue_with',
          width: ref.current.offsetWidth || 320,
        })
        setReady(true)
      })
      .catch(() => toast.error('Impossible de charger Google'))

    return () => { cancelled = true }
  }, [clientId, googleLogin, onSuccess])

  if (!clientId) {
    return (
      <button
        type="button"
        onClick={() => toast.error('Ajoutez VITE_GOOGLE_CLIENT_ID pour activer Google')}
        className="btn-secondary w-full justify-center"
      >
        Continuer avec Google
      </button>
    )
  }

  return (
    <div className="min-h-[44px]">
      <div ref={ref} className="w-full" />
      {!ready && <div className="sk-btn w-full" />}
    </div>
  )
}
