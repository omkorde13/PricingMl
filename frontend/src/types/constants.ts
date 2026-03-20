import type { ModelMeta } from './index'

export const MODEL_META: ModelMeta[] = [
    {
        key:        'ridge',
        label:      'Ridge',
        fullName:   'Ridge Regression',
        color:      '#6b7280',
        badgeClass: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    },
    {
        key:        'rf',
        label:      'Random Forest',
        fullName:   'Random Forest',
        color:      '#3b82f6',
        badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
        key:        'xgb',
        label:      'XGBoost',
        fullName:   'XGBoost',
        color:      '#8b5cf6',
        badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
        key:        'lgbm',
        label:      'LightGBM',
        fullName:   'LightGBM',
        color:      '#10b981',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
]

// Vehicle multipliers relative to Mini (for mock predictions)
export const VEHICLE_BASE_RATES: Record<string, number> = {
    'Auto':        0.80,
    'Bike':        0.70,
    'eBike':       0.75,
    'Mini':        1.00,
    'Prime Sedan': 1.30,
    'Prime Plus':  1.50,
    'Prime SUV':   1.70,
}

// Base rate ₹/km from dataset (avg ₹1023 / avg 25.4km ≈ ₹40/km)
export const BASE_RATE_PER_KM = 40.0
export const MIN_FARE_INR     = 100
export const MAX_FARE_INR     = 2000

export const FEATURE_IMPORTANCE = [
    { feature: 'Ride Distance',    importance: 35 },
    { feature: 'demand_pressure',  importance: 22 },
    { feature: 'vehicle_encoded',  importance: 18 },
    { feature: 'Avg CTAT',        importance: 10 },
    { feature: 'Avg VTAT',        importance: 7  },
    { feature: 'is_rush_hour',    importance: 4  },
    { feature: 'hour_sin',        importance: 3  },
    { feature: 'Driver Ratings',  importance: 1  },
]