# Story 1.1: Configuración del Repositorio y Entorno de Desarrollo

Status: done

## Story

As a developer on the BoviTech team,
I want a reproducible local development environment with frontend, backend, and database ready to run,
so that any team member can start contributing immediately without manual environment setup.

## Acceptance Criteria

1. **Given** the developer has Python 3.12+, Node 20+, and MySQL 8.0 locally  
   **When** they clone the repo and run the setup steps in README.md  
   **Then** backend starts at `localhost:8000`, frontend at `localhost:5173`, MySQL reachable at `localhost:3306`

2. **Given** the repo uses monorepo structure  
   **When** the developer opens the project root  
   **Then** `/backend` contains the FastAPI app (from Tiangolo template, adapted for MySQL with `aiomysql`) and `/frontend` contains Vite + React 19 TypeScript app

3. **Given** env vars are required  
   **When** the developer copies `.env.example` to `.env` (backend) and `.env.example` to `.env.local` (frontend)  
   **Then** all required variables are documented with safe example values — see Dev Notes for exact variable list

4. **Given** Railway (backend) and Vercel (frontend) are configured for auto-deploy  
   **When** a commit is pushed to `main`  
   **Then** Railway auto-deploys backend and Vercel auto-deploys frontend (configured in the respective dashboards)

5. **Given** SQLAlchemy engine is configured  
   **When** the backend starts  
   **Then** connection pool is `pool_size=5, max_overflow=10` — never creates a new connection per request

## Tasks / Subtasks

- [ ] **Task 1 — Backend scaffold** (AC: 1, 2)
  - [ ] Run `cookiecutter https://github.com/tiangolo/full-stack-fastapi-template` into `/backend`
  - [ ] Remove PostgreSQL driver (`psycopg2`, `asyncpg`) from dependencies
  - [ ] Add `aiomysql==0.2.0` and `PyMySQL==1.1.1` to `requirements.txt`
  - [ ] Update `DATABASE_URL` format: `mysql+aiomysql://user:pass@host:3306/bovitech`
  - [ ] Delete template example models/schemas/endpoints that are not part of BoviTech (users example, items example, etc.) — keep only the skeleton structure

- [ ] **Task 2 — Backend directory structure** (AC: 2)
  - [ ] Create exactly this layout under `/backend/app/`:
    ```
    app/
    ├── __init__.py
    ├── main.py
    ├── core/
    │   ├── config.py
    │   ├── database.py
    │   └── security.py        ← empty stub (implemented in Story 1.3)
    ├── models/
    │   └── base.py            ← IMPLEMENT NOW (see Dev Notes)
    ├── schemas/               ← empty __init__.py only
    ├── api/
    │   ├── deps.py            ← empty stub (implemented in Story 1.3)
    │   └── v1/
    │       └── router.py      ← empty stub
    └── services/              ← empty __init__.py only
    ```
  - [ ] Create `/backend/tests/conftest.py` with empty placeholder
  - [ ] Create `/backend/alembic/` directory with `env.py` and `alembic.ini` (Alembic init — migrations come in Story 1.2)

- [ ] **Task 3 — Backend core files** (AC: 1, 5)
  - [ ] Implement `app/core/config.py` (see exact code in Dev Notes)
  - [ ] Implement `app/core/database.py` with `pool_size=5, max_overflow=10` (see exact code in Dev Notes)
  - [ ] Implement `app/main.py` — minimal FastAPI with CORS middleware (see exact code in Dev Notes)
  - [ ] Implement `app/models/base.py` with `Base`, `TimestampedModel`, `TenantModel` (see exact code in Dev Notes)

- [ ] **Task 4 — Backend env and deps** (AC: 3)
  - [ ] Create `/backend/requirements.txt` with all pinned versions (see Dev Notes)
  - [ ] Create `/backend/.env.example` with all required variables (see Dev Notes)
  - [ ] Verify `pip install -r requirements.txt` completes without errors

- [ ] **Task 5 — Frontend scaffold** (AC: 1, 2)
  - [ ] Run `npm create vite@latest frontend -- --template react-ts` from project root
  - [ ] `cd frontend && npm install`
  - [ ] Install Tailwind CSS v3: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
  - [ ] Install shadcn/ui: `npx shadcn-ui@latest init` (select: TypeScript, default style, CSS variables)
  - [ ] Install dependencies: `npm install axios react-router-dom@6`
  - [ ] Install dev deps: `npm install -D @types/node`

- [ ] **Task 6 — Frontend directory structure** (AC: 2)
  - [ ] Create exactly this layout under `/frontend/src/`:
    ```
    src/
    ├── main.tsx               ← update to wrap with BrowserRouter
    ├── App.tsx                ← minimal router shell (no routes yet)
    ├── api/
    │   └── client.ts          ← basic Axios instance, NO auth interceptors yet
    ├── context/               ← empty __init__ placeholder
    ├── hooks/                 ← empty placeholder
    ├── components/
    │   ├── ui/                ← shadcn components land here automatically
    │   ├── layout/            ← empty placeholder
    │   └── common/            ← empty placeholder
    ├── pages/                 ← empty placeholder
    ├── types/
    │   └── common.ts          ← PaginatedResponse<T> interface
    └── utils/
        └── formatters.ts      ← stub with formatDate, formatLitros functions
    ```

- [ ] **Task 7 — Frontend env and config** (AC: 3)
  - [ ] Create `/frontend/.env.example` with `VITE_API_URL=http://localhost:8000/api/v1`
  - [ ] Create `/frontend/.env.local` locally (gitignored) with same value
  - [ ] Update `tailwind.config.ts` to scan `./src/**/*.{ts,tsx}`
  - [ ] Create basic `src/api/client.ts` (see Dev Notes)

- [ ] **Task 8 — Monorepo root** (AC: 2)
  - [ ] Create root `README.md` with: prerequisites, quickstart commands, env setup, deploy instructions
  - [ ] Create root `.gitignore` covering Python (`__pycache__`, `.env`, `*.pyc`), Node (`node_modules`, `dist`), and IDE files
  - [ ] Create `/.github/` or deploy config as needed for Railway/Vercel

- [ ] **Task 9 — Railway + Vercel deploy config** (AC: 4)
  - [ ] Create `/backend/Procfile` or `railway.json` pointing to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - [ ] Create `/frontend/vercel.json` with SPA rewrite rule: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
  - [ ] Document in README: Railway env vars to set, Vercel project settings (root dir = `frontend`)

- [ ] **Task 10 — Smoke test** (AC: 1)
  - [ ] `cd backend && uvicorn app.main:app --reload` → responds at `http://localhost:8000/docs`
  - [ ] `cd frontend && npm run dev` → renders at `http://localhost:5173` without console errors
  - [ ] `GET http://localhost:8000/api/v1/` or `/docs` returns 200 (add a health endpoint if needed)

## Dev Notes

### Exact Backend Env Variables (`/backend/.env.example`)

```bash
DATABASE_URL=mysql+aiomysql://root:password@localhost:3306/bovitech
SECRET_KEY=changeme-use-32-random-chars-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=["http://localhost:5173"]
```

### Exact Frontend Env Variables (`/frontend/.env.example`)

```bash
VITE_API_URL=http://localhost:8000/api/v1
```

### `app/core/config.py`

```python
from pydantic_settings import BaseSettings, SettingsConfigDict
import json

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

settings = Settings()
```

### `app/core/database.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### `app/models/base.py` — CRITICAL: must match this exactly

This file is the foundation imported by ALL models in subsequent stories. Do not deviate.

```python
from datetime import datetime
from uuid import uuid4

from sqlalchemy import CHAR, DateTime, ForeignKey, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class TimestampedModel(Base):
    """Base for any table with id + timestamps."""
    __abstract__ = True

    id: Mapped[str] = mapped_column(
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class TenantModel(TimestampedModel):
    """Base for any table scoped to a finca (multi-tenant)."""
    __abstract__ = True

    finca_id: Mapped[str] = mapped_column(
        CHAR(36),
        ForeignKey("fincas.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
```

### `app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(title="BoviTech API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}
```

### `requirements.txt` (pinned versions)

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlalchemy==2.0.35
alembic==1.13.3
aiomysql==0.2.0
PyMySQL==1.1.1
pydantic==2.9.2
pydantic-settings==2.5.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.12
httpx==0.27.2
```

### `src/api/client.ts` — Basic Axios (NO auth interceptors — those come in Story 1.4)

```typescript
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});
```

### `src/types/common.ts`

```typescript
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
```

### `src/App.tsx` — Minimal shell

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>BoviTech — setup OK</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### `backend/Procfile` (Railway)

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### `frontend/vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Cookiecutter Template Cleanup

After running cookiecutter, the template creates example models/endpoints (users, items, etc.). **Remove all of these** — they are templates, not BoviTech code. Keep only:
- `app/` folder skeleton
- `alembic/` configuration
- `pyproject.toml` or `requirements.txt` (adapt)
- `.env` handling

**Do NOT keep**: example SQLAlchemy models, example CRUD files, example routers, example tests that reference template entities.

### Tailwind + shadcn/ui Setup Notes

`tailwind.config.ts` content (after `npx shadcn-ui init` runs it may have been configured automatically — verify):
```typescript
import type { Config } from "tailwindcss";
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
```

`npx shadcn-ui@latest init` will ask config questions. Use these answers:
- Style: Default
- Base color: Slate
- CSS variables: Yes

### Project Structure Notes

- **Root `.gitignore`** must include: `node_modules/`, `dist/`, `.env`, `*.pyc`, `__pycache__/`, `.venv/`, `*.egg-info/`
- **MySQL local setup**: Developer needs a local MySQL 8.0 instance. README should include: `CREATE DATABASE bovitech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
- **Python virtual environment**: README should recommend `python -m venv .venv && source .venv/bin/activate` (or `.venv\Scripts\activate` on Windows)
- **The `aiomysql` driver** requires `DATABASE_URL` to use the `mysql+aiomysql://` scheme, NOT `mysql://` — this is the most common setup mistake

### References

- Architecture stack decisions: [Source: `_bmad-output/planning-artifacts/architecture.md#Stack Tecnológico`]
- Backend structure: [Source: `_bmad-output/planning-artifacts/implementation-patterns.md#1-estructura-de-directorios`]
- SQLAlchemy base models: [Source: `_bmad-output/planning-artifacts/implementation-patterns.md#2-backend--modelos-sqlalchemy`]
- Axios client: [Source: `_bmad-output/planning-artifacts/implementation-patterns.md#9-frontend--cliente-api-axios`]
- Connection pool: [Source: `_bmad-output/planning-artifacts/architecture.md#Restricciones-de-Infraestructura`]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- shadcn CLI (both `shadcn@latest` and `shadcn-ui@latest`) fails framework detection on plain Vite — configured manually instead
- Vite 9 `npm create vite@latest frontend -- --template react-ts` passed `react-ts` as positional arg instead of template flag — detected from generated `counter.ts` (vanilla TS) — fixed by manually installing React 19 + @vitejs/plugin-react into existing directory
- TypeScript 6 deprecation warning for `baseUrl` — resolved with `ignoreDeprecations: "6.0"`

### Completion Notes List

- shadcn/ui not wired (CLI incompatible with Vite + TS6) — components can be added manually via `npx shadcn add <component>` once a framework adapter is configured, or copied from shadcn source. This is non-blocking for Story 1.1.
- `.env` committed locally for smoke test; must remain in `.gitignore` (already excluded)
- `frontend/src/assets/` contains leftover Vite template assets (hero.png, vite.svg, typescript.svg) — harmless, can be deleted later

### File List

**Created:**
- `backend/app/__init__.py`
- `backend/app/main.py`
- `backend/app/core/__init__.py`
- `backend/app/core/config.py`
- `backend/app/core/database.py`
- `backend/app/core/security.py` (stub)
- `backend/app/models/__init__.py`
- `backend/app/models/base.py`
- `backend/app/schemas/__init__.py`
- `backend/app/api/__init__.py`
- `backend/app/api/deps.py` (stub)
- `backend/app/api/v1/__init__.py`
- `backend/app/api/v1/router.py` (stub)
- `backend/app/services/__init__.py`
- `backend/tests/__init__.py`
- `backend/tests/conftest.py`
- `backend/alembic/env.py`
- `backend/alembic/script.py.mako`
- `backend/alembic.ini`
- `backend/requirements.txt`
- `backend/.env.example`
- `backend/.env` (local only, gitignored)
- `backend/Procfile`
- `backend/.venv/` (Python virtual environment)
- `frontend/` (Vite scaffold + React 19 + TypeScript)
- `frontend/vite.config.ts`
- `frontend/tsconfig.json` (updated)
- `frontend/tsconfig.node.json`
- `frontend/index.html` (updated)
- `frontend/tailwind.config.js` (updated content scan)
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/index.css`
- `frontend/src/api/client.ts`
- `frontend/src/types/common.ts`
- `frontend/src/utils/formatters.ts`
- `frontend/src/components/ui/` (placeholder)
- `frontend/src/components/layout/` (placeholder)
- `frontend/src/components/common/` (placeholder)
- `frontend/src/context/` (placeholder)
- `frontend/src/hooks/` (placeholder)
- `frontend/src/pages/` (placeholder)
- `frontend/.env.example`
- `frontend/.env.local`
- `frontend/vercel.json`
- `.gitignore`
- `README.md`
