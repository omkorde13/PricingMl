import { useEffect } from 'react'
import { usePricingStore } from '@/store/pricingStore'
import { ControlPanel }   from './ControlPanel'
import { ModelCards }     from './ModelCards'
import { AccuracyTable }  from './AccuracyTable'
import {
    R2Chart, RmseChart, SpeedChart,
    FeatureChart, HourlyChart, VehiclePriceChart, LivePriceChart
} from './Charts'

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-4 mb-4">
            <h2 className="font-heading font-bold text-lg text-white whitespace-nowrap">{children}</h2>
            <div className="flex-1 h-px bg-border-subtle" />
        </div>
    )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-bg-2 border border-border-subtle rounded-xl p-5">
            <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4">{title}</p>
            {children}
        </div>
    )
}

export function Dashboard() {
    const { fetchPrediction, response } = usePricingStore()

    useEffect(() => { fetchPrediction() }, [])

    const lgbmPrice = response?.lgbm.priceINR ?? 448
    const ridgePrice = response?.ridge.priceINR ?? 400
    const revLift   = (((lgbmPrice - ridgePrice) / ridgePrice) * 100).toFixed(1)

    return (
        <div className="max-w-screen-xl mx-auto px-6 py-8 animate-fade-in">

            {/* Hero */}
            <div className="mb-8">
                <h1 className="font-heading font-extrabold text-4xl md:text-5xl tracking-tight leading-none mb-2">
                    Dynamic Pricing <span className="text-accent-blue">Engine</span>
                </h1>
                <p className="text-gray-500 font-mono text-sm max-w-lg">
                    Bengaluru Ola · 33,484 real rides · Ridge · Random Forest · XGBoost · LightGBM
                </p>
            </div>

            {/* Winner banner */}
            <div className="flex items-center gap-4 bg-bg-2 border-l-2 border-emerald-500 border border-emerald-500/20 rounded-xl px-5 py-3 mb-8">
                <div>
                    <p className="font-heading font-bold text-emerald-400 text-sm">
                        LightGBM recommended for production
                    </p>
                    <p className="text-gray-500 text-xs font-mono mt-0.5">
                        Highest R² (0.947) · Lowest RMSE (₹73.4) · Trained on real Bengaluru ride data
                    </p>
                </div>
                <div className="ml-auto text-right">
                    <div className="font-heading font-extrabold text-2xl text-emerald-400">+{revLift}%</div>
                    <div className="text-xs text-gray-500 font-mono">vs Ridge baseline</div>
                </div>
            </div>

            {/* Controls + Live predictions */}
            <SectionLabel>Live prediction</SectionLabel>
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 mb-8">
                <ControlPanel />
                <div className="space-y-4">
                    <ModelCards />
                    <Card title="Price comparison — all models">
                        <LivePriceChart />
                    </Card>
                </div>
            </div>

            {/* Accuracy */}
            <SectionLabel>Accuracy comparison</SectionLabel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                <AccuracyTable />
                <Card title="R² score by model">
                    <R2Chart />
                </Card>
            </div>

            {/* Simulation */}
            <SectionLabel>Simulation</SectionLabel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                <Card title="Price across 24 hours — all models">
                    <HourlyChart />
                </Card>
                <Card title="Price by vehicle type (current distance)">
                    <VehiclePriceChart />
                </Card>
            </div>

            {/* Insights */}
            <SectionLabel>Model insights</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <Card title="Feature importance (LightGBM)">
                    <FeatureChart />
                </Card>
                <Card title="RMSE comparison (₹)">
                    <RmseChart />
                </Card>
                <Card title="Training speed (ms)">
                    <SpeedChart />
                </Card>
            </div>

        </div>
    )
}