import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Icon } from './Icons'
import toast from 'react-hot-toast'

export default function PhoneAuthPanel({ onSuccess, withName = false }) {
  const { requestPhoneOtp, verifyPhoneOtp } = useAuth()
  const [step, setStep]       = useState('phone') // 'phone' | 'code'
  const [phone, setPhone]     = useState('+212 ')
  const [name, setName]       = useState('')
  const [code, setCode]       = useState('')
  const [demoCode, setDemoCode] = useState(null)
  const [loading, setLoading] = useState(false)

  const sendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await requestPhoneOtp(phone)
      setDemoCode(data.demo_code || null)
      setStep('code')
      toast.success('Code envoyé par SMS')
    } catch (err) {
      toast.error(err.response?.data?.error || "Impossible d'envoyer le code")
    } finally {
      setLoading(false)
    }
  }

  const verify = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await verifyPhoneOtp(phone, code, name)
      toast.success(`Bienvenue, ${user.name.split(' ')[0]} ! 👋`)
      onSuccess?.(user)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Code incorrect')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'phone') {
    return (
      <form onSubmit={sendCode} className="space-y-5">
        {withName && (
          <div>
            <label className="label">Nom complet</label>
            <input className="input" placeholder="Votre prénom et nom"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
        )}
        <div>
          <label className="label">Numéro de téléphone</label>
          <div className="relative">
            <Icon name="phone" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel" required className="input pl-10" placeholder="+212 6 00 00 00 00"
              value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel"
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
            Un code de vérification à 6 chiffres vous sera envoyé.
          </p>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Envoi…' : 'Recevoir le code'}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={verify} className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Icon name="check_circle" className="w-4 h-4 text-green-500" />
        Code envoyé au <span className="font-semibold text-gray-700 dark:text-gray-200">{phone.trim()}</span>
      </div>

      {demoCode && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-3 text-sm text-purple-700 dark:text-purple-300">
          <strong>Mode démo</strong> — votre code : <span className="font-mono font-bold tracking-widest">{demoCode}</span>
        </div>
      )}

      <div>
        <label className="label">Code de vérification</label>
        <input
          inputMode="numeric" autoComplete="one-time-code" maxLength={6} required autoFocus
          className="input text-center font-mono text-2xl tracking-[0.5em]"
          placeholder="••••••"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />
      </div>

      <button type="submit" disabled={loading || code.length < 6} className="btn-primary w-full">
        {loading ? 'Vérification…' : 'Vérifier & continuer'}
      </button>

      <div className="flex items-center justify-between text-xs">
        <button type="button" onClick={() => { setStep('phone'); setCode(''); setDemoCode(null) }}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium inline-flex items-center gap-1">
          <Icon name="arrow_right" className="w-3 h-3 rotate-180" /> Changer de numéro
        </button>
        <button type="button" onClick={sendCode} disabled={loading}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
          Renvoyer le code
        </button>
      </div>
    </form>
  )
}
