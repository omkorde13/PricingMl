# 🚀 Complete Full-Stack Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the entire PricingML stack (FastAPI ML Service, Spring Boot Backend, React Frontend, PostgreSQL, and Redis) using Docker Compose.

---

## Prerequisites

- **Docker**: [Install Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker Compose)
- **Git**: For cloning the repository
- **4GB+ RAM**: Minimum for comfortable operation
- **20GB+ Disk Space**: For images and volumes
- **Ports Available**: 5432, 6379, 8000, 8080, 80

---

## Quick Start (5 minutes)

### 1. Clone and Navigate

```bash
git clone https://github.com/omkorde13/PricingMl.git
cd PricingMl
git checkout deployment/docker-compose-setup
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values (optional for local development)
# nano .env  # or use your preferred editor
```

### 3. Start All Services

```bash
# Build and start all containers
docker-compose up -d

# Check service status
docker-compose ps
```

### 4. Verify Deployment

```bash
# Check ML Service
curl http://localhost:8000/health

# Check Backend
curl http://localhost:8080/api/health

# Open Frontend
open http://localhost  # macOS
# or: start http://localhost  # Windows
# or: xdg-open http://localhost  # Linux
```

---

## Detailed Setup Instructions

### Step 1: Clone Repository

```bash
git clone https://github.com/omkorde13/PricingMl.git
cd PricingMl
git fetch origin deployment/docker-compose-setup
git checkout deployment/docker-compose-setup
```

### Step 2: Create Environment File

```bash
# Copy example to .env
cp .env.example .env
```

**Update `.env` with your values:**

```env
# For local development (default values work)
DB_PASSWORD=your-secure-password
REDIS_PASSWORD=your-secure-password
JWT_SECRET=generate-a-256-bit-secret-for-production

# For production
CORS_ORIGINS=https://your-domain.com
VITE_API_BASE_URL=https://your-api-domain.com
```

### Step 3: Ensure ML Models Are Trained

```bash
# Check if models exist
ls ml-service/models/

# If not, train them first (on local machine or in container)
cd ml-service
python -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate on Windows
pip install -r requirements.txt
python train_models.py
cd ..
```

### Step 4: Build Docker Images

```bash
# Build all images
docker-compose build

# Or rebuild without cache
docker-compose build --no-cache
```

### Step 5: Start Services

```bash
# Start in background
docker-compose up -d

# Or start in foreground (to see logs)
docker-compose up
```

### Step 6: Monitor Services

```bash
# Check status
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f ml-service
docker-compose logs -f frontend

# Follow specific service in real-time
docker-compose logs -f postgres  # Database
docker-compose logs -f redis     # Cache
```

### Step 7: Verify Connectivity

```bash
# Test ML Service
curl -X GET http://localhost:8000/health
# Expected: {"status": "UP", "models_loaded": 4}

# Test Backend
curl -X GET http://localhost:8080/api/health
# Expected: {"status":"UP","service":"pricing-backend","mlConnected":true,"dbConnected":true}

# Test Database Connection
docker exec pricing-postgres psql -U postgres -d pricing_db -c "SELECT 1;"

# Test Redis Connection
docker exec pricing-redis redis-cli -a redis123 ping
# Expected: PONG
```

### Step 8: Test Prediction Endpoint

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

### Step 9: Access Dashboard

Open your browser and navigate to:
- **Frontend**: http://localhost
- **Backend Swagger**: http://localhost:8080/swagger-ui.html
- **ML Service Docs**: http://localhost:8000/docs

---

## Service Management

### Stop All Services

```bash
docker-compose down
```

### Stop with Volume Cleanup

```bash
# Remove volumes too (loses database data)
docker-compose down -v
```

### Restart Services

```bash
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### View Service Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend -f

# Last 100 lines
docker-compose logs --tail=100

# Since specific time
docker-compose logs --since 2024-01-15T14:00:00
```

### Execute Commands in Container

```bash
# PostgreSQL
docker exec -it pricing-postgres psql -U postgres -d pricing_db

# Redis CLI
docker exec -it pricing-redis redis-cli -a redis123

# Backend shell
docker exec -it pricing-backend sh

# Frontend shell
docker exec -it pricing-frontend sh
```

---

## Database Management

### Access PostgreSQL

```bash
# Interactive psql session
docker exec -it pricing-postgres psql -U postgres -d pricing_db

# Useful commands inside psql:
# \dt                    - List all tables
# SELECT * FROM predictions;  - View prediction logs
# \q                     - Exit
```

### Backup Database

```bash
docker exec pricing-postgres pg_dump -U postgres -d pricing_db > backup.sql
```

### Restore Database

```bash
docker exec -i pricing-postgres psql -U postgres -d pricing_db < backup.sql
```

### Clear Database

```bash
docker exec -it pricing-postgres psql -U postgres -d pricing_db -c "DROP DATABASE pricing_db; CREATE DATABASE pricing_db;"
```

---

## Redis Cache Management

### Access Redis CLI

```bash
docker exec -it pricing-redis redis-cli -a redis123
```

### Useful Redis Commands

```bash
# Inside redis-cli:
PING                    # Check connection
KEYS *                  # List all keys
GET key_name            # Get value
FLUSHALL                # Clear all cache
DBSIZE                  # Number of keys
```

### Monitor Redis

```bash
docker exec -it pricing-redis redis-cli -a redis123 MONITOR
```

---

## Production Deployment

### Security Checklist

- [ ] Generate strong passwords (32+ characters)
  ```bash
  openssl rand -base64 32
  ```
- [ ] Generate JWT secret
  ```bash
  openssl rand -hex 128  # 256-bit in hex
  ```
- [ ] Set appropriate CORS origins
- [ ] Enable SSL/TLS certificates
- [ ] Use environment-specific `.env` files
- [ ] Set up backup strategy for PostgreSQL
- [ ] Configure monitoring and logging

### Update .env for Production

```env
# .env.production
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE
REDIS_PASSWORD=YOUR_SECURE_PASSWORD_HERE
JWT_SECRET=YOUR_SECURE_JWT_SECRET_HERE

# Update domains
CORS_ORIGINS=https://pricing.example.com
VITE_API_BASE_URL=https://api.pricing.example.com

# Increase resources if needed
BACKEND_PORT=8080
FRONTEND_PORT=443
```

### Deploy to Server

```bash
# SSH into server
ssh user@your-server.com

# Clone repository
git clone https://github.com/omkorde13/PricingMl.git
cd PricingMl
git checkout deployment/docker-compose-setup

# Create .env with production values
nano .env

# Start with production compose file
docker-compose up -d

# Verify
docker-compose ps
curl https://your-domain.com/api/health
```

### Enable SSL/TLS with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Update frontend nginx config to use SSL
# See: frontend/nginx.conf (add ssl directives)
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs service-name

# Common issues:
# - Port already in use: Change port in .env
# - Insufficient disk space: Clean up Docker: docker system prune
# - Models not found: Train models first
```

### Connection Refused Errors

```bash
# Ensure all services are healthy
docker-compose ps

# Check if services are listening
docker exec pricing-backend netstat -tlnp | grep 8080
docker exec pricing-ml-service netstat -tlnp | grep 8000
```

### Database Connection Errors

```bash
# Check PostgreSQL
docker exec pricing-postgres pg_isready
docker logs pricing-postgres

# Verify credentials in .env
docker exec -it pricing-postgres psql -U postgres -d pricing_db
```

### Redis Connection Errors

```bash
# Test connection
docker exec pricing-redis redis-cli -a redis123 ping

# Check password
docker logs pricing-redis | grep password
```

### Out of Memory

```bash
# Increase Docker memory limit
# Docker Desktop: Preferences → Resources → Memory (increase slider)

# Check current usage
docker stats

# Monitor while running
docker-compose up &
watch docker stats
```

---

## Performance Optimization

### Enable Resource Limits

```yaml
# In docker-compose.yml, add:
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Enable Caching

```bash
# Already configured in docker-compose.yml
# Redis TTL: 5 minutes (configurable in backend)
```

### Database Optimization

```bash
# Connect and optimize
docker exec -it pricing-postgres psql -U postgres -d pricing_db

# Inside psql:
VACUUM;
ANALYZE;
CREATE INDEX ON predictions(created_at);
```

---

## Monitoring & Logging

### View Real-time Metrics

```bash
docker stats
```

### Setup Log Rotation

```bash
# Create /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# Restart Docker
sudo systemctl restart docker
```

### Export Logs

```bash
# Export all logs
docker-compose logs > logs.txt

# Export specific service
docker-compose logs backend > backend.log
```

---

## Cleanup

### Remove All Containers

```bash
docker-compose down
```

### Remove Volumes (WARNING: Deletes data)

```bash
docker-compose down -v
```

### Remove Images

```bash
docker-compose down --rmi all
```

### Clean Up Everything

```bash
docker system prune -a
```

---

## Support & Additional Resources

- **Docker Docs**: https://docs.docker.com/
- **Docker Compose Docs**: https://docs.docker.com/compose/
- **Project README**: See root `README.md`
- **GitHub Issues**: Report problems via GitHub

---

**Happy Deploying! 🚀**
