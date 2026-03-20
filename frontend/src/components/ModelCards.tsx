import { usePricingStore } from '@/store/pricingStore'
import { MODEL_META } from '@/types/constants'
import type { ModelKey } from '@/types'
import clsx from 'clsx'

interface ModelCardProps {
    modelKey:        ModelKey
    priceINR:        number
    surgeMultiplier: number
    r2Score:         number
    rmse:            number
    isRecommended:   boolean
    isLoading:       boolean
}

function ModelCard({ modelKey, priceINR, surgeMultiplier, r2Score, rmse, isRecommended, isLoading }: ModelCardProps) {
    const meta        = MODEL_META.find(m => m.key === modelKey)!
    const surgeColor  = surgeMultiplier < 1.2 ? '#10b981'
        : surgeMultiplier < 1.5 ? '#f59e0b' : '#ef4444'

    return (
        <div className={clsx(
            'relative bg-bg-2 rounded-xl border overflow-hidden transition-all duration-200',
            isRecommended ? 'border-emerald-500/40' : 'border-border-subtle'
        )}>
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: meta.color }} />
            <div className="p-4 pt-5">
                <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
            {meta.fullName}
          </span>
                    {isRecommended && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Best
            </span>
                    )}
                </div>

                <div
                    className={clsx('font-heading font-extrabold text-3xl tracking-tight mb-1 transition-opacity duration-300', isLoading && 'opacity-40')}
                    style={{ color: meta.color }}
                >
                    ₹{priceINR.toLocaleString('en-IN')}
                </div>

                <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-mono text-gray-500">
            {surgeMultiplier.toFixed(2)}x surge
          </span>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: `${surgeColor}18`, color: surgeColor }}>
            R²={r2Score.toFixed(3)}
          </span>
                </div>

                <div className="mt-1 text-xs font-mono text-gray-600">
                    RMSE ₹{rmse.toFixed(1)}
                </div>
            </div>
        </div>
    )
}

export function ModelCards() {
    const { response, loading } = usePricingStore()

    const defaults = {
        ridge: { priceINR: 400, surgeMultiplier: 1.00, r2Score: 0.821, rmse: 131.8 },
        rf:    { priceINR: 420, surgeMultiplier: 1.05, r2Score: 0.912, rmse: 91.0  },
        xgb:   { priceINR: 435, surgeMultiplier: 1.09, r2Score: 0.934, rmse: 78.9  },
        lgbm:  { priceINR: 448, surgeMultiplier: 1.12, r2Score: 0.947, rmse: 73.4  },
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {MODEL_META.map(meta => {
                const d = response ? response[meta.key] : defaults[meta.key]
                return (
                    <ModelCard
                        key={meta.key}
                        modelKey={meta.key}
                        priceINR={d.priceINR}
                        surgeMultiplier={d.surgeMultiplier}
                        r2Score={d.r2Score}
                        rmse={d.rmse}
                        isRecommended={response?.recommended === meta.key}
                        isLoading={loading}
                    />
                )
            })}
        </div>
    )
}