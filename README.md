# THE UNKNOWN ARCHIVE

**Make the unknown understandable.**

An interactive world mysteries and scientific discovery platform inspired by modern scientific museums and documentary archives. Built with React, Vite, TypeScript, Tailwind CSS, Framer Motion, MapLibre GL JS, Chart.js, Three.js, Python FastAPI, and a PostgreSQL + PostGIS geospatial schema.

## Project Structure

- `frontend/` — React + TypeScript + Vite editorial web application
  - `src/pages/` — Home, Explore, Categories, Global Map (MapLibre GL JS), Investigation Dossiers (16 complete 10-section investigations), Research Library, About
  - `src/components/` — Timeline Explorer, Theory Comparison, Chart.js scientific charts, Three.js 3D models, Grounded AI Research Assistant, Global Search (`Ctrl+K`)
  - `src/data/` — Verified investigations, primary records, peer-reviewed studies, and real coordinates
- `backend/` — Python FastAPI REST API + PostgreSQL/PostGIS schema (`app/db/schema.sql`, `app/db/models.py`, `app/db/seed.py`)
- `scripts/` — Artwork generator and canonical archive seed exporter

## Running Locally

### 1. Start the Python FastAPI Backend

```powershell
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

API docs available at `http://127.0.0.1:8000/docs`.

Optional PostgreSQL + PostGIS connection:

```powershell
$env:DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/unknown_archive"
python -m app.db.seed
```

### 2. Start the Frontend Dev Server

```powershell
cd frontend
npm run dev
```

Open `http://127.0.0.1:5173`.
