"""
Dynamic Pricing — Model Training Script (Real Dataset)
Uses: Bengaluru Ola.csv

Usage:
    python train_models.py

Output:
    models/pricing_model_ridge.pkl
    models/pricing_model_rf.pkl
    models/pricing_model_xgb.pkl
    models/pricing_model_lgbm.pkl
    models/features.pkl
    models/vehicle_encoder.pkl
"""

import numpy as np
import pandas as pd
import joblib
import os
import time
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import r2_score, mean_squared_error
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor

os.makedirs("models", exist_ok=True)

print("=" * 55)
print("Dynamic Pricing — Training on Bengaluru Ola Dataset")
print("=" * 55)

# ── Load dataset ──────────────────────────────────────────────────────────
print("\nLoading dataset...")
df = pd.read_csv("Bengaluru Ola.csv")
print(f"  Total records    : {len(df)}")

# Keep only successful rides (have a booking value)
df = df[df["Booking Status"] == "Success"].copy()
print(f"  Successful rides : {len(df)}")

# ── Parse date and time ───────────────────────────────────────────────────
df["datetime"]    = pd.to_datetime(
    df["Date"] + " " + df["Time"],
    format="%d/%m/%Y %H:%M:%S",
    errors="coerce"
)
df["hour"]        = df["datetime"].dt.hour
df["day_of_week"] = df["datetime"].dt.dayofweek   # 0=Mon, 6=Sun
df["is_weekend"]  = (df["day_of_week"] >= 5).astype(int)

# ── Encode vehicle type ───────────────────────────────────────────────────
vehicle_encoder = LabelEncoder()
df["vehicle_encoded"] = vehicle_encoder.fit_transform(
    df["Vehicle Type"].fillna("Mini")
)
joblib.dump(vehicle_encoder, "models/vehicle_encoder.pkl")
print(f"  Vehicle types    : {list(vehicle_encoder.classes_)}")

# ── Feature engineering ───────────────────────────────────────────────────
# Cyclical time encoding
df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)

# VTAT = driver arrival time → proxy for supply (high = low supply)
# CTAT = customer arrival time → proxy for demand
df["vtat_ctat_ratio"] = df["Avg VTAT"] / (df["Avg CTAT"] + 1)
df["demand_pressure"]  = df["Avg CTAT"] / (df["Avg VTAT"] + 1)

# Rush hour flag
df["is_rush_hour"] = (
        ((df["hour"] >= 7) & (df["hour"] <= 9)) |
        ((df["hour"] >= 17) & (df["hour"] <= 20))
).astype(int)

# ── Drop rows with missing values ─────────────────────────────────────────
df = df.dropna(subset=[
    "Booking Value", "Ride Distance", "Avg VTAT", "Avg CTAT",
    "Driver Ratings", "Customer Rating", "hour"
])
print(f"  After cleaning   : {len(df)} rows")

# ── Features and target ───────────────────────────────────────────────────
FEATURES = [
    "hour_sin",
    "hour_cos",
    "is_weekend",
    "is_rush_hour",
    "vehicle_encoded",
    "Ride Distance",
    "Avg VTAT",
    "Avg CTAT",
    "vtat_ctat_ratio",
    "demand_pressure",
    "Driver Ratings",
    "Customer Rating",
]

TARGET = "Booking Value"

X = df[FEATURES].values
y = df[TARGET].values

print(f"\n  Features used    : {len(FEATURES)}")
print(f"  Price range      : ₹{y.min():.0f} – ₹{y.max():.0f}")
print(f"  Average price    : ₹{y.mean():.0f}")

# ── Train/test split ──────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

scaler         = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)

print("\nTraining models...\n")


def evaluate(name, y_true, y_pred, elapsed_ms):
    r2   = r2_score(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mae  = np.mean(np.abs(y_true - y_pred))
    print(f"  {name:<22}  R²={r2:.4f}  "
          f"RMSE=₹{rmse:.1f}  MAE=₹{mae:.1f}  Time={elapsed_ms}ms")
    return r2, rmse


# Ridge
t = time.time()
ridge = Ridge(alpha=10.0)
ridge.fit(X_train_scaled, y_train)
elapsed = int((time.time() - t) * 1000)
evaluate("Ridge Regression", y_test, ridge.predict(X_test_scaled), elapsed)
joblib.dump({"model": ridge, "scaler": scaler}, "models/pricing_model_ridge.pkl")

# Random Forest
t = time.time()
rf = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)
elapsed = int((time.time() - t) * 1000)
evaluate("Random Forest", y_test, rf.predict(X_test), elapsed)
joblib.dump(rf, "models/pricing_model_rf.pkl")

# XGBoost
t = time.time()
xgb = XGBRegressor(
    n_estimators=300, max_depth=6, learning_rate=0.05,
    subsample=0.8, colsample_bytree=0.8,
    random_state=42, verbosity=0
)
xgb.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
elapsed = int((time.time() - t) * 1000)
evaluate("XGBoost", y_test, xgb.predict(X_test), elapsed)
joblib.dump(xgb, "models/pricing_model_xgb.pkl")

# LightGBM
t = time.time()
lgbm = LGBMRegressor(
    n_estimators=300, max_depth=6, learning_rate=0.05,
    subsample=0.8, colsample_bytree=0.8,
    random_state=42, verbose=-1
)
lgbm.fit(X_train, y_train, eval_set=[(X_test, y_test)])
elapsed = int((time.time() - t) * 1000)
evaluate("LightGBM", y_test, lgbm.predict(X_test), elapsed)
joblib.dump(lgbm, "models/pricing_model_lgbm.pkl")

# Save feature list
joblib.dump(FEATURES, "models/features.pkl")

# Feature importance
importances = pd.Series(lgbm.feature_importances_, index=FEATURES)
print("\nTop features (LightGBM):")
for feat, imp in importances.sort_values(ascending=False).items():
    bar = "█" * int(imp / importances.max() * 20)
    print(f"  {feat:<22}  {bar}  {imp:.0f}")

print("\n" + "=" * 55)
print("All models saved to models/*.pkl")
print("=" * 55)
print("\nNext: uvicorn main:app --reload --port 8000")