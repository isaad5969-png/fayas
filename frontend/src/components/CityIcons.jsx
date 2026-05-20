/**
 * Custom SVG landmark illustrations for each Moroccan city
 * Used in the "Explorez par ville" bento grid on the Home page.
 */

/* ── Casablanca — Hassan II Mosque ── */
export const CasablancaIcon = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className} aria-hidden>
    {/* Minaret shaft */}
    <rect x="27" y="4" width="10" height="44" rx="1.5" />
    {/* Minaret decorative bands */}
    <rect x="27" y="14" width="10" height="2"  opacity="0.35" />
    <rect x="27" y="24" width="10" height="2"  opacity="0.35" />
    <rect x="27" y="34" width="10" height="2"  opacity="0.35" />
    {/* Minaret pointed crown */}
    <path d="M26 4 Q32 0 38 4Z" />
    {/* Star at tip */}
    <circle cx="32" cy="1.5" r="2" />
    {/* Main dome */}
    <path d="M10 48 Q32 31 54 48Z" />
    {/* Building body */}
    <rect x="10" y="48" width="44" height="14" rx="2" />
    {/* 3 Moorish arch windows */}
    <path d="M15 62 L15 54 Q19 50 23 54 L23 62" fill="rgba(0,0,0,0.22)" />
    <path d="M28 62 L28 54 Q32 50 36 54 L36 62" fill="rgba(0,0,0,0.22)" />
    <path d="M41 62 L41 54 Q45 50 49 54 L49 62" fill="rgba(0,0,0,0.22)" />
  </svg>
)

/* ── Marrakech — Koutoubia Minaret + Palm Trees ── */
export const MarrakechIcon = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className} aria-hidden>
    {/* Central minaret */}
    <rect x="25" y="3" width="14" height="52" rx="1.5" />
    {/* Decorative bands */}
    <rect x="25" y="13" width="14" height="2.5" opacity="0.3" />
    <rect x="25" y="24" width="14" height="2.5" opacity="0.3" />
    <rect x="25" y="35" width="14" height="2.5" opacity="0.3" />
    {/* Crown lantern */}
    <rect x="28" y="0" width="8" height="5" rx="1.5" />
    {/* Base step */}
    <rect x="18" y="55" width="28" height="7" rx="2" />
    {/* Left palm trunk */}
    <rect x="4" y="38" width="3" height="24" rx="2" />
    {/* Left palm fronds */}
    <path d="M5.5 40 C2 33 -1 31 -3 27"  stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M5.5 40 C9 31 14 30 17 26"  stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M5.5 40 C0 37 -3 36 -5 34"  stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* Right palm trunk */}
    <rect x="57" y="40" width="3" height="22" rx="2" />
    {/* Right palm fronds */}
    <path d="M58.5 42 C55 35 51 33 49 29" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M58.5 42 C62 33 66 32 68 28" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M58.5 42 C63 39 67 38 70 36" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </svg>
)

/* ── Rabat — Hassan Tower ── */
export const RabatIcon = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className} aria-hidden>
    {/* Main tower */}
    <rect x="18" y="8" width="28" height="48" rx="2" />
    {/* Battlements (crenellations) */}
    <rect x="18" y="3" width="6" height="7" rx="1" />
    <rect x="27" y="3" width="6" height="7" rx="1" />
    <rect x="36" y="3" width="6" height="7" rx="1" />
    {/* Arch niches row 1 */}
    <path d="M23 28 L23 20 Q26 17 29 20 L29 28" fill="rgba(0,0,0,0.25)" />
    <path d="M35 28 L35 20 Q38 17 41 20 L41 28" fill="rgba(0,0,0,0.25)" />
    {/* Arch niches row 2 */}
    <path d="M23 44 L23 36 Q26 33 29 36 L29 44" fill="rgba(0,0,0,0.25)" />
    <path d="M35 44 L35 36 Q38 33 41 36 L41 44" fill="rgba(0,0,0,0.25)" />
    {/* Flanking column ruins */}
    <rect x="5"  y="38" width="8" height="22" rx="2" opacity="0.7" />
    <rect x="51" y="38" width="8" height="22" rx="2" opacity="0.7" />
    {/* Ground platform */}
    <rect x="0" y="58" width="64" height="6" rx="2" />
  </svg>
)

/* ── Agadir — Sun + Waves + Beach ── */
export const AgadirIcon = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className} aria-hidden>
    {/* Sun */}
    <circle cx="32" cy="20" r="11" />
    {/* Rays */}
    <line x1="32" y1="3"  x2="32" y2="7"  stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <line x1="46" y1="6"  x2="43" y2="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <line x1="52" y1="20" x2="48" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <line x1="46" y1="34" x2="43" y2="30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <line x1="18" y1="34" x2="21" y2="30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <line x1="12" y1="20" x2="16" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <line x1="18" y1="6"  x2="21" y2="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    {/* Waves */}
    <path d="M2 44 Q10 38 18 44 Q26 50 34 44 Q42 38 50 44 Q58 50 62 46"
          stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M2 52 Q10 46 18 52 Q26 58 34 52 Q42 46 50 52 Q58 58 62 54"
          stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* Beach */}
    <path d="M0 58 Q16 54 32 58 Q48 62 64 58 L64 64 L0 64Z" />
  </svg>
)

/* ── Fès — Bab Bou Jeloud (Blue Gate) ── */
export const FèsIcon = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className} aria-hidden>
    {/* Left tower */}
    <rect x="2"  y="22" width="15" height="40" rx="2" />
    {/* Right tower */}
    <rect x="47" y="22" width="15" height="40" rx="2" />
    {/* Central pointed arch */}
    <path d="M17 62 L17 36 Q32 13 47 36 L47 62Z" />
    {/* Hollow arch */}
    <path d="M21 62 L21 38 Q32 20 43 38 L43 62Z" fill="rgba(0,0,0,0.28)" />
    {/* Battlements left */}
    <rect x="2"  y="16" width="5" height="8" rx="1" />
    <rect x="9"  y="16" width="5" height="8" rx="1" />
    <rect x="16" y="16" width="4" height="8" rx="1" />
    {/* Battlements right */}
    <rect x="47" y="16" width="5" height="8" rx="1" />
    <rect x="54" y="16" width="5" height="8" rx="1" />
    <rect x="60" y="16" width="4" height="8" rx="1" />
    {/* Top cornice band */}
    <rect x="0" y="18" width="64" height="5" rx="1" />
    {/* Side arch windows */}
    <path d="M5 50 L5 42 Q9.5 37 14 42 L14 50"  fill="rgba(0,0,0,0.22)" />
    <path d="M50 50 L50 42 Q54.5 37 59 42 L59 50" fill="rgba(0,0,0,0.22)" />
    {/* Star ornament above arch */}
    <polygon points="32,14 33.5,18 38,18 34.5,20.5 36,25 32,22.5 28,25 29.5,20.5 26,18 30.5,18"
             opacity="0.25" />
  </svg>
)

/* ── Tanger — Lighthouse ── */
export const TangerIcon = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className} aria-hidden>
    {/* Lighthouse body (tapered) */}
    <path d="M22 60 L25 24 L39 24 L42 60Z" />
    {/* Red/white stripe */}
    <rect x="22" y="46" width="20" height="5" rx="1" opacity="0.35" />
    {/* Lantern room */}
    <rect x="23" y="14" width="18" height="12" rx="2" />
    {/* Roof */}
    <path d="M21 14 Q32 7 43 14Z" />
    {/* Light */}
    <circle cx="32" cy="20" r="3.5" opacity="0.55" />
    {/* Light beams */}
    <line x1="43" y1="16" x2="58" y2="7"  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
    <line x1="43" y1="21" x2="61" y2="21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
    {/* Door */}
    <path d="M28 60 L28 52 Q32 48 36 52 L36 60" fill="rgba(0,0,0,0.22)" />
    {/* Waves */}
    <path d="M2 52 Q10 46 18 52 Q26 58 32 52 Q38 46 46 52 Q54 58 62 52"
          stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M2 60 Q10 55 18 60 Q26 65 32 60 Q38 55 46 60 Q54 65 62 60"
          stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
)

/* ── Essaouira — Sailing Boat ── */
export const EssaouiraIcon = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className} aria-hidden>
    {/* Hull */}
    <path d="M8 52 Q10 62 32 64 Q54 62 56 52 L48 46 L16 46Z" />
    {/* Mast */}
    <rect x="30" y="10" width="4" height="38" rx="1" />
    {/* Main sail (right side) */}
    <path d="M34 12 L54 42 L34 42Z" />
    {/* Jib sail (left side) */}
    <path d="M30 12 L10 40 L30 42Z" />
    {/* Flag */}
    <path d="M34 10 L46 6 L34 14Z" opacity="0.75" />
    {/* Porthole */}
    <circle cx="22" cy="52" r="3" fill="rgba(0,0,0,0.22)" />
    {/* Rope coil suggestion */}
    <circle cx="42" cy="52" r="3" fill="rgba(0,0,0,0.2)" />
    {/* Waves */}
    <path d="M2 56 Q10 51 18 56 Q26 61 32 56 Q38 51 46 56 Q54 61 62 56"
          stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
)

/* ── Kénitra — Graduation Cap ── */
export const KénitraIcon = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className} aria-hidden>
    {/* Mortarboard diamond */}
    <path d="M8 26 L32 14 L56 26 L32 38Z" />
    {/* Cap board */}
    <rect x="24" y="14" width="16" height="14" rx="1.5" />
    {/* Tassel string up */}
    <line x1="32" y1="14" x2="32" y2="6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    {/* Tassel ball */}
    <circle cx="32" cy="5" r="4" />
    {/* Side tassel hanging */}
    <line x1="56" y1="26" x2="56" y2="38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M52 38 Q56 44 60 38" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M50 42 Q56 48 62 42" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Diploma scroll */}
    <rect x="16" y="50" width="32" height="12" rx="6" />
    <line x1="23" y1="55" x2="41" y2="55" stroke="rgba(0,0,0,0.25)" strokeWidth="2" strokeLinecap="round" />
    <line x1="23" y1="58" x2="37" y2="58" stroke="rgba(0,0,0,0.25)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="32" cy="56" r="3" fill="rgba(0,0,0,0.2)" />
  </svg>
)

/* ── Meknès — Bab Mansour Gate ── */
export const MeknèsIcon = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className} aria-hidden>
    {/* Central main arch */}
    <path d="M16 62 L16 34 Q32 10 48 34 L48 62Z" />
    {/* Hollow arch */}
    <path d="M21 62 L21 37 Q32 18 43 37 L43 62Z" fill="rgba(0,0,0,0.28)" />
    {/* Left flanking column */}
    <rect x="3"  y="28" width="11" height="34" rx="2" />
    {/* Right flanking column */}
    <rect x="50" y="28" width="11" height="34" rx="2" />
    {/* Column capitals */}
    <rect x="0"  y="22" width="17" height="7" rx="2" />
    <rect x="47" y="22" width="17" height="7" rx="2" />
    {/* Top cornice */}
    <rect x="0" y="16" width="64" height="8" rx="2" />
    {/* Geometric star / zellige ornament */}
    <polygon points="32,14 33.8,18.5 38.5,18.5 35,21.5 36.8,26 32,23.2 27.2,26 29,21.5 25.5,18.5 30.2,18.5"
             opacity="0.28" />
    {/* Arch voussoir shadow */}
    <path d="M16 34 Q32 12 48 34" stroke="rgba(0,0,0,0.18)" strokeWidth="3" fill="none" />
  </svg>
)

/* ── Oujda — Musical Notes ── */
export const OujdaIcon = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className} aria-hidden>
    {/* Note 1 — head */}
    <ellipse cx="15" cy="52" rx="10" ry="7" transform="rotate(-15 15 52)" />
    {/* Note 1 — stem */}
    <rect x="23" y="18" width="4" height="36" rx="2" />
    {/* Note 1 — flag */}
    <path d="M27 18 Q46 13 42 28 Q38 42 27 36" />
    {/* Note 2 — head */}
    <ellipse cx="45" cy="56" rx="9" ry="6.5" transform="rotate(-15 45 56)" />
    {/* Note 2 — stem */}
    <rect x="52" y="24" width="4" height="34" rx="2" />
    {/* Note 2 — flag */}
    <path d="M56 24 Q62 20 60 33 Q58 44 56 40" />
    {/* Stars */}
    <circle cx="10" cy="14" r="3" />
    <circle cx="40" cy="7"  r="2.5" />
    <circle cx="58" cy="12" r="2" />
  </svg>
)

/* ── Tétouan — Mountain Peaks + White Medina ── */
export const TétouanIcon = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className} aria-hidden>
    {/* Back mountain left */}
    <path d="M0 62 L18 28 L36 62Z" opacity="0.55" />
    {/* Back mountain right */}
    <path d="M28 62 L46 28 L64 62Z" opacity="0.55" />
    {/* Main center mountain */}
    <path d="M8 62 L32 7 L56 62Z" />
    {/* Snow cap */}
    <path d="M26 21 L32 7 L38 21 Q32 27 26 21Z" fill="rgba(255,255,255,0.45)" />
    {/* White medina buildings */}
    <rect x="12" y="54" width="8"  height="10" rx="1.5" fill="rgba(255,255,255,0.5)" />
    <rect x="22" y="51" width="7"  height="13" rx="1.5" fill="rgba(255,255,255,0.5)" />
    <rect x="35" y="52" width="9"  height="12" rx="1.5" fill="rgba(255,255,255,0.5)" />
    <rect x="46" y="54" width="8"  height="10" rx="1.5" fill="rgba(255,255,255,0.5)" />
    {/* Minaret */}
    <rect x="30" y="44" width="4" height="9" fill="rgba(255,255,255,0.65)" />
    {/* Ground line */}
    <rect x="0" y="60" width="64" height="4" />
  </svg>
)

/* ── Central registry ── */
export const CITY_ICONS = {
  Casablanca: CasablancaIcon,
  Marrakech:  MarrakechIcon,
  Rabat:      RabatIcon,
  Agadir:     AgadirIcon,
  Fès:        FèsIcon,
  Tanger:     TangerIcon,
  Essaouira:  EssaouiraIcon,
  Kénitra:    KénitraIcon,
  Meknès:     MeknèsIcon,
  Oujda:      OujdaIcon,
  Tétouan:    TétouanIcon,
}
