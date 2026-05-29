---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-BoviTech-2026-05-28/prd.md
  - _bmad-output/planning-artifacts/research/market-competencia-software-ganadero-colombia-2026-05-28.md
workflowType: architecture
project_name: BoviTech
user_name: Saram
date: 2026-05-28
---

# Architecture Decision Document — BoviTech

_Este documento se construye colaborativamente paso a paso. Las secciones se agregan a medida que avanzamos en cada decisión arquitectónica._

---

## Análisis de Contexto del Proyecto

### Resumen de Requisitos

**Requisitos Funcionales (20 FRs en 7 grupos):**
- **F1 Gestión del Hato** — CRUD de animales con historial
- **F2 Registro de Producción** — entrada por sesión mañana/tarde, agregaciones diaria/semanal/mensual, gráfica de tendencia 30 días
- **F3 Registro de Alimentación** — registro por animal o grupo, cálculo de eficiencia alimenticia
- **F4 Alertas y Monitoreo** — evaluación de umbral configurable (10–50%) al guardar, alerta por animal sin registro +24h, estado persistente hasta reconocimiento
- **F5 Dashboard y Reportes** — dashboard en tiempo de carga, generación PDF/Excel con campos ICA 017
- **F6 Trazabilidad** — historial append-only por animal, exportación compatible ICA 017 de 2012
- **F7 Gestión de Usuarios** — roles Propietario / Operario con control de acceso por sección

**Requisitos No Funcionales Críticos:**
- Flujo de registro de ordeño en ≤ 3 toques (UX determinante)
- Capacitación de operario en ≤ 2 horas
- Funcional con latencia 3G (≤ 5 segundos) — Fase 1
- Offline-first con cola de 72h — Fase 2
- Disponibilidad ≥ 99% en horarios pico (5–8am, 3–6pm)
- Datos de ganadero: propiedad exclusiva, no compartir sin consentimiento (Ley 1581)
- Dashboard < 3 segundos para hasta 200 animales
- Compatible Chrome/Firefox en Android 9+

### Escala y Complejidad

| Indicador | Evaluación |
|---|---|
| Complejidad general | **Media** |
| Dominio técnico primario | Full-stack web (API + frontend responsive) |
| Tiempo real | No en Fase 1 — alertas al guardar registro |
| Volumen de datos | Bajo-medio (~12.000 registros/mes por finca de 200 animales) |
| Multi-tenancy | Sí — aislamiento por finca obligatorio |
| Compliance regulatorio | Sí — ICA 017, Ley 1581 de 2012 |
| Integración IoT futura | Crítica — modelo de datos debe anticiparla desde Fase 1 |

**Componentes arquitectónicos estimados:**
1. Frontend web (SPA liviano, responsive, Android 9+)
2. API backend (REST, multi-tenant, con roles)
3. Base de datos relacional (animales, sesiones, eventos append-only, usuarios)
4. Motor de alertas (evaluación al guardar sesión)
5. Generador de reportes asíncrono (PDF / Excel)
6. Auth con RBAC (Propietario / Operario)
7. [Fase 2] Endpoint de ingesta IoT (MQTT o REST para sensores de puestos)
8. [Fase 2] Motor de sync offline (service worker + cola local)

### Restricciones Técnicas

- **Multi-tenancy**: toda query filtrada por `finca_id` — sin excepciones
- **Autorización RBAC**: aplicada en API, no solo en UI
- **Audit trail append-only**: tabla de eventos sin UPDATE ni DELETE
- **Sync-friendly desde Fase 1**: IDs UUID, timestamps UTC, estructura de eventos compatible con sync de Fase 2
- **Performance 3G**: paginación, lazy loading, bundles livianos
- **Equipo académico**: stack aprendible, servicios gestionados, sin DevOps complejo

### Decisión de Arquitectura IoT — Confirmada

**Opción seleccionada: Sensor fijo por puesto de ordeño + chip RFID pasivo por animal**

Cada vaca lleva un chip RFID pasivo (sin batería, ~$15K–$30K COP/animal). Cada puesto de ordeño tiene un sensor activo que: (1) lee el RFID para identificar la vaca, (2) mide volumen de leche por sensor de flujo, (3) registra concentrado dispensado, (4) captura temperatura ambiental.

**Justificación:** 4–8 sensores activos por finca vs 50–200 con wearables. Permite cumplir el precio objetivo de $800K–$1.2M COP. Mismo resultado que DeLaval a 20x menor costo. La leche solo se puede medir en el punto de ordeño — no hay ventaja en medir en el animal en movimiento.

### Preocupaciones Transversales

1. **Multi-tenancy** — filtrado por `finca_id` en cada query
2. **RBAC** — Propietario vs Operario aplicado en capa de API
3. **Append-only events** — tabla de trazabilidad sin UPDATE/DELETE
4. **Sync-friendliness** — UUIDs, timestamps UTC desde Fase 1 para no refactorizar en Fase 2
5. **Performance 3G** — paginación, assets optimizados
6. **Reportes asíncronos** — generación PDF/Excel no puede bloquear el hilo principal

---

## Stack Tecnológico — Decisión Confirmada

### Selección Final

| Capa | Tecnología | Versión objetivo | Hosting |
|---|---|---|---|
| Backend API | Python + FastAPI | 0.115.x (LTS estable 2026) | Railway |
| Base de datos | MySQL 8.0 | 8.0.x | Railway (managed) |
| ORM + migraciones | SQLAlchemy 2.0 + Alembic | 2.0.x / 1.13.x | — |
| Autenticación | JWT (python-jose + passlib) | — | — |
| Frontend | React (Vite) | React 19 / Vite 6 | Vercel |
| Validación de esquemas | Pydantic v2 | 2.x | — |

### Punto de Partida (Starter Template)

```bash
cookiecutter https://github.com/tiangolo/full-stack-fastapi-template
```

**Adaptaciones requeridas sobre el template:**
- Swap PostgreSQL → MySQL (driver `aiomysql` + ajuste de connection string)
- Configurar `DATABASE_URL` en Railway environment variables
- Separar frontend deploy a Vercel (el template lo incluye todo — extraer `/frontend`)
- Mantener estructura de carpetas: `app/api/`, `app/models/`, `app/schemas/`, `app/core/`

### Justificación de Decisiones Clave

**Railway para backend + BD (no Vercel para Python):**
Vercel solo soporta Python como funciones serverless: sin servidor persistente, timeout de 10s, conexiones MySQL inestables entre invocaciones, sin tareas en background (necesarias para generación PDF asíncrona). Railway ofrece servidor persistente con connection pooling estable.

**MySQL sobre PostgreSQL:**
Familiaridad del equipo con MySQL (formación académica típica en Colombia). Para el volumen proyectado (~12.000 registros/mes), MySQL 8.0 es más que suficiente. La brecha de features relevantes (JSON, window functions, full-text) está cerrada en MySQL 8.0.

**React (Vite) sobre Next.js:**
MVP Phase 1 es una SPA pura — no hay SSR/SEO necesario (app B2B detrás de login). Vite elimina complejidad de Next.js, bundles más livianos, deploy trivial a Vercel. Migración a Next.js posible en Fase 3 si hay landing pública.

### Restricciones de Infraestructura

- **Plan Railway gratuito**: 512 MB RAM, 1 GB disco — suficiente para MVP con &lt;10 fincas activas
- **Plan Vercel gratuito**: Ilimitado para SPA estática — sin restricciones para el frontend
- **Conexiones MySQL**: Usar SQLAlchemy connection pool (`pool_size=5, max_overflow=10`) — no crear nueva conexión por request
- **Variables de entorno**: Nunca hardcodear credenciales — usar Railway + Vercel environment variables

---

## Decisiones Arquitectónicas Core

### Decisiones Críticas (bloquean implementación)

1. Esquema de base de datos con multi-tenancy por `finca_id`
2. Flujo JWT con roles embebidos en el token
3. Middleware centralizado de autenticación y autorización
4. Contrato REST entre frontend y backend (rutas + payloads)

### Decisiones Importantes (dan forma a la arquitectura)

1. BackgroundTasks de FastAPI para reportes (sin Celery/Redis)
2. React Context solo para auth — sin Redux/Zustand
3. shadcn/ui + Tailwind para componentes UI
4. Monorepo `/backend` + `/frontend` con auto-deploy independiente

### Decisiones Diferidas (post-demo)

1. Caché (Redis) — no requerido con índices MySQL para ≤200 animales
2. Rate limiting — agregar antes de producción
3. Entorno de staging — agregar antes de lanzamiento real
4. GitHub Actions CI/CD — agregar cuando el equipo escale
5. Política de complejidad de contraseñas

---

### 1. Arquitectura de Datos

#### Tablas del modelo

| Tabla | Propósito | Multi-tenant |
|---|---|---|
| `fincas` | Tenant root — datos de la finca | — (es el root) |
| `usuarios` | Rol (propietario / operario) + finca_id | `finca_id` |
| `animales` | Hato, activo/inactivo, campo `rfid_tag` para Fase 2 | `finca_id` |
| `sesiones_ordeno` | Sesión mañana/tarde por fecha | `finca_id` |
| `registros_produccion` | Litros por animal por sesión | vía `sesion_id` |
| `registros_alimentacion` | kg por animal o grupo por día | `finca_id` |
| `alertas` | Estado persistente hasta ACK | `finca_id` |
| `eventos_trazabilidad` | Append-only — sin UPDATE ni DELETE | `finca_id` |

**Convenciones de todos los campos comunes:**
- `id`: `CHAR(36)` UUID v4, generado en Python (no en BD)
- `created_at`, `updated_at`: `DATETIME` en UTC, `NOT NULL`
- `finca_id`: `CHAR(36)` FK a `fincas.id`, indexado, `NOT NULL`

#### Caché

Sin caché para el demo. Dashboard ≤200 animales se resuelve con índices en MySQL.

#### Multi-tenancy enforcement

Middleware centralizado como `Depends()` de FastAPI. Inyecta `finca_id` del JWT en cada request. Ningún endpoint accede a datos sin este `Depends` en la firma — los agentes no pueden omitirlo.

```python
# Patrón para cada endpoint:
@router.get("/animales")
def list_animales(
    db: Session = Depends(get_db),
    current_finca: str = Depends(get_current_finca_id),  # ← obligatorio
):
    return db.query(Animal).filter(Animal.finca_id == current_finca).all()
```

---

### 2. Autenticación y Seguridad

#### Flujo JWT

```
POST /auth/login
  → 200: { access_token (15 min), refresh_token (7 días, HttpOnly cookie) }

POST /auth/refresh
  → 200: { access_token nuevo }
  → 401: si refresh_token expirado → cliente redirige a /login

POST /auth/change-password
  → requiere JWT válido
```

**Payload del JWT:**
```json
{ "sub": "user_uuid", "finca_id": "finca_uuid", "rol": "propietario" }
```

#### Matriz de permisos RBAC

| Acción | Propietario | Operario |
|---|---|---|
| Ver dashboard / reportes | ✅ | ✅ |
| Registrar ordeño / alimentación | ✅ | ✅ |
| Exportar PDF / Excel | ✅ | ✅ |
| Reconocer alertas | ✅ | ✅ |
| Gestionar animales (CRUD) | ✅ | ❌ |
| Gestionar usuarios | ✅ | ❌ |
| Configurar umbrales de alerta | ✅ | ❌ |

**Implementación:**
```python
# Decorador aplicado en endpoints restringidos:
@router.delete("/animales/{id}")
def delete_animal(
    current_user: User = Depends(require_role("propietario")),
    ...
):
```

#### Contraseñas

`passlib[bcrypt]` con `rounds=12`. Sin política de complejidad para el demo.

#### CORS y HTTPS

- Railway provee HTTPS automáticamente.
- CORS en FastAPI: origen permitido = dominio Vercel + `localhost:5173` en local.
- Sin rate limiting para el demo.

---

### 3. API y Patrones de Comunicación

#### Rutas REST completas

```
# Auth
POST   /auth/login
POST   /auth/refresh
POST   /auth/change-password

# Animales (CRUD solo propietario para write)
GET    /animales
POST   /animales
GET    /animales/{id}
PUT    /animales/{id}
DELETE /animales/{id}

# Ordeño
GET    /sesiones
POST   /sesiones
GET    /sesiones/{id}/registros
POST   /sesiones/{id}/registros

# Alimentación
GET    /alimentacion
POST   /alimentacion
GET    /alimentacion/{id}
PUT    /alimentacion/{id}

# Alertas
GET    /alertas
POST   /alertas/{id}/ack

# Dashboard
GET    /dashboard

# Reportes (async)
POST   /reportes/pdf
POST   /reportes/excel
GET    /reportes/{job_id}/status
GET    /reportes/{job_id}/download

# Usuarios (solo propietario)
GET    /usuarios
POST   /usuarios
GET    /usuarios/{id}
PUT    /usuarios/{id}
DELETE /usuarios/{id}
```

Todos los endpoints filtran por `finca_id` del JWT — nunca como parámetro de URL.

#### Paginación estándar

Todos los `GET` de listas:
```
GET /animales?page=1&size=50

Response:
{
  "items": [...],
  "total": 142,
  "page": 1,
  "size": 50
}
```

#### Errores estándar

```json
{ "detail": "Animal no encontrado", "code": "NOT_FOUND" }
```

Códigos: 200, 201, 400, 401, 403, 404, 422 (Pydantic automático), 500.

#### Generación de reportes (async)

```
POST /reportes/pdf  →  { "job_id": "uuid" }  (retorna inmediato)
GET  /reportes/{job_id}/status  →  { "status": "pending" | "ready" | "error" }
GET  /reportes/{job_id}/download  →  archivo binario
```

Implementación: `BackgroundTask` de FastAPI. Sin Celery ni Redis para el demo.

---

### 4. Arquitectura Frontend

#### Estructura de carpetas

```
/frontend/src/
  /api/           → animales.ts, sesiones.ts, alertas.ts, auth.ts...
  /components/    → Button, Input, Table, AlertBanner, StatCard...
  /pages/         → Dashboard/, Animales/, Sesiones/, Alertas/, Reportes/, Usuarios/
  /hooks/         → useAnimales.ts, useSesiones.ts, useAlertas.ts...
  /context/       → AuthContext.tsx  (token, user, finca_id, rol)
  /utils/         → formatDate.ts, formatLitros.ts
```

#### Estado global

Solo React Context para auth. Sin Redux ni Zustand. Estado de cada pantalla en hooks locales (`useState` + `useEffect`).

#### Librería UI

**shadcn/ui** sobre Tailwind CSS. Componentes clave a usar: `Table`, `Dialog`, `Toast`, `Form`, `Card`, `Badge`, `Button`, `Input`.

#### Routing

React Router v6:
```
/login          → público
/dashboard      → PrivateRoute
/animales       → PrivateRoute
/sesiones       → PrivateRoute
/alimentacion   → PrivateRoute
/alertas        → PrivateRoute
/reportes       → PrivateRoute
/usuarios       → PrivateRoute + rol=propietario
```

`<PrivateRoute>` verifica JWT en localStorage; redirige a `/login` si ausente o expirado.

#### Comunicación con API

`axios` con instancia configurada:
- Interceptor de request: adjunta `Authorization: Bearer {token}`.
- Interceptor de response: en 401 → intenta refresh → si falla, limpia estado y redirige a `/login`.

---

### 5. Infraestructura y Despliegue

#### Entornos

| Entorno | Backend | Frontend | BD |
|---|---|---|---|
| Local | `uvicorn app.main:app --reload` (puerto 8000) | `npm run dev` (puerto 5173) | MySQL local |
| Producción | Railway (auto-deploy desde `main`) | Vercel (auto-deploy desde `main`) | Railway managed MySQL |

#### Variables de entorno requeridas

```bash
# Backend (.env / Railway)
DATABASE_URL=mysql+aiomysql://user:pass@host:3306/bovitech
SECRET_KEY=<32 chars aleatorios>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=https://bovitech.vercel.app

# Frontend (.env.local / Vercel)
VITE_API_URL=https://bovitech-api.railway.app
```

#### CI/CD

Auto-deploy en push a `main` por Railway y Vercel. Sin pipeline adicional para el demo.

#### Estructura del repositorio

```
/backend/    → FastAPI app (Railway apunta aquí)
/frontend/   → React + Vite (Vercel apunta aquí)
README.md
.gitignore
```

---

### Secuencia de implementación recomendada para el demo

1. Setup del repo + variables de entorno
2. Migraciones Alembic: crear las 8 tablas
3. Auth endpoints (`/login`, `/refresh`) + middleware
4. CRUD animales (el más simple, valida el patrón multi-tenant)
5. Sesiones de ordeño + registros de producción (core del negocio)
6. Motor de alertas (se dispara al guardar sesión)
7. Dashboard (agrega datos ya existentes)
8. Alimentación
9. Trazabilidad + exportación
10. Reportes PDF/Excel
11. Frontend: AuthContext + login screen
12. Frontend: pantallas en orden del backend

### Dependencias entre decisiones

- El middleware de `finca_id` (1-C) debe existir **antes** que cualquier otro endpoint
- Las migraciones (tablas) deben correr **antes** del primer endpoint de datos
- El `AuthContext` del frontend debe existir **antes** de cualquier pantalla protegida
- El interceptor de axios debe configurarse **antes** de las primeras llamadas a la API
