# Grafinet: Internet Routing Visualization System

Grafinet is a web-based system that visualizes internet routing information from IPNetDB datasets. Users can query an IP address, inspect ASN and prefix ownership, view routing location on a world map, and check simple route anomaly rules.

## Project Structure

- backend: FastAPI API for IP lookup and map point responses
- frontend: React + Leaflet web UI
- docs/sprint-1: sprint plan and execution documents

## Installation

### Backend

1. Open a terminal in backend
2. Create and activate a virtual environment
3. Install dependencies:
   - pip install -r requirements.txt
4. Run API:
   - uvicorn app.main:app --reload --port 8000

### Frontend

1. Open a second terminal in frontend
2. Install dependencies:
   - npm install
3. Run web app:
   - npm run dev

## Usage

1. Start backend on port 8000
2. Start frontend on port 5173
3. Open the frontend URL in browser
4. Search for IPs such as 8.8.8.8 or 1.1.1.1
5. Review ASN, prefix, and anomaly details in the panel and map popup

## Contributors

- arison99

## Attribution

Internet information provided by IPNetDB.com
