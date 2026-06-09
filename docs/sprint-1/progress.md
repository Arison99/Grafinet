# Sprint 1 Progress

## 2026-06-09

### Phase 1: Project Build Scaffolded
Status: Complete

Completed:
- Implemented FastAPI backend structure with routes, services, models, and startup app.
- Added endpoints:
  - GET /health
  - GET /api/ip/{ip}
  - GET /api/map/point/{ip}
- Implemented rule-based anomaly detection:
  - ASN missing
  - Bogon prefix
  - Invalid RPKI route
- Added resilient MMDB loader with fallback sample data for immediate demo.
- Implemented React + Vite frontend with:
  - IP search form
  - Leaflet map and marker rendering
  - ASN/prefix/anomaly details panel
  - error and no-data states
- Added assignment-required root docs:
  - README.md
  - LICENSE
  - CONTRIBUTING.md
- Added module-level README files for backend and frontend.

Validation:
- Python compile check passed for all backend source files.
- No editor-reported syntax or lint errors in workspace.

Notes:
- MMDB fallback sample IPs currently include 8.8.8.8, 1.1.1.1, and 9.9.9.9.
- Real MMDB files can be dropped into backend/data with names:
  - ipnetdb_prefix.mmdb
  - ipnetdb_asn.mmdb

Next:
- Install dependencies and run both services locally.
- Create feature branches and incremental commits per assignment rubric.
- Prepare GitHub issues, milestone, PR flow, and merge conflict documentation.
