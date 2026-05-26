/**
 * City landmark SVG icons — version améliorée (symboles RÉELS des villes du Maroc).
 *
 * Chaque composant rend une silhouette détaillée du monument le plus emblématique
 * de la ville, dans un style ligne épurée + remplissage blanc (currentColor),
 * compatible avec n'importe quel fond de carte coloré.
 *
 * Usage: <CasablancaGraphic className="w-full h-full text-white" />
 */

const wrap = (children) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden
       fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
    {children}
  </svg>
)

/* ──────────────────────────────────────────────────────────
   CASABLANCA — Mosquée Hassan II (le plus haut minaret du monde)
   Élément emblématique : haut minaret carré + dôme + esplanade
────────────────────────────────────────────────────────── */
export const CasablancaGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {wrap(<>
      {/* Esplanade base */}
      <rect x="5" y="86" width="90" height="6" rx="1" />
      {/* Esplanade colonnes */}
      <rect x="10" y="80" width="2" height="6" opacity="0.5" />
      <rect x="18" y="80" width="2" height="6" opacity="0.5" />
      <rect x="26" y="80" width="2" height="6" opacity="0.5" />
      <rect x="72" y="80" width="2" height="6" opacity="0.5" />
      <rect x="80" y="80" width="2" height="6" opacity="0.5" />
      <rect x="88" y="80" width="2" height="6" opacity="0.5" />

      {/* Salle de prière (corps) */}
      <rect x="32" y="60" width="36" height="20" rx="1" />
      {/* Toits décorés */}
      <polygon points="32,60 50,52 68,60" />
      {/* Arches de la salle */}
      <path d="M38 80 V72 Q38 67 42 67 Q46 67 46 72 V80 Z" fill="rgba(0,0,0,0.18)" stroke="none"/>
      <path d="M50 80 V70 Q50 65 55 65 Q60 65 60 70 V80 Z" fill="rgba(0,0,0,0.18)" stroke="none"/>
      <path d="M64 80 V72 Q64 67 68 67 V80 Z" fill="rgba(0,0,0,0.18)" stroke="none" opacity="0.6"/>

      {/* Minaret — base */}
      <rect x="44" y="22" width="12" height="40" rx="0.5"/>
      {/* Anneaux décoratifs (zellige) */}
      <rect x="44" y="32" width="12" height="1.6" opacity="0.45"/>
      <rect x="44" y="42" width="12" height="1.6" opacity="0.45"/>
      <rect x="44" y="52" width="12" height="1.6" opacity="0.45"/>
      {/* Niches verticales du minaret */}
      <rect x="46" y="36" width="1.2" height="14" opacity="0.3"/>
      <rect x="52.8" y="36" width="1.2" height="14" opacity="0.3"/>
      {/* Plateforme du muezzin */}
      <rect x="42" y="20" width="16" height="3" rx="0.4"/>
      {/* Lanternon */}
      <rect x="46" y="14" width="8" height="6" rx="0.4"/>
      {/* Toit pyramidal */}
      <polygon points="44,14 50,6 56,14" />
      {/* Flèche / antenne / globe */}
      <circle cx="50" cy="4" r="1.5"/>
      <rect x="49.4" y="0" width="1.2" height="4"/>
    </>)}
  </div>
)

/* ──────────────────────────────────────────────────────────
   MARRAKECH — Mosquée Koutoubia (minaret rouge emblématique 12e s.)
────────────────────────────────────────────────────────── */
export const MarrakechGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {wrap(<>
      {/* Sol */}
      <rect x="0" y="92" width="100" height="3" />
      {/* Palmiers */}
      <rect x="10" y="60" width="1.4" height="32" />
      <path d="M10.7 60 Q4 56 1 50 M10.7 60 Q5 50 5 42 M10.7 60 Q12 48 10 40 M10.7 60 Q16 52 19 46 M10.7 60 Q15 58 21 56" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <rect x="88" y="65" width="1.2" height="27"/>
      <path d="M88.6 65 Q94 60 97 56 M88.6 65 Q92 58 92 52 M88.6 65 Q86 56 84 51 M88.6 65 Q83 62 79 60" stroke="currentColor" strokeWidth="1.2" fill="none"/>

      {/* Corps base du minaret carré (style almohade) */}
      <rect x="38" y="22" width="24" height="62" />
      {/* Lanternon supérieur */}
      <rect x="42" y="14" width="16" height="10" />
      {/* Toit pyramidal */}
      <polygon points="42,14 50,6 58,14" />
      {/* Boules (jamur) — empilées */}
      <circle cx="50" cy="5" r="1.5"/>
      <circle cx="50" cy="2.5" r="1.1"/>
      <rect x="49.4" y="0" width="1.2" height="2.5"/>

      {/* Crénelures (merlons) du minaret */}
      <rect x="38" y="20" width="3" height="3"/>
      <rect x="43" y="20" width="3" height="3"/>
      <rect x="48.5" y="20" width="3" height="3"/>
      <rect x="54" y="20" width="3" height="3"/>
      <rect x="59" y="20" width="3" height="3"/>

      {/* Niches lobées caractéristiques (4 par face) */}
      <path d="M42 32 Q42 28 46 28 Q50 28 50 32 V42 H42 Z" fill="rgba(0,0,0,0.22)" stroke="none"/>
      <path d="M50 32 Q50 28 54 28 Q58 28 58 32 V42 H50 Z" fill="rgba(0,0,0,0.22)" stroke="none"/>
      <path d="M42 48 Q42 44 46 44 Q50 44 50 48 V58 H42 Z" fill="rgba(0,0,0,0.22)" stroke="none"/>
      <path d="M50 48 Q50 44 54 44 Q58 44 58 48 V58 H50 Z" fill="rgba(0,0,0,0.22)" stroke="none"/>
      {/* Petites fenêtres en arc bas */}
      <path d="M44 70 Q44 67 47 67 Q50 67 50 70 V78 H44 Z" fill="rgba(0,0,0,0.22)" stroke="none"/>
      <path d="M50 70 Q50 67 53 67 Q56 67 56 70 V78 H50 Z" fill="rgba(0,0,0,0.22)" stroke="none"/>
    </>)}
  </div>
)

/* ──────────────────────────────────────────────────────────
   RABAT — Tour Hassan (minaret inachevé 12e s.) + Mausolée
────────────────────────────────────────────────────────── */
export const RabatGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {wrap(<>
      {/* Sol */}
      <rect x="0" y="92" width="100" height="3"/>

      {/* Colonnes survivantes (rangée de chapiteaux) — l'iconographie de la Tour Hassan */}
      {[12, 20, 28].map(x => (
        <g key={x}>
          <rect x={x} y="72" width="2.5" height="20"/>
          <rect x={x - 0.6} y="71" width="3.7" height="2"/>
        </g>
      ))}
      {[78, 86].map(x => (
        <g key={x}>
          <rect x={x} y="72" width="2.5" height="20"/>
          <rect x={x - 0.6} y="71" width="3.7" height="2"/>
        </g>
      ))}

      {/* Mausolée — dôme pyramidal côté droit */}
      <rect x="64" y="64" width="20" height="28"/>
      <polygon points="64,64 74,52 84,64"/>
      <rect x="68" y="68" width="3" height="8" fill="rgba(0,0,0,0.22)" stroke="none"/>
      <rect x="77" y="68" width="3" height="8" fill="rgba(0,0,0,0.22)" stroke="none"/>

      {/* Tour Hassan — minaret inachevé carré (laissé à hauteur 44m sur les 86 prévus) */}
      <rect x="38" y="32" width="22" height="60"/>
      {/* Niches lobées (caractéristique style almohade) */}
      <path d="M42 44 Q42 40 46 40 Q49 40 49 44 V54 H42 Z" fill="rgba(0,0,0,0.22)" stroke="none"/>
      <path d="M51 44 Q51 40 55 40 Q58 40 58 44 V54 H51 Z" fill="rgba(0,0,0,0.22)" stroke="none"/>
      <path d="M42 60 Q42 56 46 56 Q49 56 49 60 V70 H42 Z" fill="rgba(0,0,0,0.22)" stroke="none"/>
      <path d="M51 60 Q51 56 55 56 Q58 56 58 60 V70 H51 Z" fill="rgba(0,0,0,0.22)" stroke="none"/>
      {/* Crénelures du sommet (inachevé) */}
      <rect x="38" y="30" width="3.5" height="3"/>
      <rect x="44" y="30" width="3.5" height="3"/>
      <rect x="50" y="30" width="3.5" height="3"/>
      <rect x="56" y="30" width="3.5" height="3"/>
    </>)}
  </div>
)

/* ──────────────────────────────────────────────────────────
   AGADIR — Kasbah d'Agadir Oufella + plage + soleil
────────────────────────────────────────────────────────── */
export const AgadirGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {wrap(<>
      {/* Soleil */}
      <circle cx="78" cy="22" r="9"/>
      {/* Rayons du soleil */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
        <rect key={deg} x="77" y="6" width="2" height="5"
              transform={`rotate(${deg} 78 22)`} opacity="0.7"/>
      ))}

      {/* Montagne avec kasbah au sommet */}
      <polygon points="0,72 22,40 44,72" />
      {/* Kasbah au sommet — murailles crénelées */}
      <rect x="14" y="34" width="18" height="9"/>
      <rect x="14" y="32" width="3" height="3"/>
      <rect x="19" y="32" width="3" height="3"/>
      <rect x="24" y="32" width="3" height="3"/>
      <rect x="29" y="32" width="3" height="3"/>
      {/* Porte de la kasbah */}
      <path d="M22 43 Q22 38 24 38 Q26 38 26 43 V47 H22 Z" fill="rgba(0,0,0,0.3)" stroke="none"/>

      {/* Plage / sable */}
      <path d="M0 78 Q25 75 50 78 Q75 81 100 78 V92 H0 Z" />

      {/* Vagues */}
      <path d="M50 84 Q55 82 60 84 Q65 86 70 84 Q75 82 80 84 Q85 86 90 84" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M55 88 Q60 86 65 88 Q70 90 75 88 Q80 86 85 88 Q90 90 95 88" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5"/>

      {/* Voilier */}
      <polygon points="74,68 74,76 84,76" opacity="0.9"/>
      <rect x="73.4" y="60" width="1.2" height="16" opacity="0.9"/>
      <polygon points="74,60 74,68 80,68" opacity="0.7"/>

      {/* Mouettes */}
      <path d="M30 22 q3 -3 6 0 q3 -3 6 0" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M50 16 q2.4 -2.4 4.8 0 q2.4 -2.4 4.8 0" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </>)}
  </div>
)

/* ──────────────────────────────────────────────────────────
   FÈS — Bab Boujloud (la fameuse porte bleue de la Médina)
────────────────────────────────────────────────────────── */
export const FesGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {wrap(<>
      {/* Sol */}
      <rect x="0" y="92" width="100" height="3"/>

      {/* Tours latérales (bastions) */}
      <rect x="6" y="36" width="14" height="56"/>
      <rect x="80" y="36" width="14" height="56"/>
      {/* Crénelures tours */}
      <rect x="6" y="33" width="3" height="3"/>
      <rect x="11" y="33" width="3" height="3"/>
      <rect x="16" y="33" width="3" height="3"/>
      <rect x="80" y="33" width="3" height="3"/>
      <rect x="85" y="33" width="3" height="3"/>
      <rect x="90" y="33" width="3" height="3"/>

      {/* Corps central */}
      <rect x="20" y="46" width="60" height="46"/>

      {/* Couronnement central (arc supérieur) */}
      <path d="M20 46 Q50 18 80 46 Z" />

      {/* GRANDE ARCHE EN FER À CHEVAL (signature de Bab Boujloud) */}
      <path d="M30 92 V72 Q30 50 50 50 Q70 50 70 72 V92 Z"
            fill="rgba(0,0,0,0.32)" stroke="none"/>
      {/* Encadrement de l'arche */}
      <path d="M27 92 V72 Q27 47 50 47 Q73 47 73 72 V92"
            stroke="currentColor" strokeWidth="1.6" fill="none"/>

      {/* Rosace centrale (étoile à 8 branches caractéristique des Médersas) */}
      <g transform="translate(50 36)">
        <polygon points="0,-6 1.7,-1.7 6,0 1.7,1.7 0,6 -1.7,1.7 -6,0 -1.7,-1.7" opacity="0.85"/>
        <polygon points="0,-4.2 3,-3 4.2,0 3,3 0,4.2 -3,3 -4.2,0 -3,-3" opacity="0.55"
                 transform="rotate(22.5)"/>
      </g>

      {/* Décor zellige (carrés latéraux) */}
      <rect x="10" y="50" width="6" height="6" opacity="0.45"/>
      <rect x="10" y="60" width="6" height="6" opacity="0.35"/>
      <rect x="10" y="70" width="6" height="6" opacity="0.45"/>
      <rect x="84" y="50" width="6" height="6" opacity="0.45"/>
      <rect x="84" y="60" width="6" height="6" opacity="0.35"/>
      <rect x="84" y="70" width="6" height="6" opacity="0.45"/>
    </>)}
  </div>
)

/* ──────────────────────────────────────────────────────────
   TANGER — Cap Spartel (phare) + Détroit + voilier
────────────────────────────────────────────────────────── */
export const TangerGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {wrap(<>
      {/* Mer / horizon — vagues */}
      <path d="M0 76 Q15 73 30 76 Q45 79 60 76 Q75 73 90 76 Q100 78 100 78 V92 H0 Z" opacity="0.85"/>
      <path d="M0 82 Q15 80 30 82 Q45 84 60 82 Q75 80 90 82" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5"/>
      <path d="M0 87 Q15 85 30 87 Q45 89 60 87 Q75 85 90 87" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>

      {/* Falaise / promontoire */}
      <path d="M0 76 L0 50 Q15 48 25 60 L30 76 Z" />

      {/* Phare — base */}
      <rect x="56" y="58" width="14" height="18" />
      {/* Phare — corps cylindrique avec bandes */}
      <path d="M58 28 L68 28 L70 58 L56 58 Z"/>
      {/* Bandes blanches/noires caractéristiques */}
      <rect x="58" y="36" width="11" height="4" fill="rgba(0,0,0,0.3)" stroke="none"/>
      <rect x="58" y="44" width="11.5" height="4" fill="rgba(0,0,0,0.3)" stroke="none"/>
      <rect x="58" y="52" width="12" height="4" fill="rgba(0,0,0,0.3)" stroke="none"/>
      {/* Galerie */}
      <rect x="55" y="25" width="16" height="3.5"/>
      {/* Lanterne (cabine vitrée) */}
      <rect x="58" y="17" width="10" height="9"/>
      <rect x="59" y="19" width="2" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>
      <rect x="62.5" y="19" width="2" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>
      <rect x="65.5" y="19" width="2" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>
      {/* Toit en dôme */}
      <path d="M58 17 Q63 11 68 17 Z"/>
      <circle cx="63" cy="6" r="1.5"/>
      <rect x="62.4" y="3" width="1.2" height="3"/>

      {/* Faisceaux lumineux */}
      <path d="M68 22 L88 14" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
      <path d="M68 22 L92 22" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <path d="M68 22 L88 30" stroke="currentColor" strokeWidth="1" opacity="0.5"/>

      {/* Voilier au loin */}
      <polygon points="32,68 32,76 42,76" opacity="0.85"/>
      <rect x="31.4" y="60" width="1.2" height="16" opacity="0.85"/>
      <polygon points="32,60 32,68 38,68" opacity="0.7"/>

      {/* Mouettes */}
      <path d="M15 30 q2 -2 4 0 q2 -2 4 0" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.8"/>
      <path d="M82 38 q2 -2 4 0 q2 -2 4 0" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.7"/>
    </>)}
  </div>
)

/* ──────────────────────────────────────────────────────────
   ESSAOUIRA — Skala de la ville (remparts portugais + canons)
────────────────────────────────────────────────────────── */
export const EssaouiraGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {wrap(<>
      {/* Mer */}
      <path d="M0 74 Q10 72 20 74 Q30 76 40 74 Q50 72 60 74 Q70 76 80 74 Q90 72 100 74 V92 H0 Z" opacity="0.85"/>
      <path d="M0 80 Q15 78 30 80 Q45 82 60 80 Q75 78 90 80" stroke="currentColor" strokeWidth="1.1" fill="none" opacity="0.5"/>
      <path d="M0 86 Q15 84 30 86 Q45 88 60 86 Q75 84 90 86" stroke="currentColor" strokeWidth="0.9" fill="none" opacity="0.4"/>

      {/* Remparts (Skala) — long mur */}
      <rect x="6" y="50" width="88" height="24"/>

      {/* Crénelures du rempart */}
      {[8, 14, 20, 26, 32, 38, 44, 50, 56, 62, 68, 74, 80, 86].map(x => (
        <rect key={x} x={x} y="46" width="4" height="4"/>
      ))}

      {/* Canons posés sur le rempart (la signature d'Essaouira) */}
      {[16, 36, 56, 76].map(x => (
        <g key={x}>
          {/* Tube du canon */}
          <rect x={x} y="42" width="9" height="2.4" rx="0.5"/>
          {/* Bouche */}
          <circle cx={x + 9.5} cy="43.2" r="0.6"/>
          {/* Affût (roues) */}
          <circle cx={x + 2} cy="46.5" r="1.6"/>
          <circle cx={x + 7} cy="46.5" r="1.6"/>
        </g>
      ))}

      {/* Tour ronde à droite (bastion) */}
      <rect x="76" y="38" width="14" height="12"/>
      <path d="M76 38 Q83 32 90 38 Z"/>
      <rect x="79" y="42" width="2.5" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>
      <rect x="84.5" y="42" width="2.5" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>

      {/* Bateaux de pêche bleus (caractéristiques du port) */}
      <path d="M22 76 L20 80 L34 80 L32 76 Z" opacity="0.9"/>
      <rect x="26.4" y="68" width="1.2" height="8" opacity="0.9"/>
      <polygon points="27,68 27,76 33,76" opacity="0.7"/>

      <path d="M58 78 L56 82 L70 82 L68 78 Z" opacity="0.85"/>
      <rect x="62.4" y="72" width="1.2" height="6" opacity="0.85"/>
      <polygon points="63,72 63,78 67,78" opacity="0.65"/>

      {/* Mouettes */}
      <path d="M30 20 q2.5 -2.5 5 0 q2.5 -2.5 5 0" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M55 28 q2 -2 4 0 q2 -2 4 0" stroke="currentColor" strokeWidth="1.1" fill="none" opacity="0.85"/>
      <path d="M75 16 q1.8 -1.8 3.6 0 q1.8 -1.8 3.6 0" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.7"/>
    </>)}
  </div>
)

/* ──────────────────────────────────────────────────────────
   KÉNITRA — Kasbah de Mehdya + océan + bateau
────────────────────────────────────────────────────────── */
export const KenitraGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {wrap(<>
      {/* Eau */}
      <path d="M0 78 Q20 76 40 78 Q60 80 80 78 Q90 77 100 78 V92 H0 Z" opacity="0.85"/>
      <path d="M0 84 Q20 82 40 84 Q60 86 80 84 Q90 83 100 84" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>

      {/* Kasbah de Mehdya — bastion principal */}
      <rect x="14" y="36" width="40" height="42"/>
      {/* Crénelures */}
      {[14, 20, 26, 32, 38, 44, 50].map(x => (
        <rect key={x} x={x} y="33" width="3.5" height="3"/>
      ))}
      {/* Tour ronde gauche */}
      <rect x="10" y="44" width="8" height="34"/>
      <path d="M10 44 Q14 38 18 44 Z"/>
      {/* Tour ronde droite */}
      <rect x="50" y="40" width="10" height="38"/>
      <path d="M50 40 Q55 32 60 40 Z"/>

      {/* Porte centrale */}
      <path d="M28 78 V64 Q28 56 34 56 Q40 56 40 64 V78 Z" fill="rgba(0,0,0,0.32)" stroke="none"/>

      {/* Fenêtres */}
      <rect x="17" y="52" width="2.5" height="5" fill="rgba(0,0,0,0.28)" stroke="none"/>
      <rect x="52" y="48" width="2.5" height="5" fill="rgba(0,0,0,0.28)" stroke="none"/>
      <rect x="56" y="48" width="2.5" height="5" fill="rgba(0,0,0,0.28)" stroke="none"/>

      {/* Diplôme étudiant — toque/diplôme dans le coin (université) */}
      <g transform="translate(76 30)">
        <polygon points="0,8 -12,4 0,0 12,4" />
        <rect x="-7" y="6" width="14" height="3" opacity="0.7"/>
        <rect x="-0.4" y="9" width="0.8" height="6" opacity="0.8"/>
        <circle cx="0" cy="16" r="1.4" opacity="0.85"/>
      </g>

      {/* Bateau */}
      <path d="M72 80 L70 84 L92 84 L90 80 Z" opacity="0.9"/>
      <rect x="80" y="68" width="1.5" height="12" opacity="0.9"/>
      <polygon points="80.5,68 80.5,80 88,80" opacity="0.7"/>
    </>)}
  </div>
)

/* ──────────────────────────────────────────────────────────
   MEKNÈS — Bab Mansour (la plus belle porte d'Afrique du Nord)
────────────────────────────────────────────────────────── */
export const MeknesGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {wrap(<>
      {/* Sol */}
      <rect x="0" y="92" width="100" height="3"/>

      {/* Bastions latéraux (kiosques saillants à colonnes) */}
      <rect x="2" y="44" width="16" height="48"/>
      <rect x="82" y="44" width="16" height="48"/>
      {/* Toit pyramidal sur les bastions */}
      <polygon points="2,44 10,34 18,44"/>
      <polygon points="82,44 90,34 98,44"/>
      {/* Crénelures sur bastions */}
      <rect x="3" y="36" width="2" height="2" opacity="0.6"/>
      <rect x="15" y="36" width="2" height="2" opacity="0.6"/>
      <rect x="83" y="36" width="2" height="2" opacity="0.6"/>
      <rect x="95" y="36" width="2" height="2" opacity="0.6"/>

      {/* Petites colonnes à l'avant des bastions */}
      <rect x="6" y="56" width="1.6" height="36" opacity="0.7"/>
      <rect x="12" y="56" width="1.6" height="36" opacity="0.7"/>
      <rect x="86" y="56" width="1.6" height="36" opacity="0.7"/>
      <rect x="92" y="56" width="1.6" height="36" opacity="0.7"/>
      {/* Chapiteaux */}
      <rect x="5.4" y="54" width="2.8" height="2.5" opacity="0.7"/>
      <rect x="11.4" y="54" width="2.8" height="2.5" opacity="0.7"/>
      <rect x="85.4" y="54" width="2.8" height="2.5" opacity="0.7"/>
      <rect x="91.4" y="54" width="2.8" height="2.5" opacity="0.7"/>

      {/* Corps central de la porte */}
      <rect x="18" y="32" width="64" height="60"/>

      {/* GRANDE ARCHE EN FER À CHEVAL */}
      <path d="M30 92 V70 Q30 42 50 42 Q70 42 70 70 V92 Z"
            fill="rgba(0,0,0,0.34)" stroke="none"/>
      {/* Encadrement de l'arche (alfiz rectangulaire) */}
      <rect x="24" y="38" width="52" height="52" fill="none" stroke="currentColor" strokeWidth="1.4"/>

      {/* Inscriptions calligraphiques (frise horizontale) */}
      <rect x="22" y="34" width="56" height="3" opacity="0.45"/>
      <rect x="22" y="34" width="56" height="3" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.7"/>

      {/* Médaillons en zellige autour de l'arche */}
      <g transform="translate(28 56)">
        <polygon points="0,-3 0.85,-0.85 3,0 0.85,0.85 0,3 -0.85,0.85 -3,0 -0.85,-0.85" opacity="0.7"/>
      </g>
      <g transform="translate(72 56)">
        <polygon points="0,-3 0.85,-0.85 3,0 0.85,0.85 0,3 -0.85,0.85 -3,0 -0.85,-0.85" opacity="0.7"/>
      </g>

      {/* Couronnement (merlons en escalier au sommet) */}
      <rect x="22" y="30" width="3" height="3" opacity="0.85"/>
      <rect x="29" y="30" width="3" height="3" opacity="0.85"/>
      <rect x="36" y="30" width="3" height="3" opacity="0.85"/>
      <rect x="43" y="30" width="3" height="3" opacity="0.85"/>
      <rect x="50" y="28" width="3" height="5" opacity="0.85"/>
      <rect x="55" y="30" width="3" height="3" opacity="0.85"/>
      <rect x="62" y="30" width="3" height="3" opacity="0.85"/>
      <rect x="69" y="30" width="3" height="3" opacity="0.85"/>
      <rect x="76" y="30" width="3" height="3" opacity="0.85"/>
    </>)}
  </div>
)

/* ──────────────────────────────────────────────────────────
   OUJDA — Bab Sidi Abdelouahab (porte historique de la médina)
────────────────────────────────────────────────────────── */
export const OujdaGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {wrap(<>
      {/* Sol */}
      <rect x="0" y="92" width="100" height="3"/>

      {/* Tours latérales rondes */}
      <rect x="10" y="42" width="16" height="50"/>
      <rect x="74" y="42" width="16" height="50"/>
      <path d="M10 42 Q18 32 26 42 Z"/>
      <path d="M74 42 Q82 32 90 42 Z"/>

      {/* Crénelures tours */}
      <rect x="13" y="40" width="3" height="3" opacity="0.7"/>
      <rect x="20" y="40" width="3" height="3" opacity="0.7"/>
      <rect x="77" y="40" width="3" height="3" opacity="0.7"/>
      <rect x="84" y="40" width="3" height="3" opacity="0.7"/>

      {/* Petites fenêtres tours */}
      <rect x="15" y="60" width="2.5" height="6" fill="rgba(0,0,0,0.32)" stroke="none"/>
      <rect x="80" y="60" width="2.5" height="6" fill="rgba(0,0,0,0.32)" stroke="none"/>

      {/* Corps central de la porte */}
      <rect x="26" y="48" width="48" height="44"/>

      {/* Arche en plein cintre */}
      <path d="M36 92 V72 Q36 56 50 56 Q64 56 64 72 V92 Z" fill="rgba(0,0,0,0.34)" stroke="none"/>
      <path d="M34 92 V72 Q34 54 50 54 Q66 54 66 72 V92" stroke="currentColor" strokeWidth="1.5" fill="none"/>

      {/* Frise décorative horizontale */}
      <rect x="28" y="50" width="44" height="2.5" opacity="0.45"/>
      <rect x="28" y="50" width="44" height="2.5" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.6"/>

      {/* Étoile à 8 branches centrale au sommet */}
      <g transform="translate(50 42)">
        <polygon points="0,-5 1.4,-1.4 5,0 1.4,1.4 0,5 -1.4,1.4 -5,0 -1.4,-1.4" opacity="0.8"/>
      </g>

      {/* Merlons supérieurs en escalier */}
      <rect x="26" y="44" width="3.5" height="4" opacity="0.85"/>
      <rect x="34" y="44" width="3.5" height="4" opacity="0.85"/>
      <rect x="42" y="44" width="3.5" height="4" opacity="0.85"/>
      <rect x="50" y="44" width="3.5" height="4" opacity="0.85"/>
      <rect x="58" y="44" width="3.5" height="4" opacity="0.85"/>
      <rect x="66" y="44" width="3.5" height="4" opacity="0.85"/>
    </>)}
  </div>
)

/* ──────────────────────────────────────────────────────────
   TÉTOUAN — Médina blanche + Montagnes du Rif
────────────────────────────────────────────────────────── */
export const TetouanGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {wrap(<>
      {/* Sol */}
      <rect x="0" y="92" width="100" height="3"/>

      {/* Montagnes du Rif en arrière-plan */}
      <polygon points="0,55 18,28 36,50 50,32 64,52 82,30 100,55 100,92 0,92" opacity="0.55"/>
      {/* Neige sur les sommets */}
      <polygon points="14,33 22,33 18,28" fill="rgba(255,255,255,0.5)" stroke="none"/>
      <polygon points="46,37 54,37 50,32" fill="rgba(255,255,255,0.5)" stroke="none"/>
      <polygon points="78,35 86,35 82,30" fill="rgba(255,255,255,0.5)" stroke="none"/>

      {/* Médina blanche — maisons cubiques empilées (la "colombe blanche") */}
      {/* Rangée arrière */}
      <rect x="6"  y="60" width="14" height="32"/>
      <rect x="22" y="56" width="12" height="36"/>
      <rect x="36" y="62" width="14" height="30"/>
      <rect x="52" y="58" width="12" height="34"/>
      <rect x="66" y="64" width="14" height="28"/>
      <rect x="82" y="60" width="12" height="32"/>

      {/* Minaret central */}
      <rect x="46" y="40" width="8" height="22"/>
      <rect x="44" y="38" width="12" height="2.5"/>
      <rect x="48" y="32" width="4" height="6"/>
      <polygon points="46,32 50,26 54,32"/>
      <circle cx="50" cy="24" r="1.2"/>

      {/* Petites fenêtres (rectangles noirs) */}
      <rect x="9" y="68" width="2.5" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>
      <rect x="14" y="68" width="2.5" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>
      <rect x="25" y="64" width="2.5" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>
      <rect x="29" y="64" width="2.5" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>
      <rect x="39" y="70" width="2.5" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>
      <rect x="44" y="70" width="2.5" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>
      <rect x="55" y="66" width="2.5" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>
      <rect x="59" y="66" width="2.5" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>
      <rect x="69" y="72" width="2.5" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>
      <rect x="74" y="72" width="2.5" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>
      <rect x="85" y="68" width="2.5" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>
      <rect x="89" y="68" width="2.5" height="5" fill="rgba(0,0,0,0.3)" stroke="none"/>

      {/* Petites portes */}
      <rect x="10" y="80" width="3.5" height="8" fill="rgba(0,0,0,0.32)" stroke="none"/>
      <rect x="40" y="82" width="3.5" height="8" fill="rgba(0,0,0,0.32)" stroke="none"/>
      <rect x="70" y="84" width="3.5" height="6" fill="rgba(0,0,0,0.32)" stroke="none"/>
      <rect x="86" y="82" width="3.5" height="8" fill="rgba(0,0,0,0.32)" stroke="none"/>
    </>)}
  </div>
)

/* ──────────────────────────────────────────────────────────
   EXPORT MAP — utilisé dans Home.jsx
────────────────────────────────────────────────────────── */
export const CITY_GRAPHICS = {
  Casablanca: CasablancaGraphic,
  Marrakech:  MarrakechGraphic,
  Rabat:      RabatGraphic,
  Agadir:     AgadirGraphic,
  Fès:        FesGraphic,
  Tanger:     TangerGraphic,
  Essaouira:  EssaouiraGraphic,
  Kénitra:    KenitraGraphic,
  Meknès:     MeknesGraphic,
  Oujda:      OujdaGraphic,
  Tétouan:    TetouanGraphic,
}
