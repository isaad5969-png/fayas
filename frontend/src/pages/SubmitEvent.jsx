import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/Icons'
import RevenueCalculator from '../components/RevenueCalculator'
import EventTemplates from '../components/EventTemplates'
import TeamMembers from '../components/TeamMembers'
import toast from 'react-hot-toast'

const EVENT_TYPES = [
  { value: 'conference', label: '🎤 Conférence',    desc: 'Table ronde, TEDx, conférence académique…' },
  { value: 'gala',       label: '✨ Gala',           desc: 'Soirée de gala, cérémonie officielle…' },
  { value: 'soiree',     label: '🌙 Soirée',        desc: 'Soirée festive, club, rooftop…' },
  { value: 'universite', label: '🎓 Universitaire',  desc: 'Cérémonie de fin d\'année, remise de diplômes…' },
  { value: 'concert',    label: '🎵 Concert',        desc: 'Concert, live, festival…' },
  { value: 'autre',      label: '🎉 Autre',           desc: 'Tout autre type d\'événement…' },
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
  const [selectedTemplateId, setSelectedTemplateId] = useState(null)
  const [fixedCost, setFixedCost] = useState('')
  const [teamMembers, setTeamMembers] = useState([])
  const [logoUploadMode, setLogoUploadMode] = useState('file') // 'file' | 'url'

  const [form, setForm] = useState({
    title: '',
    type: 'conference',
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
    contact_email: '',
    contact_phone: '',
    website: '',
    facebook: '',
    instagram: '',
    address: '',
  })

  const handleLogoFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop lourde — max 5 Mo')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setImagePreview(dataUrl)
      setForm(f => ({ ...f, image_url: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const applyTemplate = (template) => {
    setSelectedTemplateId(template.id)
    setForm(f => ({
      ...f,
      type: template.fields.type,
      time: template.fields.time,
      price_standard: String(template.fields.price_standard),
      price_vip: String(template.fields.price_vip),
      capacity: String(template.fields.capacity),
      dress_code: template.fields.dress_code,
      description: template.fields.description,
    }))
    toast.success(`Modèle « ${template.name} » appliqué ✨`, { duration: 1800 })
    // Scroll to form smoothly
    setTimeout(() => {
      document.getElementById('form-start')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 200)
  }

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
        team_members: teamMembers.filter(m => m.name?.trim() || m.email?.trim()),
        contact_email: form.contact_email || '',
        contact_phone: form.contact_phone || '',
        website: form.website || '',
        facebook: form.facebook || '',
        instagram: form.instagram || '',
        address: form.address || '',
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

      {/* ── Templates carousel ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="card p-6 mb-8 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-gray-900 border-purple-100 dark:border-purple-900/30">
          <EventTemplates onSelect={applyTemplate} selectedId={selectedTemplateId} accentColor={uniColor} />
        </div>
      </div>

      {/* ── Form + Calculator (2 columns) ── */}
      <div id="form-start" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 grid lg:grid-cols-3 gap-8">
        <form onSubmit={submit} className="lg:col-span-2 space-y-6">

          {selectedTemplateId && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded-r-xl p-4 flex items-start gap-3">
              <Icon name="sparkles" className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">
                  Modèle appliqué — modifiez librement les champs pré-remplis
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedTemplateId(null)}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-0.5"
                >
                  Démarrer de zéro
                </button>
              </div>
            </div>
          )}

          {/* Section: Infos principales */}
          <div className="card-section section-enter" style={{ animationDelay: '0ms' }}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: uniColor }}>1</span>
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
                    className={`flex flex-col gap-1 p-3 rounded-xl border-2 cursor-pointer
                                transition-all duration-200 ease-out
                                ${form.type === t.value
                                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm shadow-purple-500/20 scale-[1.02]'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 hover:scale-[1.01]'
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
          <div className="card-section section-enter" style={{ animationDelay: '60ms' }}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: uniColor }}>2</span>
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
          <div className="card-section section-enter" style={{ animationDelay: '120ms' }}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: uniColor }}>3</span>
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

            <FieldRow label="Frais fixes estimés (MAD)" hint="Location de salle, traiteur, son, sécurité… (optionnel — utilisé pour calculer le point mort)">
              <div className="relative">
                <input
                  name="fixed_cost" type="number" min="0" step="100"
                  className="input pl-10"
                  placeholder="0"
                  value={fixedCost} onChange={e => setFixedCost(e.target.value)}
                />
                <Icon name="building" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </FieldRow>
          </div>

          {/* Section: Équipe (co-organisateurs) */}
          <div className="card-section section-enter" style={{ animationDelay: '180ms' }}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: uniColor }}>4</span>
              Co-organisateurs
            </h2>
            <TeamMembers members={teamMembers} onChange={setTeamMembers} accentColor={uniColor} />
          </div>

          {/* Section: Logo & Visuel */}
          <div className="card-section section-enter" style={{ animationDelay: '240ms' }}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: uniColor }}>5</span>
              Logo &amp; Visuel de l'événement
            </h2>

            {/* Mode toggle */}
            <div className="flex gap-2">
              {[['file', 'Télécharger un fichier'], ['url', 'Lien URL']].map(([mode, label]) => (
                <button key={mode} type="button"
                  onClick={() => setLogoUploadMode(mode)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                    logoUploadMode === mode
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-purple-200'
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {logoUploadMode === 'file' ? (
              <div>
                <label
                  htmlFor="logo-upload"
                  className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all p-8
                    ${imagePreview
                      ? 'border-purple-400 dark:border-purple-600 bg-purple-50/50 dark:bg-purple-900/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/30 dark:hover:bg-purple-900/10'
                    }`}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Logo aperçu"
                      className="max-h-40 rounded-xl object-contain shadow"
                      onError={() => setImagePreview('')}
                    />
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Icon name="image" className="w-7 h-7 text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cliquez pour choisir un logo</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, WEBP — max 5 Mo</p>
                      </div>
                    </>
                  )}
                  <input id="logo-upload" type="file" accept="image/*" className="sr-only" onChange={handleLogoFile} />
                </label>
                {imagePreview && (
                  <button type="button" onClick={() => { setImagePreview(''); setForm(f => ({ ...f, image_url: '' })) }}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 hover:underline">
                    Supprimer le logo
                  </button>
                )}
              </div>
            ) : (
              <FieldRow label="URL de l'image" hint="Collez un lien Unsplash, Cloudinary, etc.">
                <input
                  name="image_url" type="url"
                  className="input"
                  placeholder="https://images.unsplash.com/…"
                  value={form.image_url}
                  onChange={e => { handle(e); setImagePreview(e.target.value) }}
                />
                {imagePreview && (
                  <div className="mt-3 relative rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800">
                    <img src={imagePreview} alt="Aperçu"
                      className="w-full h-full object-cover"
                      onError={() => setImagePreview('')}
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">Aperçu</div>
                  </div>
                )}
              </FieldRow>
            )}
          </div>

          {/* Section: Coordonnées & Contacts */}
          <div className="card-section section-enter" style={{ animationDelay: '300ms' }}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: uniColor }}>6</span>
              Coordonnées &amp; Contacts
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <FieldRow label="Email de contact" hint="Visible sur la page de l'événement">
                <div className="relative">
                  <input name="contact_email" type="email" className="input pl-10"
                    placeholder="contact@monasso.ma"
                    value={form.contact_email} onChange={handle} />
                  <Icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </FieldRow>

              <FieldRow label="Téléphone / WhatsApp">
                <div className="relative">
                  <input name="contact_phone" type="tel" className="input pl-10"
                    placeholder="+212 6XX XXX XXX"
                    value={form.contact_phone} onChange={handle} />
                  <Icon name="phone" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </FieldRow>
            </div>

            <FieldRow label="Adresse complète" hint="Numéro, rue, quartier, ville">
              <div className="relative">
                <input name="address" className="input pl-10"
                  placeholder="Ex: 12 Rue Mohammed V, Hay Riad, Rabat"
                  value={form.address} onChange={handle} />
                <Icon name="location" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </FieldRow>

            <div className="grid sm:grid-cols-3 gap-4">
              <FieldRow label="Site web">
                <div className="relative">
                  <input name="website" type="url" className="input pl-10"
                    placeholder="https://mon-evenement.ma"
                    value={form.website} onChange={handle} />
                  <Icon name="globe" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </FieldRow>

              <FieldRow label="Page Facebook">
                <input name="facebook" className="input"
                  placeholder="facebook.com/monpage"
                  value={form.facebook} onChange={handle} />
              </FieldRow>

              <FieldRow label="Instagram">
                <input name="instagram" className="input"
                  placeholder="@moncompte"
                  value={form.instagram} onChange={handle} />
              </FieldRow>
            </div>
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

        {/* ── Sidebar : Calculateur revenus ── */}
        <aside className="lg:col-span-1 space-y-6">
          <RevenueCalculator
            priceStandard={form.price_standard}
            priceVip={form.price_vip}
            capacity={form.capacity}
            fixedCost={fixedCost}
            accentColor={uniColor}
          />

          {/* Tips pour organisateurs */}
          <div className="card p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <Icon name="bolt" className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm">Conseils d'organisateurs</h3>
            </div>
            <ul className="space-y-2 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Visez 70-80% de remplissage pour un événement rentable</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Lancez la promo 4-6 semaines avant la date</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Une option VIP augmente le revenu moyen de 30-40%</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Activez les intérêts communautaires pour valider la demande</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
