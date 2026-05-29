# BoviTech

Plataforma SaaS de trazabilidad bovina para fincas lecheras colombianas.

## Prerrequisitos

- Python 3.12+
- Node 20+
- MySQL 8.0

## Quickstart

### Base de datos local

```sql
CREATE DATABASE bovitech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edita .env con tus credenciales MySQL

uvicorn app.main:app --reload
# Disponible en http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
# Disponible en http://localhost:5173
```

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | `mysql+aiomysql://user:pass@localhost:3306/bovitech` — **usar `mysql+aiomysql://`, no `mysql://`** |
| `SECRET_KEY` | 32 caracteres aleatorios en producción |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` |
| `CORS_ORIGINS` | `["http://localhost:5173"]` |

### Frontend (`frontend/.env.local`)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | `http://localhost:8000/api/v1` |

## Deploy

### Railway (backend)

1. Conectar repositorio en [railway.app](https://railway.app)
2. Configurar variables de entorno en el dashboard de Railway
3. El deploy ocurre automáticamente al hacer push a `main`

Variables requeridas en Railway: `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS`, `CORS_ORIGINS`

### Vercel (frontend)

1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Configurar **Root Directory** = `frontend`
3. Variable de entorno: `VITE_API_URL` → URL del backend en Railway
4. El deploy ocurre automáticamente al hacer push a `main`
