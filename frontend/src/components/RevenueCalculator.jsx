import { Icon } from './Icons'

/**
 * Calculateur de revenus en temps réel pour les organisateurs étudiants.
 * Affiche : revenu brut potentiel, commission plateforme, revenu net, point mort.
 * Props : priceStandard, priceVip, capacity, fixedCost (optionnel)
 */
const PLATFORM_FEE_RATE = 0.10     // 10% commission Fayas
const STUDENT_BONUS_RATE = 0.05    // -5% pour étudiants (effective: 5%)
const VIP_SHARE = 0.20              // hypothèse: 20% des billets sont VIP si VIP > 0

export default function RevenueCalculator({ priceStandard = 0, priceVip = 0, capacity = 0, fixedCost = 0, accentColor = '#7C3AED' }) {
  const ps = Number(priceStandard) || 0
  const pv = Number(priceVip) || 0
  const cap = Number(capacity) || 0
  const fc = Number(fixedCost) || 0

  // Estimation: si VIP > 0, on suppose 20% VIP / 80% Standard, sinon 100% Standard
  const vipCount = pv > 0 ? Math.floor(cap * VIP_SHARE) : 0
  const stdCount = cap - vipCount
  const grossRevenue = stdCount * ps + vipCount * pv

  const feeRate = PLATFORM_FEE_RATE - STUDENT_BONUS_RATE // = 0.05 (5% pour étudiants)
  const platformFee = grossRevenue * feeRate
  const netRevenue  = grossRevenue - platformFee - fc

  // Point mort = nombre de billets à vendre pour couvrir les frais fixes
  const avgPrice = pv > 0 ? (ps * 0.8 + pv * 0.2) : ps
  const avgNetPrice = avgPrice * (1 - feeRate)
  const breakEven = fc > 0 && avgNetPrice > 0 ? Math.ceil(fc / avgNetPrice) : 0
  const breakEvenPct = cap > 0 ? Math.min(100, (breakEven / cap) * 100) : 0

  // FayasCoins gagnés en organisant
  const coinsEarned = Math.round(grossRevenue * 0.02) // 2% en coins

  const Row = ({ label, value, accent, big, danger, good, sub }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <span className={`text-xs ${danger ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400'}`}>{label}</span>
        {sub && <p className="text-[10px] text-gray-400 dark:text-gray-600">{sub}</p>}
      </div>
      <span className={`tabular-nums font-bold ${big ? 'text-xl' : 'text-sm'} ${
        danger ? 'text-rose-600 dark:text-rose-400'
        : good ? 'text-emerald-600 dark:text-emerald-400'
        : accent ? '' : 'text-gray-800 dark:text-gray-200'
      }`} style={accent ? { color: accentColor } : {}}>
        {value}
      </span>
    </div>
  )

  return (
    <div className="card p-5 sticky top-24">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}22` }}>
          <Icon name="chart" className="w-4 h-4" style={{ color: accentColor }} strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Estimation revenus</h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">En temps réel</p>
        </div>
      </div>

      {cap === 0 || ps === 0 ? (
        <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
          <Icon name="info" className="w-6 h-6 mx-auto mb-2 opacity-60" />
          <p>Renseignez le prix et la capacité pour voir l'estimation.</p>
        </div>
      ) : (
        <>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 mb-3 space-y-0.5">
            <Row label={`${stdCount} × ${ps} MAD (Standard)`} value={`${(stdCount * ps).toLocaleString()} MAD`} />
            {pv > 0 && (
              <Row label={`${vipCount} × ${pv} MAD (VIP)`} value={`${(vipCount * pv).toLocaleString()} MAD`} />
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-1.5 mt-1.5">
              <Row label="Revenu brut" value={`${grossRevenue.toLocaleString()} MAD`} accent big />
            </div>
          </div>

          <div className="space-y-1 mb-3">
            <Row
              label={`Commission Fayas (${(feeRate * 100).toFixed(0)}%)`}
              value={`-${platformFee.toLocaleString(undefined, { maximumFractionDigits: 0 })} MAD`}
              danger
              sub="Taux étudiant réduit"
            />
            {fc > 0 && (
              <Row label="Frais fixes" value={`-${fc.toLocaleString()} MAD`} danger />
            )}
          </div>

          <div className="bg-gradient-to-br rounded-xl p-3 mb-3"
            style={{ backgroundImage: `linear-gradient(135deg, ${accentColor}22, ${accentColor}11)` }}>
            <Row label="Revenu net estimé" value={`${netRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} MAD`} good big />
          </div>

          {/* Break-even */}
          {fc > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 mb-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-amber-700 dark:text-amber-400 font-semibold">Point mort</span>
                <span className="text-amber-700 dark:text-amber-400 font-bold tabular-nums">
                  {breakEven} / {cap} billets ({breakEvenPct.toFixed(0)}%)
                </span>
              </div>
              <div className="h-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${breakEvenPct}%` }}
                />
              </div>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 leading-tight">
                Billets à vendre pour couvrir les frais fixes.
              </p>
            </div>
          )}

          {/* FayasCoins bonus */}
          <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-xl p-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
              <Icon name="gem" className="w-4 h-4 text-purple-600 dark:text-purple-400" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wide">Bonus organisateur</p>
              <p className="text-purple-800 dark:text-purple-300 font-extrabold text-sm">
                +{coinsEarned.toLocaleString()} FayasCoins
              </p>
            </div>
          </div>
        </>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 dark:text-gray-500 leading-tight space-y-0.5">
        <p>• Hypothèse : 80% Standard / 20% VIP si VIP activé</p>
        <p>• Tarif étudiant : 5% au lieu de 10%</p>
        <p>• Estimation à capacité 100% (max théorique)</p>
      </div>
    </div>
  )
}
