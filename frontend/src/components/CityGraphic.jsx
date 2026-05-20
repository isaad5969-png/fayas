/**
 * Pure-CSS city landmark graphics — no SVG, no images.
 * Each component uses absolutely-positioned divs, clip-path, and border-radius.
 * All shapes are white so they work on any gradient card background.
 */

/* tiny helper */
const S = ({ style, op = 1 }) => (
  <div
    className="absolute bg-white"
    style={{ opacity: op, ...style }}
  />
)

/* ─────────────────────────────────────────
   CASABLANCA — Hassan II Mosque
───────────────────────────────────────── */
export const CasablancaGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {/* minaret shaft */}
    <S style={{ left:'42%', top:'5%', width:'16%', height:'54%', borderRadius:'2px 2px 0 0' }} />
    {/* minaret decorative rings */}
    <S style={{ left:'42%', top:'18%', width:'16%', height:'3%' }} op={0.35} />
    <S style={{ left:'42%', top:'30%', width:'16%', height:'3%' }} op={0.35} />
    <S style={{ left:'42%', top:'42%', width:'16%', height:'3%' }} op={0.35} />
    {/* minaret pointed crown */}
    <S style={{ left:'37%', top:'0', width:'26%', height:'8%', clipPath:'polygon(50% 0%,0% 100%,100% 100%)' }} />
    {/* dome */}
    <S style={{ left:'12%', top:'56%', width:'76%', height:'22%', borderRadius:'50% 50% 0 0 / 100% 100% 0 0' }} />
    {/* building base */}
    <S style={{ left:'12%', top:'74%', width:'76%', height:'21%', borderRadius:'0 0 3px 3px' }} />
    {/* arch windows */}
    <S style={{ left:'17%', top:'79%', width:'14%', height:'16%', clipPath:'polygon(50% 0%,0% 100%,100% 100%)', borderRadius:'0' }} op={0.22} />
    <S style={{ left:'43%', top:'79%', width:'14%', height:'16%', clipPath:'polygon(50% 0%,0% 100%,100% 100%)' }} op={0.22} />
    <S style={{ left:'69%', top:'79%', width:'14%', height:'16%', clipPath:'polygon(50% 0%,0% 100%,100% 100%)' }} op={0.22} />
  </div>
)

/* ─────────────────────────────────────────
   MARRAKECH — Koutoubia + Palm Trees
───────────────────────────────────────── */
export const MarrakechGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {/* minaret tower */}
    <S style={{ left:'37%', top:'3%', width:'26%', height:'76%', borderRadius:'2px 2px 0 0' }} />
    {/* decorative bands */}
    <S style={{ left:'37%', top:'20%', width:'26%', height:'3.5%' }} op={0.28} />
    <S style={{ left:'37%', top:'36%', width:'26%', height:'3.5%' }} op={0.28} />
    <S style={{ left:'37%', top:'52%', width:'26%', height:'3.5%' }} op={0.28} />
    {/* crown */}
    <S style={{ left:'43%', top:'0', width:'14%', height:'5%', borderRadius:'2px 2px 0 0' }} />
    {/* base step */}
    <S style={{ left:'26%', top:'76%', width:'48%', height:'10%', borderRadius:'2px' }} />
    {/* Left palm trunk */}
    <S style={{ left:'5%', top:'50%', width:'4%', height:'44%', borderRadius:'3px', transform:'rotate(-4deg)' }} />
    {/* Left fronds (rotated thin rectangles) */}
    <S style={{ left:'0%', top:'42%', width:'18%', height:'3.5%', borderRadius:'3px', transform:'rotate(-30deg)', transformOrigin:'right center' }} op={0.9} />
    <S style={{ left:'0%', top:'46%', width:'20%', height:'3.5%', borderRadius:'3px', transform:'rotate(15deg)',  transformOrigin:'right center' }} op={0.9} />
    <S style={{ left:'-2%', top:'50%', width:'14%', height:'3.5%', borderRadius:'3px', transform:'rotate(-55deg)', transformOrigin:'right center' }} op={0.9} />
    {/* Right palm trunk */}
    <S style={{ left:'91%', top:'52%', width:'4%', height:'42%', borderRadius:'3px', transform:'rotate(4deg)' }} />
    {/* Right fronds */}
    <S style={{ left:'82%', top:'44%', width:'18%', height:'3.5%', borderRadius:'3px', transform:'rotate(28deg)', transformOrigin:'left center' }} op={0.9} />
    <S style={{ left:'80%', top:'49%', width:'20%', height:'3.5%', borderRadius:'3px', transform:'rotate(-12deg)', transformOrigin:'left center' }} op={0.9} />
    <S style={{ left:'88%', top:'52%', width:'14%', height:'3.5%', borderRadius:'3px', transform:'rotate(55deg)', transformOrigin:'left center' }} op={0.9} />
  </div>
)

/* ─────────────────────────────────────────
   RABAT — Hassan Tower
───────────────────────────────────────── */
export const RabatGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {/* main tower */}
    <S style={{ left:'21%', top:'8%', width:'58%', height:'76%', borderRadius:'2px' }} />
    {/* battlements (crenellations) — cut notches from top using dark overlay */}
    <S style={{ left:'25%', top:'3%', width:'10%', height:'9%', borderRadius:'1px' }} />
    <S style={{ left:'39%', top:'3%', width:'10%', height:'9%', borderRadius:'1px' }} />
    <S style={{ left:'53%', top:'3%', width:'10%', height:'9%', borderRadius:'1px' }} />
    <S style={{ left:'67%', top:'3%', width:'10%', height:'9%', borderRadius:'1px' }} />
    {/* arch niches row 1 */}
    <S style={{ left:'27%', top:'22%', width:'17%', height:'22%', clipPath:'polygon(0% 100%,50% 0%,100% 100%)', borderRadius:'0' }} op={0.22} />
    <S style={{ left:'56%', top:'22%', width:'17%', height:'22%', clipPath:'polygon(0% 100%,50% 0%,100% 100%)' }} op={0.22} />
    {/* arch niches row 2 */}
    <S style={{ left:'27%', top:'52%', width:'17%', height:'22%', clipPath:'polygon(0% 100%,50% 0%,100% 100%)' }} op={0.22} />
    <S style={{ left:'56%', top:'52%', width:'17%', height:'22%', clipPath:'polygon(0% 100%,50% 0%,100% 100%)' }} op={0.22} />
    {/* flanking column ruins */}
    <S style={{ left:'5%',  top:'55%', width:'12%', height:'40%', borderRadius:'2px' }} op={0.7} />
    <S style={{ left:'83%', top:'55%', width:'12%', height:'40%', borderRadius:'2px' }} op={0.7} />
    {/* ground platform */}
    <S style={{ left:'0', bottom:'0', width:'100%', height:'6%', borderRadius:'2px' }} />
  </div>
)

/* ─────────────────────────────────────────
   AGADIR — Sun + Waves + Beach
───────────────────────────────────────── */
export const AgadirGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {/* sun disc */}
    <S style={{ left:'32%', top:'8%', width:'36%', paddingBottom:'36%', borderRadius:'50%' }} />
    {/* rays — 8 thin bars rotated */}
    {[0,45,90,135].map(deg => (
      <S key={deg} style={{ left:'48%', top:'0%', width:'4%', height:'10%', borderRadius:'2px',
               transform:`rotate(${deg}deg)`, transformOrigin:'50% 300%' }} op={0.9} />
    ))}
    {[22,67,112,157].map(deg => (
      <S key={deg} style={{ left:'48%', top:'1%', width:'3%', height:'7%', borderRadius:'2px',
               transform:`rotate(${deg}deg)`, transformOrigin:'50% 340%' }} op={0.65} />
    ))}
    {/* wave 1 */}
    <S style={{ left:'0', top:'62%', width:'100%', height:'10%',
               borderRadius:'50% 50% 0 0 / 100% 100% 0 0' }} op={0.85} />
    {/* wave 2 */}
    <S style={{ left:'0', top:'72%', width:'100%', height:'10%',
               borderRadius:'50% 50% 0 0 / 100% 100% 0 0' }} op={0.65} />
    {/* beach */}
    <S style={{ left:'0', bottom:'0', width:'100%', height:'16%',
               borderRadius:'2px 2px 0 0' }} op={0.5} />
  </div>
)

/* ─────────────────────────────────────────
   FÈS — Bab Bou Jeloud Gate
───────────────────────────────────────── */
export const FèsGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {/* left tower */}
    <S style={{ left:'2%', top:'26%', width:'24%', height:'70%', borderRadius:'2px' }} />
    {/* right tower */}
    <S style={{ left:'74%', top:'26%', width:'24%', height:'70%', borderRadius:'2px' }} />
    {/* central arch (pointed) */}
    <S style={{ left:'22%', top:'14%', width:'56%', height:'82%',
               clipPath:'polygon(0% 100%,0% 55%,50% 0%,100% 55%,100% 100%)' }} />
    {/* hollow arch interior */}
    <div className="absolute bg-black"
         style={{ left:'27%', top:'36%', width:'46%', height:'60%',
                  clipPath:'polygon(0% 100%,0% 28%,50% 0%,100% 28%,100% 100%)',
                  opacity: 0.28 }} />
    {/* left battlement */}
    <S style={{ left:'2%',  top:'20%', width:'7%', height:'8%', borderRadius:'1px' }} />
    <S style={{ left:'11%', top:'20%', width:'7%', height:'8%', borderRadius:'1px' }} />
    <S style={{ left:'20%', top:'20%', width:'5%', height:'8%', borderRadius:'1px' }} />
    {/* right battlement */}
    <S style={{ left:'74%', top:'20%', width:'7%', height:'8%', borderRadius:'1px' }} />
    <S style={{ left:'83%', top:'20%', width:'7%', height:'8%', borderRadius:'1px' }} />
    <S style={{ left:'92%', top:'20%', width:'6%', height:'8%', borderRadius:'1px' }} />
    {/* cornice band */}
    <S style={{ left:'0', top:'22%', width:'100%', height:'6%' }} op={0.9} />
    {/* zellige star ornament above arch */}
    <div className="absolute" style={{ left:'44%', top:'12%', width:'12%', paddingBottom:'12%' }}>
      <div className="absolute inset-0 bg-white opacity-25"
           style={{ clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' }} />
    </div>
  </div>
)

/* ─────────────────────────────────────────
   TANGER — Lighthouse
───────────────────────────────────────── */
export const TangerGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {/* lighthouse body (trapezoid) */}
    <S style={{ left:'28%', top:'22%', width:'44%', height:'68%',
               clipPath:'polygon(15% 0%,85% 0%,100% 100%,0% 100%)' }} />
    {/* stripe */}
    <S style={{ left:'28%', top:'56%', width:'44%', height:'7%' }} op={0.3} />
    {/* lantern room */}
    <S style={{ left:'24%', top:'12%', width:'52%', height:'12%', borderRadius:'2px' }} />
    {/* roof triangle */}
    <S style={{ left:'20%', top:'5%', width:'60%', height:'10%',
               clipPath:'polygon(50% 0%,0% 100%,100% 100%)' }} />
    {/* light orb */}
    <S style={{ left:'45%', top:'14%', width:'10%', paddingBottom:'10%', borderRadius:'50%' }} op={0.55} />
    {/* door */}
    <S style={{ left:'40%', top:'76%', width:'20%', height:'22%',
               clipPath:'polygon(0% 100%,0% 30%,50% 0%,100% 30%,100% 100%)' }} op={0.22} />
    {/* light beam 1 */}
    <S style={{ left:'72%', top:'14%', width:'22%', height:'3%', borderRadius:'2px',
               transform:'rotate(-15deg)', transformOrigin:'left center' }} op={0.65} />
    {/* light beam 2 */}
    <S style={{ left:'72%', top:'18%', width:'24%', height:'2.5%', borderRadius:'2px',
               transform:'rotate(5deg)', transformOrigin:'left center' }} op={0.45} />
    {/* wave 1 */}
    <S style={{ left:'0', bottom:'12%', width:'100%', height:'8%',
               borderRadius:'50% 50% 0 0 / 100% 100% 0 0' }} op={0.8} />
    {/* wave 2 */}
    <S style={{ left:'0', bottom:'4%', width:'100%', height:'7%',
               borderRadius:'50% 50% 0 0 / 100% 100% 0 0' }} op={0.55} />
  </div>
)

/* ─────────────────────────────────────────
   ESSAOUIRA — Sailing Boat
───────────────────────────────────────── */
export const EssaouiraGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {/* hull */}
    <S style={{ left:'8%', top:'58%', width:'84%', height:'18%',
               clipPath:'polygon(0% 0%,100% 0%,92% 100%,8% 100%)' }} />
    {/* keel bottom */}
    <S style={{ left:'38%', top:'74%', width:'24%', height:'10%',
               clipPath:'polygon(0% 0%,100% 0%,50% 100%)' }} />
    {/* mast */}
    <S style={{ left:'47%', top:'12%', width:'6%', height:'48%', borderRadius:'2px' }} />
    {/* main sail */}
    <S style={{ left:'50%', top:'14%', width:'36%', height:'44%',
               clipPath:'polygon(0% 0%,100% 100%,0% 100%)' }} op={0.9} />
    {/* jib sail */}
    <S style={{ left:'14%', top:'18%', width:'36%', height:'40%',
               clipPath:'polygon(100% 0%,0% 100%,100% 100%)' }} op={0.75} />
    {/* flag */}
    <S style={{ left:'50%', top:'8%', width:'20%', height:'10%',
               clipPath:'polygon(0% 0%,100% 50%,0% 100%)' }} op={0.75} />
    {/* porthole */}
    <div className="absolute rounded-full border-2 border-white"
         style={{ left:'22%', top:'61%', width:'8%', paddingBottom:'8%', opacity:0.45 }} />
    {/* wave */}
    <S style={{ left:'0', bottom:'4%', width:'100%', height:'8%',
               borderRadius:'50% 50% 0 0 / 100% 100% 0 0' }} op={0.7} />
  </div>
)

/* ─────────────────────────────────────────
   KÉNITRA — Graduation Cap + Diploma
───────────────────────────────────────── */
export const KénitraGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {/* mortarboard diamond */}
    <S style={{ left:'20%', top:'16%', width:'60%', height:'30%',
               clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)' }} />
    {/* cap board top surface */}
    <S style={{ left:'32%', top:'16%', width:'36%', height:'20%', borderRadius:'2px' }} op={0.8} />
    {/* tassel stem up */}
    <S style={{ left:'48%', top:'4%', width:'4%', height:'14%', borderRadius:'2px' }} />
    {/* tassel ball */}
    <S style={{ left:'44%', top:'0', width:'12%', paddingBottom:'12%', borderRadius:'50%' }} />
    {/* side tassel drop */}
    <S style={{ left:'80%', top:'30%', width:'4%', height:'16%', borderRadius:'2px' }} />
    <S style={{ left:'74%', top:'46%', width:'16%', height:'3.5%', borderRadius:'2px',
               transform:'rotate(-20deg)' }} op={0.75} />
    <S style={{ left:'72%', top:'52%', width:'18%', height:'3.5%', borderRadius:'2px',
               transform:'rotate(-20deg)' }} op={0.55} />
    {/* diploma scroll */}
    <S style={{ left:'18%', top:'68%', width:'64%', height:'24%', borderRadius:'50px' }} />
    {/* scroll lines */}
    <S style={{ left:'28%', top:'74%', width:'44%', height:'3%', borderRadius:'2px' }} op={0.25} />
    <S style={{ left:'28%', top:'81%', width:'36%', height:'3%', borderRadius:'2px' }} op={0.25} />
    {/* wax seal */}
    <S style={{ left:'44%', top:'72%', width:'12%', paddingBottom:'12%', borderRadius:'50%' }} op={0.25} />
  </div>
)

/* ─────────────────────────────────────────
   MEKNÈS — Bab Mansour Gate
───────────────────────────────────────── */
export const MeknèsGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {/* left column */}
    <S style={{ left:'2%', top:'32%', width:'18%', height:'64%', borderRadius:'2px' }} />
    {/* right column */}
    <S style={{ left:'80%', top:'32%', width:'18%', height:'64%', borderRadius:'2px' }} />
    {/* column capitals left */}
    <S style={{ left:'0', top:'26%', width:'22%', height:'8%', borderRadius:'2px' }} />
    {/* column capitals right */}
    <S style={{ left:'78%', top:'26%', width:'22%', height:'8%', borderRadius:'2px' }} />
    {/* central arch */}
    <S style={{ left:'18%', top:'16%', width:'64%', height:'80%',
               clipPath:'polygon(0% 100%,0% 50%,50% 0%,100% 50%,100% 100%)' }} />
    {/* hollow arch */}
    <div className="absolute bg-black"
         style={{ left:'24%', top:'36%', width:'52%', height:'60%',
                  clipPath:'polygon(0% 100%,0% 30%,50% 0%,100% 30%,100% 100%)',
                  opacity: 0.3 }} />
    {/* cornice */}
    <S style={{ left:'0', top:'20%', width:'100%', height:'8%' }} op={0.9} />
    {/* zellige star */}
    <div className="absolute" style={{ left:'42%', top:'10%', width:'16%', paddingBottom:'16%' }}>
      <div className="absolute inset-0 bg-white opacity-28"
           style={{ clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' }} />
    </div>
    {/* arch voussoir shadow */}
    <div className="absolute"
         style={{ left:'20%', top:'20%', width:'60%', height:'20%',
                  clipPath:'polygon(0% 100%,50% 0%,100% 100%)',
                  background:'rgba(0,0,0,0.15)' }} />
  </div>
)

/* ─────────────────────────────────────────
   OUJDA — Musical Notes
───────────────────────────────────────── */
export const OujdaGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {/* note 1 head (ellipse) */}
    <S style={{ left:'4%', top:'62%', width:'26%', paddingBottom:'18%',
               borderRadius:'50%', transform:'rotate(-15deg)' }} />
    {/* note 1 stem */}
    <S style={{ left:'27%', top:'22%', width:'5%', height:'44%', borderRadius:'2px' }} />
    {/* note 1 flag */}
    <S style={{ left:'30%', top:'22%', width:'28%', height:'20%',
               clipPath:'polygon(0% 0%,100% 50%,0% 100%)' }} op={0.9} />
    {/* note 2 head */}
    <S style={{ left:'52%', top:'66%', width:'22%', paddingBottom:'16%',
               borderRadius:'50%', transform:'rotate(-15deg)' }} />
    {/* note 2 stem */}
    <S style={{ left:'71%', top:'28%', width:'5%', height:'42%', borderRadius:'2px' }} />
    {/* note 2 flag */}
    <S style={{ left:'74%', top:'28%', width:'22%', height:'18%',
               clipPath:'polygon(0% 0%,100% 50%,0% 100%)' }} op={0.9} />
    {/* connecting beam */}
    <S style={{ left:'28%', top:'20%', width:'48%', height:'6%', borderRadius:'2px' }} />
    {/* decorative stars */}
    <S style={{ left:'8%',  top:'10%', width:'8%', paddingBottom:'8%', borderRadius:'50%' }} op={0.7} />
    <S style={{ left:'44%', top:'4%',  width:'7%', paddingBottom:'7%', borderRadius:'50%' }} op={0.55} />
    <S style={{ left:'82%', top:'10%', width:'6%', paddingBottom:'6%', borderRadius:'50%' }} op={0.45} />
  </div>
)

/* ─────────────────────────────────────────
   TÉTOUAN — Mountains + White Medina
───────────────────────────────────────── */
export const TétouanGraphic = ({ className = '' }) => (
  <div className={`relative w-full h-full ${className}`} aria-hidden>
    {/* back mountain left */}
    <S style={{ left:'0', top:'28%', width:'55%', height:'56%',
               clipPath:'polygon(50% 0%,100% 100%,0% 100%)' }} op={0.5} />
    {/* back mountain right */}
    <S style={{ left:'45%', top:'28%', width:'55%', height:'56%',
               clipPath:'polygon(50% 0%,100% 100%,0% 100%)' }} op={0.5} />
    {/* main center mountain */}
    <S style={{ left:'10%', top:'6%', width:'80%', height:'76%',
               clipPath:'polygon(50% 0%,100% 100%,0% 100%)' }} />
    {/* snow cap */}
    <div className="absolute bg-white"
         style={{ left:'38%', top:'6%', width:'24%', height:'22%',
                  clipPath:'polygon(50% 0%,100% 100%,0% 100%)',
                  opacity: 0.45 }} />
    {/* medina building 1 */}
    <S style={{ left:'10%', top:'76%', width:'14%', height:'18%', borderRadius:'1px' }} op={0.55} />
    {/* medina building 2 */}
    <S style={{ left:'26%', top:'72%', width:'12%', height:'22%', borderRadius:'1px' }} op={0.55} />
    {/* medina building 3 */}
    <S style={{ left:'52%', top:'74%', width:'16%', height:'20%', borderRadius:'1px' }} op={0.55} />
    {/* medina building 4 */}
    <S style={{ left:'70%', top:'76%', width:'14%', height:'18%', borderRadius:'1px' }} op={0.55} />
    {/* minaret */}
    <S style={{ left:'40%', top:'62%', width:'6%', height:'16%', borderRadius:'1px' }} op={0.7} />
    {/* ground */}
    <S style={{ left:'0', bottom:'0', width:'100%', height:'5%' }} op={0.8} />
  </div>
)

/* ─────────────────────────────────────────
   Registry
───────────────────────────────────────── */
export const CITY_GRAPHICS = {
  Casablanca: CasablancaGraphic,
  Marrakech:  MarrakechGraphic,
  Rabat:      RabatGraphic,
  Agadir:     AgadirGraphic,
  Fès:        FèsGraphic,
  Tanger:     TangerGraphic,
  Essaouira:  EssaouiraGraphic,
  Kénitra:    KénitraGraphic,
  Meknès:     MeknèsGraphic,
  Oujda:      OujdaGraphic,
  Tétouan:    TétouanGraphic,
}
