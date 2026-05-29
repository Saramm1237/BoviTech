# BoviTech — Patrones de Implementación (Step 5)

> **Propósito:** Este documento define los patrones de código obligatorios para todo el proyecto. Cualquier agente o desarrollador que escriba código para BoviTech DEBE seguir estos patrones exactamente para garantizar consistencia, seguridad multi-tenant y mantenibilidad.
>
> **Stack:** FastAPI 0.115 · SQLAlchemy 2.0 · Pydantic v2 · MySQL 8.0 · React 19 · Vite 6 · shadcn/ui · Tailwind CSS

---

## Índice

1. [Estructura de Directorios](#1-estructura-de-directorios)
2. [Backend — Modelos SQLAlchemy](#2-backend--modelos-sqlalchemy)
3. [Backend — Esquemas Pydantic](#3-backend--esquemas-pydantic)
4. [Backend — Dependencias (Auth + RBAC + Multi-tenancy)](#4-backend--dependencias-auth--rbac--multi-tenancy)
5. [Backend — Endpoints FastAPI](#5-backend--endpoints-fastapi)
6. [Backend — Manejo de Errores](#6-backend--manejo-de-errores)
7. [Backend — Migraciones Alembic](#7-backend--migraciones-alembic)
8. [Backend — Tareas en Background (Reportes)](#8-backend--tareas-en-background-reportes)
9. [Frontend — Cliente API (Axios)](#9-frontend--cliente-api-axios)
10. [Frontend — Contexto de Autenticación](#10-frontend--contexto-de-autenticación)
11. [Frontend — Hooks de datos](#11-frontend--hooks-de-datos)
12. [Frontend — Componentes con RBAC](#12-frontend--componentes-con-rbac)
13. [Frontend — Estructura de Páginas](#13-frontend--estructura-de-páginas)
14. [Frontend — Formularios](#14-frontend--formularios)
15. [Convenciones de Nombrado](#15-convenciones-de-nombrado)
16. [Checklist de Revisión](#16-checklist-de-revisión)

---

## 1. Estructura de Directorios

### Backend (`/backend`)

```
backend/
├── alembic/
│   ├── versions/          # Un archivo por migración
│   └── env.py
├── app/
│   ├── __init__.py
│   ├── main.py            # Crea FastAPI app, registra routers
│   ├── core/
│   │   ├── config.py      # Settings desde env vars (pydantic-settings)
│   │   ├── database.py    # Engine + SessionLocal + get_db()
│   │   └── security.py    # JWT encode/decode, hash password
│   ├── models/            # Un archivo por tabla SQLAlchemy
│   │   ├── base.py        # Base + TimestampedModel + TenantModel
│   │   ├── finca.py
│   │   ├── usuario.py
│   │   ├── animal.py
│   │   ├── sesion_ordeno.py
│   │   ├── registro_produccion.py
│   │   ├── registro_alimentacion.py
│   │   ├── alerta.py
│   │   └── evento_trazabilidad.py
│   ├── schemas/           # Un archivo por dominio (base/create/read)
│   │   ├── auth.py
│   │   ├── animal.py
│   │   ├── produccion.py
│   │   ├── alimentacion.py
│   │   ├── alerta.py
│   │   ├── dashboard.py
│   │   └── reporte.py
│   ├── api/
│   │   ├── deps.py        # Todas las dependencias (auth, rbac, tenant)
│   │   └── v1/
│   │       ├── router.py  # Agrega todos los sub-routers
│   │       ├── auth.py
│   │       ├── animales.py
│   │       ├── sesiones.py
│   │       ├── alimentacion.py
│   │       ├── alertas.py
│   │       ├── dashboard.py
│   │       ├── reportes.py
│   │       └── usuarios.py
│   └── services/          # Lógica de negocio reutilizable
│       ├── alert_engine.py
│       ├── dashboard.py
│       └── report_generator.py
├── tests/
│   ├── conftest.py        # Fixtures: test DB, test client, usuarios de prueba
│   └── api/
│       ├── test_auth.py
│       ├── test_animales.py
│       └── ...
├── .env.example
├── requirements.txt
└── alembic.ini
```

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx            # Router + AuthProvider
│   ├── api/               # Un archivo por dominio — solo llama a Axios
│   │   ├── client.ts      # Instancia Axios con interceptores
│   │   ├── auth.ts
│   │   ├── animales.ts
│   │   ├── produccion.ts
│   │   ├── alimentacion.ts
│   │   ├── alertas.ts
│   │   ├── dashboard.ts
│   │   └── reportes.ts
│   ├── context/
│   │   └── AuthContext.tsx # ÚNICO contexto global permitido
│   ├── hooks/             # Un hook por recurso/feature
│   │   ├── useAuth.ts
│   │   ├── useAnimales.ts
│   │   ├── useProduccion.ts
│   │   ├── useAlertas.ts
│   │   └── useDashboard.ts
│   ├── components/
│   │   ├── ui/            # Solo shadcn/ui re-exports o wrappers
│   │   ├── layout/        # AppShell, Sidebar, Header
│   │   ├── common/        # LoadingSpinner, ErrorMessage, ConfirmDialog
│   │   └── features/      # Componentes específicos por dominio
│   │       ├── animals/
│   │       ├── production/
│   │       └── alerts/
│   ├── pages/             # Una carpeta por ruta principal
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── animals/
│   │   │   ├── AnimalesPage.tsx
│   │   │   └── AnimalDetailPage.tsx
│   │   ├── production/
│   │   │   └── RegistroOrdenoPage.tsx
│   │   └── reports/
│   │       └── ReportesPage.tsx
│   ├── types/             # Interfaces TypeScript — espeja los schemas Pydantic
│   │   ├── auth.ts
│   │   ├── animal.ts
│   │   ├── produccion.ts
│   │   └── common.ts
│   └── utils/
│       ├── formatters.ts  # Fechas, números, pesos colombianos
│       └── rbac.ts        # Helpers de permisos
├── .env.example
├── index.html
├── vite.config.ts
└── tailwind.config.ts
```

---

## 2. Backend — Modelos SQLAlchemy

### 2.1 Clase Base (siempre importar desde aquí)

**Archivo:** `app/models/base.py`

```python
from datetime import datetime
from uuid import uuid4

from sqlalchemy import CHAR, DateTime, ForeignKey, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class TimestampedModel(Base):
    """Base para cualquier tabla con id + timestamps."""
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
    """Base para cualquier tabla que pertenece a una finca (multi-tenant)."""
    __abstract__ = True

    finca_id: Mapped[str] = mapped_column(
        CHAR(36),
        ForeignKey("fincas.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
```

### 2.2 Patrón de Modelo de Dominio

**Reglas:**
- Heredar de `TenantModel` para toda tabla con `finca_id`; de `TimestampedModel` solo para `fincas`
- Nombres de tabla en **snake_case plural** (`__tablename__`)
- `nullable=False` explícito en todos los campos obligatorios
- Campos opcionales de Fase 2+ con `nullable=True` y comentario `# Fase 2`
- No usar `relationship()` entre tablas de distintos tenants salvo que sea necesario

**Ejemplo — `app/models/animal.py`:**

```python
from sqlalchemy import Boolean, Date, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantModel


class Animal(TenantModel):
    __tablename__ = "animales"

    numero_arete: Mapped[str] = mapped_column(String(50), nullable=False)
    nombre: Mapped[str | None] = mapped_column(String(100), nullable=True)
    raza: Mapped[str | None] = mapped_column(String(100), nullable=True)
    fecha_nacimiento: Mapped[str | None] = mapped_column(Date, nullable=True)
    fecha_ultimo_parto: Mapped[str | None] = mapped_column(Date, nullable=True)
    rfid_tag: Mapped[str | None] = mapped_column(String(100), nullable=True)  # Fase 2
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
```

**Ejemplo — `app/models/evento_trazabilidad.py` (Append-only: SIN `updated_at`):**

```python
from datetime import datetime
from uuid import uuid4

from sqlalchemy import CHAR, DateTime, ForeignKey, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class EventoTrazabilidad(Base):
    """Append-only: no hereda TimestampedModel porque no tiene updated_at."""
    __tablename__ = "eventos_trazabilidad"

    id: Mapped[str] = mapped_column(
        CHAR(36), primary_key=True, default=lambda: str(uuid4())
    )
    finca_id: Mapped[str] = mapped_column(
        CHAR(36), ForeignKey("fincas.id"), nullable=False, index=True
    )
    animal_id: Mapped[str] = mapped_column(
        CHAR(36), ForeignKey("animales.id"), nullable=False, index=True
    )
    tipo_evento: Mapped[str] = mapped_column(String(50), nullable=False)
    datos_evento: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    responsable_id: Mapped[str] = mapped_column(
        CHAR(36), ForeignKey("usuarios.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    # NUNCA agregar updated_at — tabla append-only por diseño (ICA 017)
```

---

## 3. Backend — Esquemas Pydantic

### 3.1 Patrón de Esquema por Dominio

**Reglas:**
- Tres variantes fijas: `Base` (campos comunes) → `Create` (input del cliente) → `Read` (output al cliente)
- `Update` solo cuando el recurso admite edición parcial (PATCH)
- `Read` siempre tiene `id`, `created_at`; `model_config = ConfigDict(from_attributes=True)`
- Nunca exponer `password_hash` ni `finca_id` interno en los schemas de `Read` públicos

**Archivo:** `app/schemas/animal.py`

```python
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class AnimalBase(BaseModel):
    numero_arete: str = Field(..., min_length=1, max_length=50)
    nombre: str | None = Field(None, max_length=100)
    raza: str | None = Field(None, max_length=100)
    fecha_nacimiento: date | None = None
    fecha_ultimo_parto: date | None = None


class AnimalCreate(AnimalBase):
    pass  # Sin finca_id — se inyecta desde el token JWT


class AnimalUpdate(BaseModel):
    nombre: str | None = Field(None, max_length=100)
    raza: str | None = Field(None, max_length=100)
    fecha_nacimiento: date | None = None
    fecha_ultimo_parto: date | None = None
    activo: bool | None = None


class AnimalRead(AnimalBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    activo: bool
    created_at: datetime
    updated_at: datetime
```

### 3.2 Esquema de respuesta envuelta (lista paginada)

Para endpoints que retornan listas:

```python
from typing import Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
```

---

## 4. Backend — Dependencias (Auth + RBAC + Multi-tenancy)

**Archivo:** `app/api/deps.py`

Este es el archivo más crítico del backend. Toda la seguridad pasa por aquí.

```python
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.usuario import Usuario

security = HTTPBearer()


# ── 1. Extraer claims del JWT ─────────────────────────────────────────────────

def get_token_claims(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> dict:
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )
    return payload


# ── 2. Usuario actual (siempre disponible tras login) ────────────────────────

def get_current_user(
    claims: Annotated[dict, Depends(get_token_claims)],
    db: Annotated[Session, Depends(get_db)],
) -> Usuario:
    user = db.get(Usuario, claims["sub"])
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
    return user


# ── 3. finca_id del tenant activo (SIEMPRE desde el token, NUNCA del body) ──

def get_current_finca_id(
    claims: Annotated[dict, Depends(get_token_claims)],
) -> str:
    finca_id = claims.get("finca_id")
    if not finca_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token sin finca")
    return finca_id


# ── 4. Guards de rol ──────────────────────────────────────────────────────────

def require_propietario(
    current_user: Annotated[Usuario, Depends(get_current_user)],
) -> Usuario:
    if current_user.rol != "propietario":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el propietario puede realizar esta acción",
        )
    return current_user


def require_operario_or_propietario(
    current_user: Annotated[Usuario, Depends(get_current_user)],
) -> Usuario:
    if current_user.rol not in ("propietario", "operario"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    return current_user


# ── Aliases con Annotated para uso limpio en endpoints ───────────────────────

CurrentUser = Annotated[Usuario, Depends(get_current_user)]
CurrentFincaId = Annotated[str, Depends(get_current_finca_id)]
PropietarioOnly = Annotated[Usuario, Depends(require_propietario)]
AnyAuthUser = Annotated[Usuario, Depends(require_operario_or_propietario)]
DbSession = Annotated[Session, Depends(get_db)]
```

**Regla de oro:** `finca_id` SIEMPRE viene de `get_current_finca_id()`. Nunca del path, query param, ni body. Si un endpoint recibe `finca_id` externo, es una vulnerabilidad de seguridad.

---

## 5. Backend — Endpoints FastAPI

### 5.1 Patrón completo de router

**Archivo:** `app/api/v1/animales.py`

```python
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import AnyAuthUser, CurrentFincaId, DbSession, PropietarioOnly
from app.models.animal import Animal
from app.schemas.animal import AnimalCreate, AnimalRead, AnimalUpdate

router = APIRouter(prefix="/animales", tags=["Animales"])


# ── GET /animales — lista todos los animales de la finca ─────────────────────

@router.get("/", response_model=list[AnimalRead])
def list_animales(
    db: DbSession,
    _user: AnyAuthUser,
    finca_id: CurrentFincaId,
    solo_activos: bool = True,
):
    stmt = select(Animal).where(Animal.finca_id == finca_id)
    if solo_activos:
        stmt = stmt.where(Animal.activo.is_(True))
    return db.scalars(stmt).all()


# ── GET /animales/{animal_id} ─────────────────────────────────────────────────

@router.get("/{animal_id}", response_model=AnimalRead)
def get_animal(
    animal_id: str,
    db: DbSession,
    _user: AnyAuthUser,
    finca_id: CurrentFincaId,
):
    animal = _get_animal_or_404(db, animal_id, finca_id)
    return animal


# ── POST /animales — solo propietario ────────────────────────────────────────

@router.post("/", response_model=AnimalRead, status_code=status.HTTP_201_CREATED)
def create_animal(
    payload: AnimalCreate,
    db: DbSession,
    _user: PropietarioOnly,
    finca_id: CurrentFincaId,
):
    animal = Animal(**payload.model_dump(), finca_id=finca_id)
    db.add(animal)
    db.commit()
    db.refresh(animal)
    return animal


# ── PATCH /animales/{animal_id} — solo propietario ───────────────────────────

@router.patch("/{animal_id}", response_model=AnimalRead)
def update_animal(
    animal_id: str,
    payload: AnimalUpdate,
    db: DbSession,
    _user: PropietarioOnly,
    finca_id: CurrentFincaId,
):
    animal = _get_animal_or_404(db, animal_id, finca_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(animal, field, value)
    db.commit()
    db.refresh(animal)
    return animal


# ── DELETE /animales/{animal_id} — soft-delete, solo propietario ─────────────

@router.delete("/{animal_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_animal(
    animal_id: str,
    db: DbSession,
    _user: PropietarioOnly,
    finca_id: CurrentFincaId,
):
    animal = _get_animal_or_404(db, animal_id, finca_id)
    animal.activo = False
    db.commit()


# ── Helper privado ────────────────────────────────────────────────────────────

def _get_animal_or_404(db, animal_id: str, finca_id: str) -> Animal:
    stmt = select(Animal).where(
        Animal.id == animal_id,
        Animal.finca_id == finca_id,  # ← SIEMPRE filtrar por finca_id
    )
    animal = db.scalar(stmt)
    if animal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal no encontrado")
    return animal
```

### 5.2 Patrón de endpoint de autenticación

**Archivo:** `app/api/v1/auth.py`

```python
from datetime import timedelta

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, verify_password
from app.models.usuario import Usuario
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: DbSession):
    user = db.scalar(select(Usuario).where(Usuario.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )
    token_data = {"sub": user.id, "finca_id": user.finca_id, "rol": user.rol}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        token_type="bearer",
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(current_user: CurrentUser, db: DbSession):
    token_data = {
        "sub": current_user.id,
        "finca_id": current_user.finca_id,
        "rol": current_user.rol,
    }
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        token_type="bearer",
    )
```

### 5.3 Registro en `main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import router as api_v1_router
from app.core.config import settings

app = FastAPI(title="BoviTech API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix="/api/v1")
```

---

## 6. Backend — Manejo de Errores

### 6.1 Códigos HTTP estándar

| Situación | Código | Cuándo usarlo |
|---|---|---|
| Recurso no encontrado | 404 | El ID no existe O no pertenece a la finca del usuario |
| Sin autenticación | 401 | Token ausente, inválido o expirado |
| Sin permisos de rol | 403 | Token válido pero rol insuficiente |
| Datos inválidos | 422 | Pydantic lo lanza automáticamente |
| Conflicto de unicidad | 409 | `numero_arete` duplicado dentro de la finca |
| Error del servidor | 500 | Solo para excepciones no manejadas |

**Regla:** Siempre retornar 404 (no 403) cuando un recurso existe pero pertenece a otra finca — nunca confirmar la existencia de datos de otros tenants.

### 6.2 Formato de error consistente

Pydantic y FastAPI ya emiten JSON; solo asegurar que los `HTTPException` usen `detail` como string:

```python
raise HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail="Ya existe un animal con este número de arete en la finca",
)
```

---

## 7. Backend — Migraciones Alembic

### 7.1 Naming convention

```
YYYYMMDD_HHMM_descripcion_corta.py
Ejemplo: 20260528_1400_create_animales_table.py
```

### 7.2 Estructura de migración

```python
"""create animales table

Revision ID: abc123
Revises: prev_revision
Create Date: 2026-05-28 14:00:00
"""

from alembic import op
import sqlalchemy as sa

revision = "abc123"
down_revision = "prev_revision"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "animales",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("finca_id", sa.CHAR(36), sa.ForeignKey("fincas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("numero_arete", sa.String(50), nullable=False),
        sa.Column("nombre", sa.String(100), nullable=True),
        sa.Column("raza", sa.String(100), nullable=True),
        sa.Column("fecha_nacimiento", sa.Date, nullable=True),
        sa.Column("fecha_ultimo_parto", sa.Date, nullable=True),
        sa.Column("rfid_tag", sa.String(100), nullable=True),
        sa.Column("activo", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("ix_animales_finca_id", "animales", ["finca_id"])
    op.create_unique_constraint("uq_animales_arete_finca", "animales", ["numero_arete", "finca_id"])


def downgrade() -> None:
    op.drop_table("animales")
```

**Regla:** Siempre crear índice en `finca_id` y `unique_constraint` en campos únicos-por-finca en la migración, no solo en el modelo.

---

## 8. Backend — Tareas en Background (Reportes)

Los reportes PDF/Excel se generan de forma asíncrona con `BackgroundTasks`. Patrón:

```python
# app/schemas/reporte.py
class ReporteJobRead(BaseModel):
    job_id: str
    status: str  # "pending" | "ready" | "failed"
    download_url: str | None = None

# app/api/v1/reportes.py
import uuid
from fastapi import APIRouter, BackgroundTasks

from app.api.deps import AnyAuthUser, CurrentFincaId
from app.schemas.reporte import ReporteJobRead
from app.services.report_generator import generate_pdf_report

router = APIRouter(prefix="/reportes", tags=["Reportes"])

# Almacenamiento temporal en memoria (reemplazar por DB en producción)
_jobs: dict[str, dict] = {}


@router.post("/pdf", response_model=ReporteJobRead, status_code=202)
def request_pdf_report(
    background_tasks: BackgroundTasks,
    _user: AnyAuthUser,
    finca_id: CurrentFincaId,
):
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {"status": "pending", "download_url": None}
    background_tasks.add_task(generate_pdf_report, job_id, finca_id, _jobs)
    return ReporteJobRead(job_id=job_id, status="pending")


@router.get("/{job_id}", response_model=ReporteJobRead)
def get_report_status(job_id: str, _user: AnyAuthUser):
    job = _jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job no encontrado")
    return ReporteJobRead(job_id=job_id, **job)
```

---

## 9. Frontend — Cliente API (Axios)

**Archivo:** `src/api/client.ts`

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: adjunta el access token ─────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: refresca el token automáticamente ──────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        failedQueue.forEach(({ resolve }) => resolve(data.access_token));
        failedQueue = [];
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch {
        failedQueue.forEach(({ reject }) => reject(error));
        failedQueue = [];
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

### Módulo de API por dominio

**Archivo:** `src/api/animales.ts`

```typescript
import { apiClient } from "./client";
import type { Animal, AnimalCreate, AnimalUpdate } from "../types/animal";

export const animalesApi = {
  list: (soloActivos = true) =>
    apiClient.get<Animal[]>("/animales", { params: { solo_activos: soloActivos } }),

  get: (id: string) =>
    apiClient.get<Animal>(`/animales/${id}`),

  create: (data: AnimalCreate) =>
    apiClient.post<Animal>("/animales", data),

  update: (id: string, data: AnimalUpdate) =>
    apiClient.patch<Animal>(`/animales/${id}`, data),

  deactivate: (id: string) =>
    apiClient.delete(`/animales/${id}`),
};
```

---

## 10. Frontend — Contexto de Autenticación

**Archivo:** `src/context/AuthContext.tsx`

```typescript
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { apiClient } from "../api/client";

interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  rol: "propietario" | "operario";
  finca_id: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
```

---

## 11. Frontend — Hooks de datos

### 11.1 Patrón de hook de recurso

Todos los hooks de datos siguen la misma estructura. Ejemplo completo:

**Archivo:** `src/hooks/useAnimales.ts`

```typescript
import { useState, useEffect, useCallback } from "react";
import { animalesApi } from "../api/animales";
import type { Animal, AnimalCreate, AnimalUpdate } from "../types/animal";

interface UseAnimalesReturn {
  animales: Animal[];
  loading: boolean;
  error: string | null;
  createAnimal: (data: AnimalCreate) => Promise<Animal>;
  updateAnimal: (id: string, data: AnimalUpdate) => Promise<Animal>;
  deactivateAnimal: (id: string) => Promise<void>;
  refetch: () => void;
}

export function useAnimales(soloActivos = true): UseAnimalesReturn {
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnimales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await animalesApi.list(soloActivos);
      setAnimales(data);
    } catch {
      setError("Error al cargar los animales");
    } finally {
      setLoading(false);
    }
  }, [soloActivos]);

  useEffect(() => { fetchAnimales(); }, [fetchAnimales]);

  const createAnimal = async (data: AnimalCreate): Promise<Animal> => {
    const { data: created } = await animalesApi.create(data);
    setAnimales((prev) => [...prev, created]);
    return created;
  };

  const updateAnimal = async (id: string, data: AnimalUpdate): Promise<Animal> => {
    const { data: updated } = await animalesApi.update(id, data);
    setAnimales((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  };

  const deactivateAnimal = async (id: string): Promise<void> => {
    await animalesApi.deactivate(id);
    setAnimales((prev) => prev.filter((a) => a.id !== id));
  };

  return {
    animales,
    loading,
    error,
    createAnimal,
    updateAnimal,
    deactivateAnimal,
    refetch: fetchAnimales,
  };
}
```

**Reglas del hook:**
- Nombre: `use` + nombre del recurso en PascalCase (`useAnimales`, `useProduccion`, `useAlertas`)
- Siempre retornar `{ data, loading, error, refetch }`
- Las mutations retornan la entidad actualizada (para que el llamador no tenga que hacer refetch)
- El error es siempre un string en español, listo para mostrar al usuario

---

## 12. Frontend — Componentes con RBAC

### 12.1 Hook `useRbac`

**Archivo:** `src/utils/rbac.ts`

```typescript
import { useAuth } from "../context/AuthContext";

type Rol = "propietario" | "operario";

const PERMISOS: Record<string, Rol[]> = {
  "animales.crear": ["propietario"],
  "animales.editar": ["propietario"],
  "animales.desactivar": ["propietario"],
  "usuarios.gestionar": ["propietario"],
  "alertas.configurar": ["propietario"],
  "ordeno.registrar": ["propietario", "operario"],
  "alimentacion.registrar": ["propietario", "operario"],
  "dashboard.ver": ["propietario", "operario"],
  "reportes.exportar": ["propietario", "operario"],
} as const;

export function useRbac() {
  const { user } = useAuth();
  const can = (permiso: keyof typeof PERMISOS): boolean => {
    if (!user) return false;
    return PERMISOS[permiso]?.includes(user.rol) ?? false;
  };
  return { can };
}
```

### 12.2 Componente Guard

**Archivo:** `src/components/common/RoleGuard.tsx`

```typescript
import { useRbac } from "../../utils/rbac";
import type { ReactNode } from "react";

interface RoleGuardProps {
  permiso: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function RoleGuard({ permiso, fallback = null, children }: RoleGuardProps) {
  const { can } = useRbac();
  return can(permiso) ? <>{children}</> : <>{fallback}</>;
}
```

### 12.3 Uso en componentes

```tsx
import { RoleGuard } from "../common/RoleGuard";

// Botón visible solo para propietario
<RoleGuard permiso="animales.crear">
  <Button onClick={handleCreate}>Agregar animal</Button>
</RoleGuard>

// Con fallback
<RoleGuard permiso="usuarios.gestionar" fallback={<p>Sin permisos</p>}>
  <UsuariosTable />
</RoleGuard>
```

---

## 13. Frontend — Estructura de Páginas

### 13.1 Patrón de página estándar

```tsx
// src/pages/animals/AnimalesPage.tsx
import { useState } from "react";
import { useAnimales } from "../../hooks/useAnimales";
import { RoleGuard } from "../../components/common/RoleGuard";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { AnimalCard } from "../../components/features/animals/AnimalCard";
import { AnimalCreateModal } from "../../components/features/animals/AnimalCreateModal";
import { Button } from "../../components/ui/button";

export function AnimalesPage() {
  const { animales, loading, error, createAnimal, deactivateAnimal } = useAnimales();
  const [showModal, setShowModal] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Hato ganadero</h1>
        <RoleGuard permiso="animales.crear">
          <Button onClick={() => setShowModal(true)}>+ Agregar animal</Button>
        </RoleGuard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {animales.map((animal) => (
          <AnimalCard
            key={animal.id}
            animal={animal}
            onDeactivate={deactivateAnimal}
          />
        ))}
      </div>

      {showModal && (
        <AnimalCreateModal
          onClose={() => setShowModal(false)}
          onCreate={createAnimal}
        />
      )}
    </div>
  );
}
```

### 13.2 Rutas protegidas en `App.tsx`

```tsx
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/auth/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { AnimalesPage } from "./pages/animals/AnimalesPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/animales" element={<ProtectedRoute><AnimalesPage /></ProtectedRoute>} />
      {/* Agregar más rutas siguiendo este patrón */}
    </Routes>
  );
}
```

---

## 14. Frontend — Formularios

Patrón con `react-hook-form` + validación manual (sin Zod para reducir dependencias):

```tsx
// src/components/features/animals/AnimalCreateModal.tsx
import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import type { AnimalCreate } from "../../../types/animal";

interface Props {
  onClose: () => void;
  onCreate: (data: AnimalCreate) => Promise<unknown>;
}

export function AnimalCreateModal({ onClose, onCreate }: Props) {
  const [numero_arete, setNumeroArete] = useState("");
  const [nombre, setNombre] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero_arete.trim()) {
      setError("El número de arete es obligatorio");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await onCreate({ numero_arete: numero_arete.trim(), nombre: nombre.trim() || undefined });
      onClose();
    } catch {
      setError("Error al crear el animal. Verifique que el número de arete no esté repetido.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Nuevo animal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Número de arete *"
            value={numero_arete}
            onChange={(e) => setNumeroArete(e.target.value)}
            placeholder="Ej: 001234"
          />
          <Input
            label="Nombre (opcional)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Manchita"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Crear animal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

**Reglas de formularios:**
- Siempre deshabilitar botón de submit mientras `submitting === true`
- Mostrar error en español debajo del formulario (no como alert)
- Al crear con éxito: cerrar modal y reflejar el nuevo dato en la lista (via la mutation del hook)

---

## 15. Convenciones de Nombrado

### Backend

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos Python | `snake_case.py` | `registro_produccion.py` |
| Clases de modelo | `PascalCase` | `RegistroProduccion` |
| Tablas SQL | `snake_case_plural` | `registros_produccion` |
| Endpoints | `snake_case`, verbos REST implícitos | `GET /animales`, `POST /sesiones` |
| Variables Python | `snake_case` | `finca_id`, `volume_litros` |
| Schemas Pydantic | `PascalCase` + sufijo | `AnimalCreate`, `AnimalRead` |
| Dependencias | `get_` prefix o `require_` | `get_current_user`, `require_propietario` |

### Frontend

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos componentes | `PascalCase.tsx` | `AnimalCard.tsx` |
| Archivos de hooks | `camelCase.ts` con prefijo `use` | `useAnimales.ts` |
| Archivos de API | `camelCase.ts` | `animales.ts` |
| Archivos de tipos | `camelCase.ts` | `animal.ts` |
| Interfaces TypeScript | `PascalCase` | `Animal`, `AnimalCreate` |
| Props de componente | `PascalCase` + sufijo `Props` | `AnimalCardProps` |
| Handlers de eventos | `handle` + Acción | `handleCreate`, `handleSubmit` |
| Variables locales | `camelCase` | `soloActivos`, `showModal` |

### Inglés vs. Español

- **Español** para nombres de dominio (`Animal`, `finca_id`, `numero_arete`, `sesion_ordeno`)
- **Inglés** para infraestructura técnica (`get_db`, `router`, `apiClient`, `useEffect`)
- **Regla:** si el concepto viene del PRD/negocio → español; si es patrón técnico → inglés

---

## 16. Checklist de Revisión

Antes de hacer merge de cualquier PR, verificar:

### Seguridad Multi-tenant
- [ ] Todos los queries de DB incluyen `.where(Model.finca_id == finca_id)` obtenido del JWT
- [ ] Ningún endpoint acepta `finca_id` como parámetro externo (body, path, query)
- [ ] Los errores 404 se usan también cuando un recurso existe en otra finca

### RBAC
- [ ] Las rutas de escritura para animales, usuarios y umbrales usan `PropietarioOnly`
- [ ] Las rutas de lectura y registro operario usan `AnyAuthUser`
- [ ] En el frontend, los botones destructivos o de administración están envueltos en `<RoleGuard>`

### Modelos
- [ ] Toda tabla multi-tenant hereda de `TenantModel`
- [ ] `EventoTrazabilidad` NO tiene `updated_at`
- [ ] No hay operaciones UPDATE o DELETE en `EventoTrazabilidad`
- [ ] `activo=False` como soft-delete en `Animal`, nunca DELETE real

### Schemas
- [ ] `AnimalRead` / `Read` en general tiene `model_config = ConfigDict(from_attributes=True)`
- [ ] `finca_id` no aparece en schemas `Read` expuestos al frontend
- [ ] `password_hash` nunca aparece en schemas de respuesta

### Frontend
- [ ] `finca_id` nunca se guarda ni se envía manualmente desde el frontend (viene del JWT)
- [ ] Los hooks siempre retornan `{ loading, error, data }` como mínimo
- [ ] El cliente Axios obtiene el token de `localStorage` automáticamente

---

*Documento generado: 2026-05-28 — Versión 1.0 — Fase 1 MVP*
