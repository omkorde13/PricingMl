import { useEffect } from 'react'
import { Navbar }    from './components/Navbar'
import { Dashboard } from './components/Dashboard'
import { usePricingStore } from './store/pricingStore'
import { checkHealth }     from './api/pricingApi'

export default function App() {
  const setBackendOnline = usePricingStore(s => s.setBackendOnline)

  useEffect(() => {
    checkHealth().then(setBackendOnline)
    const interval = setInterval(() => checkHealth().then(setBackendOnline), 30_000)
    return () => clearInterval(interval)
  }, [setBackendOnline])

  return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <Dashboard />
      </div>
  )
}