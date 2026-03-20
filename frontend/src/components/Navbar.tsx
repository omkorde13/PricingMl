import { usePricingStore } from '@/store/pricingStore'
import clsx from 'clsx'

export function Navbar() {
    const { loading, backendOnline } = usePricingStore()
    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-border-subtle bg-bg">
            <div className="font-heading font-extrabold text-base tracking-tight">
                Pricing<span className="text-accent-blue">ML</span>
                <span className="ml-2 text-xs text-gray-600 font-mono font-normal">Bengaluru Ola</span>
            </div>
            <div className="flex items-center gap-4">
                <span className={clsx('w-2 h-2 rounded-full', loading ? 'bg-accent-amber animate-pulse' : 'bg-accent-green animate-pulse-slow')} />
                <span className="text-xs text-gray-500 font-mono">{loading ? 'Computing...' : 'Live'}</span>
                <span className={clsx('text-xs px-3 py-1 rounded-full border font-mono',
                    backendOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-gray-500/10 text-gray-500 border-gray-500/20')}>
          {backendOnline ? 'Spring Boot ✓' : 'Mock mode'}
        </span>
                <span className="text-xs px-3 py-1 rounded-full border border-border-subtle text-gray-500 font-mono">4 models</span>
            </div>
        </nav>
    )
}