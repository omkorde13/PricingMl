import { MODEL_META } from '@/types/constants'
import clsx from 'clsx'

const ACCURACY_DATA = [
    { key: 'ridge', r2: 0.821, rmse: 131.8, speed: '1ms',   speedClass: 'text-emerald-400' },
    { key: 'rf',    r2: 0.912, rmse: 91.0,  speed: '820ms', speedClass: 'text-amber-400'   },
    { key: 'xgb',   r2: 0.934, rmse: 78.9,  speed: '290ms', speedClass: 'text-emerald-400' },
    { key: 'lgbm',  r2: 0.947, rmse: 73.4,  speed: '95ms',  speedClass: 'text-emerald-400' },
]

export function AccuracyTable() {
    return (
        <div className="overflow-hidden rounded-xl border border-border-subtle">
            <table className="w-full">
                <thead>
                <tr className="border-b border-border-subtle">
                    {['Model', 'R² score', 'RMSE (₹)', 'Speed'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {ACCURACY_DATA.map(row => {
                    const meta     = MODEL_META.find(m => m.key === row.key)!
                    const isWinner = row.key === 'lgbm'
                    return (
                        <tr key={row.key} className="border-b border-border-subtle last:border-0 hover:bg-bg-3 transition-colors">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                                    <span className="text-sm font-mono text-gray-200">{meta.fullName}</span>
                                    {isWinner && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Winner</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="text-sm font-mono text-gray-200">{row.r2.toFixed(3)}</div>
                                <div className="mt-1 h-1.5 w-32 bg-bg-3 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${row.r2 * 100}%`, background: meta.color }} />
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-mono" style={{ color: meta.color }}>₹{row.rmse.toFixed(1)}</td>
                            <td className={clsx('px-4 py-3 text-sm font-mono', row.speedClass)}>{row.speed}</td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
    )
}