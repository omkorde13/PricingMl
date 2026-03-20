import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, Cell
} from 'recharts'
import { usePricingStore } from '@/store/pricingStore'
import { MODEL_META, FEATURE_IMPORTANCE, VEHICLE_BASE_RATES, BASE_RATE_PER_KM } from '@/types/constants'
import { mockPredict } from '@/api/mockApi'
import { useEffect, useState } from 'react'
import type { HourlyDataPoint } from '@/types'

const tooltipStyle = {
    backgroundColor: '#1a1f2e',
    border:          '1px solid rgba(255,255,255,0.08)',
    borderRadius:    8,
    fontFamily:      '"DM Mono", monospace',
    fontSize:        12,
    color:           '#e8eaf0',
}

const axisStyle = {
    fontFamily: '"DM Mono", monospace',
    fontSize:   11,
    fill:       '#6b7280',
}

export function R2Chart() {
    const data = MODEL_META.map((m, i) => ({
        name:  m.label,
        r2:    [0.821, 0.912, 0.934, 0.947][i],
        color: m.color,
    }))
    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis domain={[0.75, 1.0]} tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => v.toFixed(2)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v.toFixed(3), 'R²']} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="r2" radius={[4,4,0,0]}>
                    {data.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

export function RmseChart() {
    const data = MODEL_META.map((m, i) => ({
        name:  m.label,
        rmse:  [131.8, 91.0, 78.9, 73.4][i],
        color: m.color,
    }))
    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toFixed(1)}`, 'RMSE']} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="rmse" radius={[4,4,0,0]}>
                    {data.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

export function SpeedChart() {
    const data = [
        { name: 'Ridge',   ms: 1,   color: '#6b7280' },
        { name: 'LightGBM',ms: 95,  color: '#10b981' },
        { name: 'XGBoost', ms: 290, color: '#8b5cf6' },
        { name: 'RF',      ms: 820, color: '#3b82f6' },
    ]
    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `${v}ms`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}ms`, 'Training time']} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="ms" radius={[4,4,0,0]}>
                    {data.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

export function FeatureChart() {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <YAxis dataKey="feature" type="category" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, 'Importance']} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="importance" fill="#10b981" fillOpacity={0.8} radius={[0,4,4,0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}

export function HourlyChart() {
    const { request } = usePricingStore()
    const [data, setData] = useState<HourlyDataPoint[]>([])

    useEffect(() => {
        const compute = async () => {
            const points: HourlyDataPoint[] = []
            for (let h = 0; h < 24; h++) {
                const res = await mockPredict({ ...request, hour: h })
                points.push({
                    hour:  `${String(h).padStart(2,'0')}:00`,
                    ridge: res.ridge.priceINR,
                    rf:    res.rf.priceINR,
                    xgb:   res.xgb.priceINR,
                    lgbm:  res.lgbm.priceINR,
                })
            }
            setData(points)
        }
        compute()
    }, [request.rideDistance, request.vehicleType, request.isWeekend, request.avgVtat, request.avgCtat])

    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="hour" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [`₹${v.toLocaleString('en-IN')}`, name]} />
                <Legend wrapperStyle={{ fontFamily: '"DM Mono"', fontSize: 11, color: '#9ca3af' }} />
                {MODEL_META.map(m => (
                    <Line key={m.key} type="monotone" dataKey={m.key} name={m.label}
                          stroke={m.color} strokeWidth={m.key === 'lgbm' ? 2.5 : 1.5}
                          dot={false} strokeOpacity={m.key === 'lgbm' ? 1 : 0.6} />
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
}

export function VehiclePriceChart() {
    const { request } = usePricingStore()
    const data = Object.entries(VEHICLE_BASE_RATES).map(([vehicle, mult]) => ({
        name:  vehicle,
        price: Math.round(request.rideDistance * BASE_RATE_PER_KM * mult),
        color: '#10b981',
    }))

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Est. price']} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="price" radius={[4,4,0,0]}>
                    {data.map((d, i) => (
                        <Cell key={i}
                              fill={d.name === request.vehicleType ? '#10b981' : '#3b82f6'}
                              fillOpacity={d.name === request.vehicleType ? 1 : 0.5}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

export function LivePriceChart() {
    const { response, loading } = usePricingStore()
    const data = MODEL_META.map(m => ({
        name:  m.label,
        price: response ? response[m.key].priceINR : [400, 420, 435, 448][MODEL_META.indexOf(m)],
        color: m.color,
    }))
    return (
        <div style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} domain={['auto','auto']} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Price']} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="price" radius={[4,4,0,0]}>
                        {data.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}