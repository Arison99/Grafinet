# Grafinet Frontend

React + Vite frontend for routing intelligence visualization with map-based exploration and simulation views.

## Project Description

The frontend provides:

- Authenticated workspace for IP routing lookups
- ASN and prefix detail panels
- Interactive map rendering with lookup and simulation modes
- Country ASN search and route simulation interactions
- Guidance pages for onboarding and governance context

## Installation Instructions

1. Open terminal in the `frontend` directory.
2. Install dependencies:
   - npm install

## Usage Instructions

1. Start development server:
   - npm run dev
2. Open the printed local URL in your browser.
3. Ensure backend API is running on port 8000.
4. Login, then run lookup, country search, or route simulation from the workspace.

## Configuration

- Optional API URL override:
   - set VITE_API_BASE_URL=http://localhost:8000/api

## Build

- Production build:
  - npm run build
