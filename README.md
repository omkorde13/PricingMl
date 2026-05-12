# 🚖 PricingML — Dynamic Ride Pricing Engine

> **ML-powered dynamic pricing for Bengaluru Ola rides** — 4 models, real dataset, full-stack deployment.

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?logo=springboot)](https://spring.io)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io)

---

## 📋 What Is This?

PricingML is a production-style, three-tier web application that predicts Ola cab fares in real time using **four machine learning models** trained on **33,484 actual Bengaluru rides**. You enter ride conditions (time, distance, vehicle type, demand signals) and instantly see price predictions from all four models side by side, complete with accuracy metrics and surge multipliers.

**Built for**: data science portfolios, ML system design study, and anyone learning how to connect a Python ML backend to a Java API and a React dashboard.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         BROWSER                             │
│   React 18 + TypeScript + Tailwind + Recharts + Zustand     │
│                    localhost:5173                            │
└────────────────────────┬────────────────────────────────────┘
                         │  HTTP (Axios)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Spring Boot 3 Backend (Java)                   │
│   REST API · JWT Auth · Redis Cache · PostgreSQL Logging    │
│                    localhost:8080                            │
└────────────────────────┬────────────────────────────────────┘
                         │  HTTP (WebClient)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               FastAPI ML Service (Python)                   │
│   Ridge · Random Forest · XGBoost · LightGBM (recommended) │
│                    localhost:8000                            │
└─────────────────────────────────────────────────────────────┘
                         │  read at startup
                         ▼
                  models/*.pkl   ←   train_models.py
                  Bengaluru Ola.csv (33,484 rides)
```

---

## 🤖 ML Models

| Model | R² Score | RMSE (₹) | Training Time | Notes |
|-------|----------|-----------|--------------|-------|
| Ridge Regression | baseline | highest | 1 ms | Linear, interpretable |
| Random Forest | good | medium | 820 ms | 100 trees, no overfitting |
| XGBoost | better | lower | 290 ms | Gradient boosted trees |
| **LightGBM** ⭐ | **0.947** | **₹73.4** | **95 ms** | **Recommended for production** |

### Features used for prediction
- **Time**: hour (cyclical sin/cos encoding), weekend flag, rush-hour flag (7–9 AM, 5–8 PM)
- **Ride**: distance (km), vehicle type (Auto / Bike / eBike / Mini / Prime Sedan / Prime Plus / Prime SUV)
- **Demand signals**: Avg VTAT (driver arrival time), Avg CTAT (customer arrival time), their ratio and pressure score
- **Ratings**: driver rating, customer rating

### Dataset
`Bengaluru Ola.csv` — 33,484 real Bengaluru Ola rides with booking timestamps, vehicle types, VTAT, CTAT, and booking value in ₹INR.

---

## 🖥️ Frontend Features

- **Live prediction panel** — tune every parameter and get instant prices from all 4 models
- **Model cards** — price in ₹, surge multiplier, R² and RMSE at a glance
- **Hourly simulation chart** — see how all 4 models price across 24 hours
- **Vehicle price chart** — compare fares by vehicle type for your chosen distance
- **Feature importance chart** — LightGBM's top features ranked
- **Accuracy table** — side-by-side R², RMSE, and training speed
- **Health badge** — polls Spring Boot `/api/health` every 30s

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Zustand, Axios |
| Backend | Spring Boot 3, Java 21 (virtual threads), Spring Security + JWT, Spring Data JPA |
| Database | PostgreSQL 16 (prediction logs) |
| Cache | Redis 7 (5-minute TTL on predictions) |
| ML Service | FastAPI, scikit-learn, XGBoost, LightGBM, joblib, Uvicorn |

---

## 🚀 Deployment — Step by Step

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.10+ | [python.org](https://python.org) |
| Java JDK | 21 | [adoptium.net](https://adoptium.net) |
| Maven | 3.9+ | bundled (`mvnw`) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| PostgreSQL | 15+ | [postgresql.org](https://postgresql.org) |
| Redis | 7+ | [redis.io](https://redis.io) |

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/PricingMl.git
cd PricingMl
```

---

### Step 2 — Train the ML models

```bash
cd ml-service

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train all 4 models (writes to models/*.pkl)
python train_models.py
```

You will see output like:
```
Ridge  — R²: 0.812   RMSE: ₹142.3   Time:   1ms
RF     — R²: 0.931   RMSE: ₹ 86.1   Time: 820ms
XGBost — R²: 0.941   RMSE: ₹ 79.2   Time: 290ms
LightGB— R²: 0.947   RMSE: ₹ 73.4   Time:  95ms
✅ All models saved to models/
```

---

### Step 3 — Start the ML service

```bash
# Still inside ml-service/ with venv active
uvicorn main:app --reload --port 8000
```

Verify at [http://localhost:8000/health](http://localhost:8000/health) — should return `"status": "UP"` with 4 models loaded.

---

### Step 4 — Set up PostgreSQL

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE pricing_db;
\q
```

Then update `backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/pricing_db
    username: postgres
    password: YOUR_PASSWORD   # change this
```

---

### Step 5 — Start Redis

```bash
# macOS / Linux
redis-server

# Windows (with WSL or Redis installer)
redis-server

# Verify
redis-cli ping   # should reply: PONG
```

---

### Step 6 — Start the Spring Boot backend

```bash
cd backend
./mvnw spring-boot:run        # Linux/macOS
mvnw.cmd spring-boot:run      # Windows
```

The backend starts on **http://localhost:8080**.

Verify:
```bash
curl http://localhost:8080/api/health
# {"status":"UP","service":"pricing-backend","mlConnected":true,"dbConnected":true}
```

---

### Step 7 — Start the React frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — the full dashboard loads.

---

### Step 8 — Test a prediction (curl)

```bash
curl -X POST http://localhost:8080/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "hour": 8,
    "isWeekend": false,
    "isRushHour": true,
    "vehicleType": "Prime Sedan",
    "rideDistance": 12.5,
    "avgVtat": 6.0,
    "avgCtat": 18.0,
    "driverRating": 4.7,
    "customerRating": 4.5,
    "isRaining": false,
    "isEvent": false,
    "demand": 90,
    "supply": 30
  }'
```

---

## 🌐 Production Deployment (Optional)

### Environment variables to set in production

```bash
# Backend
JWT_SECRET=your-256-bit-production-secret
DB_URL=jdbc:postgresql://your-db-host:5432/pricing_db
DB_PASSWORD=your-db-password
REDIS_HOST=your-redis-host
ML_SERVICE_URL=http://your-ml-service-host:8000
CORS_ORIGINS=https://your-frontend-domain.com

# Frontend (.env.production)
VITE_API_BASE_URL=https://your-backend-domain.com
```

### Docker (quick single-machine setup)

```dockerfile
# ml-service/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# backend/Dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline -q
COPY src src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

---

## 📁 Project Structure

```
PricingMl/
├── ml-service/                   # Python / FastAPI
│   ├── main.py                   # API endpoints + feature engineering
│   ├── train_models.py           # Train all 4 models from CSV
│   ├── requirements.txt
│   ├── Bengaluru Ola.csv         # Raw dataset (33,484 rides)
│   └── models/
│       ├── pricing_model_ridge.pkl
│       ├── pricing_model_rf.pkl
│       ├── pricing_model_xgb.pkl
│       ├── pricing_model_lgbm.pkl
│       ├── vehicle_encoder.pkl
│       └── features.pkl
│
├── backend/                      # Java / Spring Boot
│   └── src/main/java/com/pricing/
│       ├── controller/           # REST endpoints
│       ├── service/              # ML proxy + business logic
│       ├── dto/                  # Request/Response records
│       ├── model/                # JPA entities
│       └── config/               # Security, CORS, Redis, JWT
│
└── frontend/                     # React / TypeScript / Vite
    └── src/
        ├── components/           # Dashboard, ModelCards, Charts, etc.
        ├── store/                # Zustand global state
        ├── api/                  # Axios API client
        └── types/                # TypeScript interfaces
```

---

## 🗺️ API Reference

### ML Service (port 8000)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service info |
| GET | `/health` | Model load status |
| POST | `/ml/predict` | Get predictions from all 4 models |

### Spring Boot Backend (port 8080)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/predict` | Proxy to ML service + log to PostgreSQL |
| GET | `/api/health` | Backend + ML connectivity check |
| GET | `/api/stats` | Total predictions + average price from DB |
| DELETE | `/api/cache` | Flush Redis prediction cache |

---

## 🔧 Common Issues

**`models/*.pkl not found`** → Run `python train_models.py` inside `ml-service/` first.

**`Connection refused` on port 8000** → ML service isn't running. Start with `uvicorn main:app --port 8000`.

**PostgreSQL auth error** → Check username/password in `application.yml`. Make sure `pricing_db` database exists.

**Redis connection error** → Start Redis with `redis-server`. Backend falls back gracefully but caching won't work.

**CORS error in browser** → Verify `cors.allowed-origins` in `application.yml` matches your frontend URL exactly (including port).

---

## 📄 License

MIT — free to use, modify, and deploy.
