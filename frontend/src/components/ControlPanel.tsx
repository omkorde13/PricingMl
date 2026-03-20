import { usePricingStore } from '@/store/pricingStore'
import { VEHICLE_TYPES } from '@/types'
import clsx from 'clsx'

interface SliderProps {
    label:       string
    value:       number
    min:         number
    max:         number
    step?:       number
    onChange:    (v: number) => void
    formatValue?:(v: number) => string
}

function Slider({ label, value, min, max, step = 1, onChange, formatValue }: SliderProps) {
    const pct     = ((value - min) / (max - min)) * 100
    const display = formatValue ? formatValue(value) : String(value)
    return (
        <div className="mb-4">
            <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-gray-500">{label}</span>
                <span className="text-white font-medium">{display}</span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #4f8ef7 ${pct}%, #1a1f2e ${pct}%)` }}
            />
        </div>
    )
}

interface ToggleProps {
    label:    string
    value:    boolean
    onChange: (v: boolean) => void
}

function Toggle({ label, value, onChange }: ToggleProps) {
    return (
        <button
            onClick={() => onChange(!value)}
            className={clsx(
                'flex-1 py-2 text-xs font-mono rounded-lg border transition-all duration-150',
                value
                    ? 'bg-accent-blue border-accent-blue text-white'
                    : 'bg-bg-3 border-border-subtle text-gray-500 hover:text-gray-300'
            )}
        >
            {label}
        </button>
    )
}

export function ControlPanel() {
    const { request, setRequest } = usePricingStore()

    const isRushHour = (request.hour >= 7 && request.hour <= 9) ||
        (request.hour >= 17 && request.hour <= 20)

    return (
        <div className="bg-bg-2 border border-border-subtle rounded-xl p-5 space-y-1">
            <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4">
                Ride conditions
            </p>

            {/* Vehicle type */}
            <div className="mb-4">
                <p className="text-xs text-gray-500 font-mono mb-2">Vehicle type</p>
                <div className="grid grid-cols-4 gap-1">
                    {VEHICLE_TYPES.map(v => (
                        <button
                            key={v}
                            onClick={() => setRequest({ vehicleType: v })}
                            className={clsx(
                                'py-1.5 text-xs font-mono rounded-lg border transition-all',
                                request.vehicleType === v
                                    ? 'bg-accent-blue border-accent-blue text-white'
                                    : 'bg-bg-3 border-border-subtle text-gray-500 hover:text-gray-300'
                            )}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            <Slider
                label="Ride distance (km)"
                value={request.rideDistance}
                min={1} max={50} step={0.5}
                onChange={v => setRequest({ rideDistance: v })}
                formatValue={v => `${v} km`}
            />
            <Slider
                label="Hour of day"
                value={request.hour}
                min={0} max={23}
                onChange={v => setRequest({ hour: v })}
                formatValue={v => `${String(v).padStart(2,'0')}:00${isRushHour ? ' 🚦' : ''}`}
            />
            <Slider
                label="Avg driver arrival (mins)"
                value={request.avgVtat}
                min={1} max={20} step={0.5}
                onChange={v => setRequest({ avgVtat: v })}
                formatValue={v => `${v} min`}
            />
            <Slider
                label="Avg customer wait (mins)"
                value={request.avgCtat}
                min={1} max={30} step={0.5}
                onChange={v => setRequest({ avgCtat: v })}
                formatValue={v => `${v} min`}
            />
            <Slider
                label="Driver rating"
                value={request.driverRating}
                min={1} max={5} step={0.1}
                onChange={v => setRequest({ driverRating: v })}
                formatValue={v => `${v.toFixed(1)} ★`}
            />

            {/* Toggles */}
            <div>
                <p className="text-xs text-gray-500 font-mono mb-2">Conditions</p>
                <div className="flex gap-2">
                    <Toggle label="Weekend"  value={request.isWeekend}  onChange={v => setRequest({ isWeekend: v })}  />
                    <Toggle label="Raining"  value={request.isRaining}  onChange={v => setRequest({ isRaining: v })}  />
                    <Toggle label="Event"    value={request.isEvent}    onChange={v => setRequest({ isEvent: v })}    />
                </div>
            </div>

            {/* Demand/supply ratio */}
            <div className="pt-4 border-t border-border-subtle">
                <p className="text-xs text-gray-500 font-mono mb-2">
                    Demand pressure (CTAT/VTAT)
                </p>
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-bg-3 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                                width: `${Math.min(100, (request.avgCtat / request.avgVtat / 3) * 100)}%`,
                                background: request.avgCtat / request.avgVtat < 1.5 ? '#10b981'
                                    : request.avgCtat / request.avgVtat < 2.5 ? '#f59e0b' : '#ef4444',
                            }}
                        />
                    </div>
                    <span className="text-sm font-heading font-bold min-w-[40px] text-right text-white">
            {(request.avgCtat / request.avgVtat).toFixed(2)}x
          </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 font-mono">
                    Dataset: Bengaluru Ola · 33,484 real rides
                </p>
            </div>
        </div>
    )
}