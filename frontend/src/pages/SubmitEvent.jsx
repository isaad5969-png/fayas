import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/Icons'
import toast from 'react-hot-toast'

const EVENT_TYPES = [
  { value: 'soiree',     label: '🌙 Soirée',       desc: 'Soirée festive, club, rooftop…' },
  { value: 'concert',    label: '🎵 Concert',       desc: 'Concert, live, festival…' },
  { value: 'universite', label: '🎓 Universitaire', desc: 'Gala étudiant, cérémonie de fin d\'année…' },
  { value: 'gala',       label: '✨ Gala',           desc: 'Soirée de gala, cérémonie officielle…' },
  { value: 'autre',      label: '🎉 Autre',          desc: 'Tout autre type d\'événement…' },
]

const MOROCCAN_CITIES = [
  'Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès','Oujda',
  'Kénitra','Tétouan','Salé','Mohammedia','El Jadida','Béni Mellal','Settat',
  'Nador','Khémisset','Laâyoune','Khouribga','Berrechid','Essaouira','Ifrane',
  'Ben Guerir','Al Hoceima','Larache',
]

function FieldRow({ label, required, children, hint }) {
  return (
    <div>
      <label className="label flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}

export default function SubmitEvent() {
  const { id } = useParams()           // university id
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [university, setUniversity] = useState(null)
  const [uniLoading, setUniLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState('')

  const [form, setForm] = useState({
    title: '',
    type: 'universite',
    venue: '',
    city: '',
    date: '',
    time: '20:00',
    price_standard: '',
    price_vip: '',
    capacity: '',
    description: '',
    dress_code: '',
    image_url: '',
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour proposer un événement')
      navigate(`/login`)
    }
  }, [isAuthenticated, navigate])

  // Load university info
  useEffect(() => {
    api.get(`/universities/${id}/events`)
      .then(r => {
        setUniversity(r.data.university)
        // Pre-fill city from university
        setForm(f => ({ ...f, city: r.data.university?.city || '' }))
      })
      .catch(() => navigate('/universities'))
      .finally(() => setUniLoading(false))
  }, [id, navigate])

  const handle = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (name === 'image_url') setImagePreview(value)
  }

  const submit = async e => {
    e.preventDefault()

    // Validation
    if (!form.title.trim())       return toast.error('Le titre est requis')
    if (!form.venue.trim())       return toast.error('Le lieu est requis')
    if (!form.city)               return toast.error('La ville est requise')
    if (!form.date)               return toast.error('La date est requise')
    if (!form.price_standard)     return toast.error('Le prix standard est requis')
    if (!form.capacity)           return toast.error('La capacité est requise')
    if (!form.description.trim()) return toast.error('La description est requise')

    setSubmitting(true)
    try {
      await api.post('/events/submit', {
        ...form,
        university_id: id,
        price_standard: Number(form.price_standard),
        price_vip: Number(form.price_vip) || 0,
        capacity: Number(form.capacity),
      })
      toast.success('Événement soumis avec succès ! En attente de validation. 🎉')
      navigate(`/universities/${id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  if (uniLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const uniColor = university?.color || '#7C3AED'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

      {/* ── Hero ── */}
      <div className="relative py-14 text-white overflow-hidden" style={{ backgroundColor: uniColor }}>
        <div className="absolute inset-0 opacity-[0.07] text-[18rem] flex items-center justify-center select-none pointer-events-none leading-none">
          🎓
        </div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/4" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-up">
          <Link to={`/universities/${id}`}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            ← Retour aux événements
          </Link>

          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-xl font-extrabold shrink-0 border border-white/30">
              {university?.short_name?.slice(0, 2)}
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium">{university?.name}</p>
              <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
                Proposer un événement
              </h1>
            </div>
          </div>
          <p className="text-white/70 text-sm max-w-xl">
            Remplissez ce formulaire pour soumettre votre événement. Il sera examiné par notre équipe avant publication.
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={submit} className="space-y-6">

          {/* Section: Infos principales */}
          <div className="card p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: uniColor }}>1</span>
              Informations principales
            </h2>

            <FieldRow label="Titre de l'événement" required>
              <input
                name="title" required
                className="input"
                placeholder="Ex: Gala de fin d'année 2026"
                value={form.title} onChange={handle}
              />
            </FieldRow>

            <FieldRow label="Type d'événement" required>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EVENT_TYPES.map(t => (
                  <label key={t.value}
                    className={`flex flex-col gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      form.type === t.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700'
                    }`}>
                    <input type="radio" name="type" value={t.value}
                      checked={form.type === t.value} onChange={handle} className="sr-only" />
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{t.label}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">{t.desc}</span>
                  </label>
                ))}
              </div>
            </FieldRow>

            <FieldRow label="Description" required hint="Décrivez l'ambiance, le programme, les artistes, etc.">
              <textarea
                name="description" required rows={4}
                className="input resize-none"
                placeholder="Une soirée inoubliable…"
                value={form.description} onChange={handle}
              />
            </FieldRow>
          </div>

          {/* Section: Lieu & Date */}
          <div className="card p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: uniColor }}>2</span>
              Lieu &amp; Date
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <FieldRow label="Lieu / Venue" required>
                <input
                  name="venue" required
                  className="input"
                  placeholder="Ex: Sofitel Casablanca"
                  value={form.venue} onChange={handle}
                />
              </FieldRow>

              <FieldRow label="Ville" required>
                <select name="city" required className="input dark:bg-gray-800" value={form.city} onChange={handle}>
                  <option value="">— Choisir une ville —</option>
                  {MOROCCAN_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FieldRow>

              <FieldRow label="Date" required>
                <input
                  name="date" type="date" required
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.date} onChange={handle}
                />
              </FieldRow>

              <FieldRow label="Heure de début" required>
                <input
                  name="time" type="time" required
                  className="input"
                  value={form.time} onChange={handle}
                />
              </FieldRow>
            </div>

            <FieldRow label="Dress code" hint="Optionnel — ex: Smart casual, Black tie…">
              <input
                name="dress_code"
                className="input"
                placeholder="Ex: Smart casual"
                value={form.dress_code} onChange={handle}
              />
            </FieldRow>
          </div>

          {/* Section: Billets */}
          <div className="card p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: uniColor }}>3</span>
              Billets &amp; Tarifs
            </h2>

            <div className="grid sm:grid-cols-3 gap-4">
              <FieldRow label="Prix Standard (MAD)" required>
                <input
                  name="price_standard" type="number" required min="0" step="1"
                  className="input"
                  placeholder="150"
                  value={form.price_standard} onChange={handle}
                />
              </FieldRow>

              <FieldRow label="Prix VIP (MAD)" hint="0 = pas de VIP">
                <input
                  name="price_vip" type="number" min="0" step="1"
                  className="input"
                  placeholder="0"
                  value={form.price_vip} onChange={handle}
                />
              </FieldRow>

              <FieldRow label="Capacité (places)" required>
                <input
                  name="capacity" type="number" required min="1" step="1"
                  className="input"
                  placeholder="300"
                  value={form.capacity} onChange={handle}
                />
              </FieldRow>
            </div>
          </div>

          {/* Section: Photo */}
          <div className="card p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: uniColor }}>4</span>
              Photo de l'événement
            </h2>

            <FieldRow label="URL de la photo" hint="Collez l'URL d'une image (Unsplash, etc.) — optionnel">
              <input
                name="image_url" type="url"
                className="input"
                placeholder="https://images.unsplash.com/…"
                value={form.image_url} onChange={handle}
              />
            </FieldRow>

            {/* Live preview */}
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800">
                <img
                  src={imagePreview} alt="Aperçu"
                  className="w-full h-full object-cover"
                  onError={() => setImagePreview('')}
                />
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                  Aperçu
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 aspect-video flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-600">
                <Icon name="image" className="w-10 h-10 opacity-40" />
                <p className="text-sm">L'aperçu apparaîtra ici</p>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to={`/universities/${id}`}
              className="btn-secondary flex-1 text-center justify-center">
              Annuler
            </Link>
            <button type="submit" disabled={submitting}
              className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed">
              <Icon name={submitting ? 'clock' : 'send'} className="w-4 h-4" />
              {submitting ? 'Envoi en cours…' : 'Soumettre l\'événement'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Votre événement sera examiné par l'équipe Fayas avant d'être publié.
          </p>
        </form>
      </div>
    </div>
  )
}
