import { Icon } from './Icons'

/**
 * Templates d'événements préconfigurés pour les étudiants organisateurs.
 * Chaque template pré-remplit le formulaire avec des valeurs typiques.
 */
export const EVENT_TEMPLATES = [
  {
    id: 'gala-fin-annee',
    icon: 'sparkles',
    emoji: '✨',
    name: 'Gala de fin d\'année',
    tagline: 'L\'événement phare de l\'année',
    gradient: 'from-purple-600 via-purple-800 to-indigo-900',
    accent: '#7C3AED',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
    duration: '4-6h',
    typical_capacity: '300-500',
    fields: {
      type: 'universite',
      time: '19:30',
      price_standard: 250,
      price_vip: 500,
      capacity: 400,
      dress_code: 'Black tie / Tenue de soirée',
      description: 'La soirée de fin d\'année la plus attendue ! Rejoignez-nous pour une nuit inoubliable : dîner gastronomique, remise de diplômes symbolique, DJ set jusqu\'au bout de la nuit. Un moment d\'exception pour célébrer ensemble la fin de cette année académique.',
    },
  },
  {
    id: 'soiree-integration',
    icon: 'users',
    emoji: '🎉',
    name: 'Soirée d\'intégration',
    tagline: 'Accueille les nouveaux',
    gradient: 'from-pink-500 via-rose-600 to-red-700',
    accent: '#E11D48',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    duration: '3-5h',
    typical_capacity: '150-300',
    fields: {
      type: 'soiree',
      time: '21:00',
      price_standard: 100,
      price_vip: 0,
      capacity: 250,
      dress_code: 'Smart casual',
      description: 'La soirée pour faire connaissance ! Idéale pour les nouveaux étudiants qui veulent rencontrer leur promo, créer des amitiés et lancer l\'année académique du bon pied. Ambiance festive garantie avec animations et jeux brise-glace.',
    },
  },
  {
    id: 'tedx',
    icon: 'bolt',
    emoji: '💡',
    name: 'Conférence TEDx',
    tagline: 'Idées qui méritent d\'être partagées',
    gradient: 'from-red-600 via-orange-600 to-amber-600',
    accent: '#EA580C',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    duration: '4-6h',
    typical_capacity: '100-300',
    fields: {
      type: 'autre',
      time: '14:00',
      price_standard: 80,
      price_vip: 200,
      capacity: 200,
      dress_code: 'Business casual',
      description: 'Une journée de conférences inspirantes par des speakers d\'exception. Découvrez des idées innovantes, des parcours inspirants, et participez à des échanges enrichissants. Networking, démonstrations et surprises au programme.',
    },
  },
  {
    id: 'tournoi-sportif',
    icon: 'award',
    emoji: '⚽',
    name: 'Tournoi sportif',
    tagline: 'Compétition inter-promo',
    gradient: 'from-emerald-600 via-teal-700 to-cyan-800',
    accent: '#0D9488',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    duration: 'Journée',
    typical_capacity: '200-500',
    fields: {
      type: 'autre',
      time: '09:00',
      price_standard: 50,
      price_vip: 0,
      capacity: 300,
      dress_code: 'Tenue sportive',
      description: 'Le grand tournoi inter-promotions de l\'année ! Football, basket, volley… Constituez vos équipes et venez défendre les couleurs de votre filière. Trophées, médailles et après-tournoi festif au programme.',
    },
  },
  {
    id: 'open-mic',
    icon: 'music',
    emoji: '🎤',
    name: 'Open Mic / Soirée artistique',
    tagline: 'La scène est à vous',
    gradient: 'from-indigo-600 via-purple-700 to-pink-700',
    accent: '#7C3AED',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80',
    duration: '3-4h',
    typical_capacity: '80-150',
    fields: {
      type: 'concert',
      time: '20:00',
      price_standard: 50,
      price_vip: 0,
      capacity: 120,
      dress_code: 'Free spirit',
      description: 'Une scène ouverte à tous les talents : musique, slam, stand-up, danse, théâtre… Venez performer ou simplement profiter ! Ambiance intimiste, jus et thé à volonté, vibes communautaires garanties.',
    },
  },
  {
    id: 'journee-carriere',
    icon: 'rocket',
    emoji: '💼',
    name: 'Journée Carrière',
    tagline: 'Forum recrutement & networking',
    gradient: 'from-blue-700 via-indigo-700 to-purple-800',
    accent: '#3730A3',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    duration: 'Journée',
    typical_capacity: '200-800',
    fields: {
      type: 'universite',
      time: '09:00',
      price_standard: 0,
      price_vip: 0,
      capacity: 500,
      dress_code: 'Business formal',
      description: 'Rencontrez les entreprises qui recrutent dans votre secteur ! Stands de recrutement, ateliers CV/LinkedIn, conférences sur les métiers, simulations d\'entretien. Apportez plusieurs CV. Inscription gratuite.',
    },
  },
]

export default function EventTemplates({ onSelect, selectedId, accentColor = '#7C3AED' }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: accentColor }}>★</div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Démarrez avec un modèle
        </h2>
        <span className="text-xs text-gray-400 dark:text-gray-500 italic">— ou créez de zéro</span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Choisissez un modèle adapté à votre événement et le formulaire se pré-remplira automatiquement avec les valeurs typiques.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {EVENT_TEMPLATES.map(tpl => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onSelect(tpl)}
            className={`group relative text-left rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              selectedId === tpl.id
                ? 'border-purple-500 shadow-lg shadow-purple-500/20 scale-[1.02]'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
            }`}
          >
            {/* Photo header */}
            <div className={`relative h-24 bg-gradient-to-br ${tpl.gradient} overflow-hidden`}>
              {tpl.image && (
                <img
                  src={tpl.image}
                  alt={tpl.name}
                  loading="lazy"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                  className="absolute inset-0 w-full h-full object-cover
                             group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              )}
              {/* Dark scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
              {/* Sheen */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                              transition-transform duration-[1.2s] ease-out pointer-events-none
                              bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              {selectedId === tpl.id && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg z-10">
                  <Icon name="check" className="w-3.5 h-3.5 text-purple-600" strokeWidth={3} />
                </div>
              )}
              <div className="absolute bottom-2 left-3 z-10 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <Icon name={tpl.icon} className="w-4 h-4 text-white drop-shadow" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-3 bg-white dark:bg-gray-900">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight mb-1">
                {tpl.name}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mb-2">
                {tpl.tagline}
              </p>
              <div className="flex gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{tpl.duration}</span>
                <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{tpl.typical_capacity}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
