import { create } from 'zustand'
import type { PredictRequest, PredictResponse } from '@/types'
import { predict } from '@/api/pricingApi'
import { mockPredict } from '@/api/mockApi'

const USE_MOCK = false   // set false when Spring Boot + Python are running

interface PricingStore {
    request:         PredictRequest
    setRequest:      (patch: Partial<PredictRequest>) => void
    response:        PredictResponse | null
    loading:         boolean
    error:           string | null
    fetchPrediction: () => Promise<void>
    backendOnline:   boolean
    setBackendOnline:(v: boolean) => void
}

export const usePricingStore = create<PricingStore>((set, get) => ({
    request: {
        hour:           18,
        isWeekend:      false,
        isRushHour:     true,
        vehicleType:    'Mini',
        rideDistance:   10.0,
        avgVtat:        10.0,
        avgCtat:        15.0,
        driverRating:   4.5,
        customerRating: 4.5,
        isRaining:      false,
        isEvent:        false,
        demand:         75,
        supply:         35,
    },

    response:       null,
    loading:        false,
    error:          null,
    backendOnline:  false,

    setRequest: (patch) => {
        set(s => ({ request: { ...s.request, ...patch } }))
        get().fetchPrediction()
    },

    fetchPrediction: async () => {
        set({ loading: true, error: null })
        try {
            const fn       = USE_MOCK ? mockPredict : predict
            const response = await fn(get().request)
            set({ response, loading: false })
        } catch (err: unknown) {
            const msg = (err as { message?: string })?.message ?? 'Prediction failed'
            set({ error: msg, loading: false })
        }
    },

    setBackendOnline: (v) => set({ backendOnline: v }),
}))