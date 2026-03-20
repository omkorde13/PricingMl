"""
Dynamic Pricing ML Service — Real Dataset Version
Uses features from Bengaluru Ola.csv

Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager
import numpy as np
import joblib
import os
import time
import logging
from datetime import datetime, timezone

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s"
)
logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────
# No USD conversion needed — dataset is already in ₹INR
BASE_FARE_INR = 100.0   # Minimum base fare in ₹

MODEL_STATS = {
    "ridge": {"r2": 0.0,  "rmse": 0.0,  "training_time_ms": 1},
    "rf":    {"r2": 0.0,  "rmse": 0.0,  "training_time_ms": 820},
    "xgb":   {"r2": 0.0,  "rmse": 0.0,  "training_time_ms": 290},
    "lgbm":  {"r2": 0.0,  "rmse": 0.0,  "training_time_ms": 95},
}

# ── Model + encoder registry ──────────────────────────────────────────────
models:  dict = {}
encoders: dict = {}
FEATURES: list = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 55)
    logger.info("Dynamic Pricing ML Service — Starting")
    logger.info("=" * 55)

    # Load models
    model_files = {
        "ridge": "models/pricing_model_ridge.pkl",
        "rf":    "models/pricing_model_rf.pkl",
        "xgb":   "models/pricing_model_xgb.pkl",
        "lgbm":  "models/pricing_model_lgbm.pkl",
    }
    loaded = 0
    for name, path in model_files.items():
        if os.path.exists(path):
            models[name] = joblib.load(path)
            logger.info(f"  Loaded {name}")
            loaded += 1
        else:
            logger.warning(f"  {path} not found — using fallback")
            models[name] = None

    # Load vehicle encoder
    enc_path = "models/vehicle_encoder.pkl"
    if os.path.exists(enc_path):
        encoders["vehicle"] = joblib.load(enc_path)
        logger.info(f"  Vehicle types: {list(encoders['vehicle'].classes_)}")

    # Load feature list
    feat_path = "models/features.pkl"
    if os.path.exists(feat_path):
        FEATURES.extend(joblib.load(feat_path))
        logger.info(f"  Features: {FEATURES}")

    logger.info(f"Ready — {loaded}/4 models loaded")
    logger.info("=" * 55)
    yield
    models.clear()


app = FastAPI(
    title="Dynamic Pricing ML Service",
    description="Bengaluru Ola ride pricing — Ridge, RF, XGBoost, LightGBM",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ── Schemas ───────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    hour:          int   = Field(...,  ge=0,   le=23)
    isWeekend:     bool  = Field(False)
    isRushHour:    bool  = Field(False)
    vehicleType:   str   = Field("Mini")
    rideDistance:  float = Field(...,  ge=0.5, le=55.0)
    avgVtat:       float = Field(10.0, ge=1.0, le=30.0,
                                 description="Avg driver arrival time (mins)")
    avgCtat:       float = Field(15.0, ge=1.0, le=40.0,
                                 description="Avg customer arrival time (mins)")
    driverRating:  float = Field(4.5,  ge=1.0, le=5.0)
    customerRating:float = Field(4.5,  ge=1.0, le=5.0)
    # Legacy fields — kept for Spring Boot compatibility
    isRaining:     bool  = Field(False)
    isEvent:       bool  = Field(False)
    demand:        int   = Field(75,   ge=1,   le=200)
    supply:        int   = Field(35,   ge=1,   le=200)


class ModelResult(BaseModel):
    priceINR:        int
    surgeMultiplier: float
    r2Score:         float
    rmse:            float
    trainingTimeMs:  int


class PredictResponse(BaseModel):
    ridge:       ModelResult
    rf:          ModelResult
    xgb:         ModelResult
    lgbm:        ModelResult
    recommended: str
    usdToInr:    float
    timestamp:   str


# ── Feature engineering ───────────────────────────────────────────────────
def encode_vehicle(vehicle_type: str) -> int:
    enc = encoders.get("vehicle")
    if enc is None:
        return 3   # fallback: Mini
    try:
        return int(enc.transform([vehicle_type])[0])
    except ValueError:
        return int(enc.transform(["Mini"])[0])


def engineer_features(req: PredictRequest) -> np.ndarray:
    hour_sin          = np.sin(2 * np.pi * req.hour / 24)
    hour_cos          = np.cos(2 * np.pi * req.hour / 24)
    is_rush           = int(req.isRushHour or
                            (7 <= req.hour <= 9) or
                            (17 <= req.hour <= 20))
    vehicle_enc       = encode_vehicle(req.vehicleType)
    vtat_ctat_ratio   = req.avgVtat / (req.avgCtat + 1)
    demand_pressure   = req.avgCtat / (req.avgVtat + 1)

    return np.array([[
        hour_sin,
        hour_cos,
        int(req.isWeekend),
        is_rush,
        vehicle_enc,
        req.rideDistance,
        req.avgVtat,
        req.avgCtat,
        vtat_ctat_ratio,
        demand_pressure,
        req.driverRating,
        req.customerRating,
    ]])


# ── Fallback when model not loaded ────────────────────────────────────────
def fallback_predict(name: str, req: PredictRequest) -> float:
    base = req.rideDistance * 20.0   # ₹20/km base
    rush_mult = 1.4 if (7 <= req.hour <= 9 or 17 <= req.hour <= 20) else 1.0
    vehicle_mult = {
        "Auto": 0.8, "Bike": 0.7, "eBike": 0.75,
        "Mini": 1.0, "Prime Sedan": 1.3,
        "Prime Plus": 1.5, "Prime SUV": 1.7,
    }.get(req.vehicleType, 1.0)
    model_mult = {"ridge": 0.95, "rf": 1.0, "xgb": 1.02, "lgbm": 1.03}
    price = base * rush_mult * vehicle_mult * model_mult.get(name, 1.0)
    return float(np.clip(price, BASE_FARE_INR, 2000.0))


def run_model(name: str, features: np.ndarray, req: PredictRequest) -> float:
    model_data = models.get(name)
    if model_data is None:
        return fallback_predict(name, req)

    # Ridge is saved as dict with scaler
    if name == "ridge" and isinstance(model_data, dict):
        scaled = model_data["scaler"].transform(features)
        price  = float(model_data["model"].predict(scaled)[0])
    else:
        price = float(model_data.predict(features)[0])

    return float(np.clip(price, BASE_FARE_INR, 2000.0))


def build_result(name: str, price_inr: float, base_price: float) -> ModelResult:
    surge = round(price_inr / base_price, 2) if base_price > 0 else 1.0
    stats = MODEL_STATS[name]
    return ModelResult(
        priceINR        = int(round(price_inr)),
        surgeMultiplier = surge,
        r2Score         = stats["r2"],
        rmse            = stats["rmse"],
        trainingTimeMs  = stats["training_time_ms"],
    )


# ── Endpoints ─────────────────────────────────────────────────────────────
@app.post("/ml/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    start    = time.perf_counter()
    features = engineer_features(req)

    ridge_price = run_model("ridge", features, req)
    rf_price    = run_model("rf",    features, req)
    xgb_price   = run_model("xgb",  features, req)
    lgbm_price  = run_model("lgbm", features, req)

    # Base price = what Ridge predicts (most conservative)
    base_price = ridge_price if ridge_price > 0 else BASE_FARE_INR

    elapsed_ms = int((time.perf_counter() - start) * 1000)
    logger.info(
        f"Predicted in {elapsed_ms}ms — "
        f"vehicle={req.vehicleType}, dist={req.rideDistance}km, "
        f"hour={req.hour} — LGBM=₹{int(lgbm_price)}"
    )

    return PredictResponse(
        ridge       = build_result("ridge", ridge_price, base_price),
        rf          = build_result("rf",    rf_price,    base_price),
        xgb         = build_result("xgb",   xgb_price,   base_price),
        lgbm        = build_result("lgbm",  lgbm_price,  base_price),
        recommended = "lgbm",
        usdToInr    = 92.88,
        timestamp   = datetime.now(timezone.utc).isoformat(),
    )


@app.get("/health")
def health():
    loaded = [k for k, v in models.items() if v is not None]
    return {
        "status":         "UP",
        "modelsLoaded":   loaded,
        "modelsTotal":    4,
        "datasetSource":  "Bengaluru Ola.csv",
        "vehicleTypes":   list(encoders["vehicle"].classes_)
        if "vehicle" in encoders else [],
    }


@app.get("/")
def root():
    return {
        "service":  "Dynamic Pricing ML Service",
        "version":  "2.0.0",
        "dataset":  "Bengaluru Ola — 33,484 real rides",
        "endpoints": ["/ml/predict", "/health"],
    }