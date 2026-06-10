# Grafinet Backend

FastAPI backend for IP routing lookups, map point responses, route simulation, authentication, and observability.

## Project Description

The backend is responsible for:

- Reading routing and enrichment data from MMDB sources
- Resolving IP addresses to ASN, prefix, and location context
- Exposing REST endpoints for frontend workflows
- Supporting route simulation and country ASN exploration
- Recording request-level observability metrics

## Installation Instructions

1. Open terminal in the `backend` directory.
2. Create a virtual environment.
3. Activate the environment.
4. Install dependencies:
   - pip install -r requirements.txt

## Usage Instructions

1. Start the API server:
   - uvicorn app.main:app --reload --port 8000
2. Confirm API health:
   - GET /health
3. Test core endpoints (example):
   - GET /api/ip/8.8.8.8
   - GET /api/map/point/8.8.8.8

## Endpoints

- GET /health
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/ip/{ip}
- GET /api/map/point/{ip}
- GET /api/search/country/{country}
- GET /api/observability/requests
- POST /api/simulate/route

## Notes

- Keep local data files (MMDB, SQLite runtime artifacts) out of commits.
- Default API port is 8000.
