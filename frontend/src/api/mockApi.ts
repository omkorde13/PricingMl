import type { PredictRequest, PredictResponse } from '@/types'
import { VEHICLE_BASE_RATES, BASE_RATE_PER_KM, MIN_FARE_INR, MAX_FARE_INR } from '@/types/constants'

function predictPrice(name: string, req: PredictRequest): number {
    const vehicleMult = VEHICLE_BASE_RATES[req.vehicleType] ?? 1.0
    const base        = req.rideDistance * BASE_RATE_PER_KM * vehicleMult

    // Rush hour surge
    const isRush  = req.isRushHour ||
        (req.hour >= 7 && req.hour <= 9) ||
        (req.hour >= 17 && req.hour <= 20)
    const rushMult = isRush ? 1.35 : 1.0

    // Weekend mild boost
    const weekendMult = req.isWeekend ? 1.1 : 1.0

    // Demand/supply via VTAT/CTAT
    const demandPressure = req.avgCtat / (req.avgVtat + 1)
    const surgeMult = Math.min(2.0, 1 + 0.3 * Math.max(0, demandPressure - 1))

    // Model-specific adjustments (LightGBM is most accurate on real data)
    const modelAdj: Record<string, number> = {
        ridge: 0.93,
        rf:    0.98,
        xgb:   1.01,
        lgbm:  1.03,
    }

    const price = base * rushMult * weekendMult * surgeMult * (modelAdj[name] ?? 1.0)
    return Math.round(Math.max(MIN_FARE_INR, Math.min(MAX_FARE_INR, price)))
}

const MODEL_STATS = {
    ridge: { r2: 0.821, rmse: 131.8, trainingTimeMs: 1   },
    rf:    { r2: 0.912, rmse: 91.0,  trainingTimeMs: 820 },
    xgb:   { r2: 0.934, rmse: 78.9,  trainingTimeMs: 290 },
    lgbm:  { r2: 0.947, rmse: 73.4,  trainingTimeMs: 95  },
}

export async function mockPredict(req: PredictRequest): Promise<PredictResponse> {
    await new Promise(r => setTimeout(r, 150))

    const ridgePrice = predictPrice('ridge', req)
    const rfPrice    = predictPrice('rf',    req)
    const xgbPrice   = predictPrice('xgb',  req)
    const lgbmPrice  = predictPrice('lgbm', req)
    const base       = ridgePrice

    const toResult = (name: string, price: number) => ({
        priceINR:        price,
        surgeMultiplier: parseFloat((price / base).toFixed(2)),
        r2Score:         MODEL_STATS[name as keyof typeof MODEL_STATS].r2,
        rmse:            MODEL_STATS[name as keyof typeof MODEL_STATS].rmse,
        trainingTimeMs:  MODEL_STATS[name as keyof typeof MODEL_STATS].trainingTimeMs,
    })

    return {
        ridge:       toResult('ridge', ridgePrice),
        rf:          toResult('rf',    rfPrice),
        xgb:         toResult('xgb',   xgbPrice),
        lgbm:        toResult('lgbm',  lgbmPrice),
        recommended: 'lgbm',
        usdToInr:    92.88,
        timestamp:   new Date().toISOString(),
    }
}