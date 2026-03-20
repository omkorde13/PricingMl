// ── Request to Spring Boot ────────────────────────────────────────────────
export interface PredictRequest {
    hour:           number
    isWeekend:      boolean
    isRushHour:     boolean
    vehicleType:    VehicleType
    rideDistance:   number
    avgVtat:        number
    avgCtat:        number
    driverRating:   number
    customerRating: number
    // legacy
    isRaining:      boolean
    isEvent:        boolean
    demand:         number
    supply:         number
}

// ── Vehicle types from Bengaluru Ola dataset ──────────────────────────────
export type VehicleType =
    | 'Auto'
    | 'Bike'
    | 'eBike'
    | 'Mini'
    | 'Prime Sedan'
    | 'Prime Plus'
    | 'Prime SUV'

export const VEHICLE_TYPES: VehicleType[] = [
    'Auto', 'Bike', 'eBike', 'Mini', 'Prime Sedan', 'Prime Plus', 'Prime SUV'
]

// ── Model prediction ──────────────────────────────────────────────────────
export interface ModelPrediction {
    priceINR:        number
    surgeMultiplier: number
    r2Score:         number
    rmse:            number
    trainingTimeMs:  number
}

// ── Full response ─────────────────────────────────────────────────────────
export interface PredictResponse {
    ridge:       ModelPrediction
    rf:          ModelPrediction
    xgb:         ModelPrediction
    lgbm:        ModelPrediction
    recommended: ModelKey
    usdToInr:    number
    timestamp:   string
}

export type ModelKey = 'ridge' | 'rf' | 'xgb' | 'lgbm'

export interface ModelMeta {
    key:           ModelKey
    label:         string
    fullName:      string
    color:         string
    badgeClass:    string
}

export interface HourlyDataPoint {
    hour:  string
    ridge: number
    rf:    number
    xgb:   number
    lgbm:  number
}

export interface ApiError {
    message: string
    status:  number
}