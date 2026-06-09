# Grafinet Backend

FastAPI backend for IP routing lookups, map point responses, and rule-based anomaly detection.

## Run

1. Create virtual environment.
2. Install dependencies:
   - pip install -r requirements.txt
3. Start server:
   - uvicorn app.main:app --reload --port 8000

## Endpoints

- GET /health
- GET /api/ip/{ip}
- GET /api/map/point/{ip}
