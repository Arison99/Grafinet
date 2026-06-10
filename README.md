# Grafinet: Internet Routing Visualization System

Grafinet is a full-stack web application for exploring internet routing data. It allows users to look up IP addresses, inspect Autonomous System (ASN) ownership, view route context on an interactive world map, and review routing risk signals (for example bogon and RPKI-related indicators).

## Project Description

This project was developed for Software Evolution coursework to demonstrate practical use of:

- Incremental development through meaningful commits
- Branching and pull request workflows
- Issue tracking and milestone-based planning
- Ongoing feature evolution across backend and frontend modules

Core stack:

- Backend: FastAPI (Python)
- Frontend: React + Vite + Leaflet + Tailwind CSS
- Routing data: IPNetDB MMDB datasets

## Component Documentation

- Backend documentation: [backend/README.md](backend/README.md)
- Frontend documentation: [frontend/README.md](frontend/README.md)

## Installation Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm 9+

### 1) Clone Repository

```bash
git clone https://github.com/Arison99/Grafinet.git
cd Grafinet
```

### 2) Backend Setup

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Run backend:

```bash
uvicorn app.main:app --reload --port 8000
```

### 3) Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Usage Instructions

1. Start backend (`http://localhost:8000`) and frontend (`http://localhost:5173`).
2. Open the app in your browser and authenticate.
3. Run IP lookups such as:
   - `8.8.8.8`
   - `1.1.1.1`
   - `9.9.9.9`
4. Review returned routing details:
   - ASN number and organization
   - Prefix and allocation context
   - Map location and route hop visualization
   - Route/anomaly indicators
5. Optional: run country ASN search and route simulation to explore cross-country peering scenarios.

## Contributors

- arison99

## Attribution

Internet information provided by IPNetDB.com

## Merge Conflict Resolution Process

1. Branches used: `conflict-a` and `conflict-b`
2. File with conflict: `README.md`
3. Conflict trigger: overlapping edits in usage guidance
4. Resolution: merged both intents into a single verified instruction flow
5. Verification: conflict markers removed and README rendered correctly after commit
