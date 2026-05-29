---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-BoviTech-2026-05-28/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/implementation-patterns.md
---

# BoviTech - Epic Breakdown

## Overview

Este documento proporciona el desglose completo de epics y stories para BoviTech, descomponiendo los requisitos del PRD y la Arquitectura en stories implementables.

## Requirements Inventory

### Functional Requirements

FR-1.1: La plataforma permite registrar animales con: identificador único (número de arete), nombre, raza, fecha de nacimiento y fecha del último parto. El animal aparece en la lista de vacas activas y puede recibir registros de producción el mismo día de su creación.

FR-1.2: La plataforma permite dar de baja un animal con fecha y motivo (venta, muerte, descarte productivo). El animal dado de baja deja de aparecer en los flujos de registro activo; sus datos históricos se conservan en modo solo lectura.

FR-1.3: El dashboard muestra el listado completo del hato activo con la producción del último ordeño registrado por animal. La lista carga en ≤ 3 segundos y refleja el último registro disponible.

FR-2.1: El operario puede registrar el volumen de leche (en litros, con un decimal) por animal para una sesión de ordeño identificada como "mañana" o "tarde" del día en curso. No es posible registrar dos sesiones del mismo tipo para la misma vaca en el mismo día calendario.

FR-2.2: La plataforma calcula la producción diaria de cada animal como la suma de las sesiones mañana y tarde del mismo día. La semanal es la suma de los 7 días anteriores. La mensual, los 30 días anteriores. Si solo existe una sesión en el día, la producción diaria equivale a esa sesión.

FR-2.3: La plataforma muestra el historial de producción por animal en una gráfica de tendencia de los últimos 30 días. Un punto por día con el total diario; los días sin registro se visualizan como brecha en la gráfica, no como cero.

FR-3.1: El operario puede registrar el tipo de alimento (concentrado, forraje, suplemento) y la cantidad en kilogramos por animal o por grupo en la misma sesión de ordeño. Si se registra por grupo, la plataforma distribuye el total en partes iguales; el operario puede ajustar individualmente antes de guardar.

FR-3.2: La plataforma calcula la eficiencia alimenticia por animal como: litros producidos / kg de alimento consumido en el mismo día. El indicador solo se muestra cuando existen registros de producción Y alimentación en el mismo día.

FR-4.1: La plataforma genera una alerta cuando la producción de un animal cae más de un porcentaje configurable (por defecto: 20%) respecto al promedio de sus últimos 7 días con registro. El umbral es configurable por el propietario entre 10% y 50%. La alerta se genera automáticamente al guardar el registro que supera el umbral.

FR-4.2: La plataforma genera una alerta si un animal activo no tiene registro de producción en más de 24 horas desde su último registro. La alerta aparece en el dashboard del propietario; el operario la ve solo si el propietario lo habilita.

FR-4.3: Las alertas se muestran en el dashboard con jerarquía visual: crítico (rojo), advertencia (amarillo). Una alerta no desaparece hasta que el propietario la marca como revisada.

FR-5.1: El dashboard del propietario muestra: producción total del hato en el día actual, producción total de los últimos 7 días, número de alertas activas sin revisar, y acceso rápido a las 5 vacas con mayor y menor producción del día. Si no hay registros del día, muestra "Sin registros hoy" en lugar de cero.

FR-5.2: La plataforma genera un reporte semanal (lunes a domingo) y uno mensual con: producción por animal, producción total del hato, consumo de alimento por animal, eficiencia alimenticia por animal, y listado de alertas generadas. Exporta en PDF y en Excel (.xlsx); los campos requeridos por la Resolución ICA 017 de 2012 están presentes en ambos formatos.

FR-6.1: La plataforma mantiene el historial de eventos por animal: ordeños registrados, cantidades de alimento, fechas de baja, y notas de novedad. El historial es de solo lectura una vez guardado; no se pueden editar ni eliminar registros históricos.

FR-6.2: La plataforma exporta el historial de trazabilidad de un animal o del hato completo en formato compatible con la Resolución ICA 017 de 2012. El archivo exportado incluye: identificador del animal, fecha de cada evento, tipo de evento, y responsable del registro.

FR-7.1: La plataforma soporta dos roles por cuenta de finca: Propietario y Operario.

FR-7.2: El operario puede: registrar producción, registrar alimentación, y ver alertas si el propietario lo habilita. No puede acceder a reportes financieros, configuración de la cuenta, ni gestión de animales.

FR-7.3: El propietario tiene acceso completo: configuración, reportes, gestión de animales, gestión de usuarios, y configuración de umbrales de alerta. Un operario que intente acceder a una sección de propietario recibe un mensaje de acceso restringido, no una pantalla de error.

### NonFunctional Requirements

NFR-1: Un operario rural sin experiencia tecnológica debe operar el sistema de forma autónoma después de máximo 2 horas de capacitación presencial.

NFR-2: El flujo de registro de un ordeño (una vaca, una sesión) debe completarse en máximo 3 toques en pantalla desde que el operario abre la sesión de ordeño.

NFR-3: La interfaz debe estar en español colombiano, con íconos visuales como apoyo al texto para usuarios con baja lectura digital. No se usan anglicismos técnicos.

NFR-4: [Fase 1] La plataforma web debe ser funcional con latencias de hasta 5 segundos en conexiones 3G móvil.

NFR-6: La plataforma debe tener disponibilidad ≥ 99% en horarios pico de ordeño: 5:00–8:00 a.m. y 3:00–6:00 p.m. hora Colombia.

NFR-7: Los datos de producción son propiedad del ganadero y no pueden ser compartidos con terceros (incluidas cooperativas) sin consentimiento explícito, cumpliendo la Ley 1581 de 2012.

NFR-8: Comunicaciones cifradas en tránsito (TLS 1.2+); credenciales almacenadas con hash (no en texto plano).

NFR-9: El dashboard principal carga en menos de 3 segundos en conexión 4G para un hato de hasta 200 animales.

NFR-10: La plataforma soporta hasta 200 animales activos por finca en Fase 1.

NFR-11: La plataforma web funciona en Chrome y Firefox en tabletas y smartphones Android de gama media (Android 9+) sin instalación de aplicación.

### Additional Requirements

- **Starter template**: Inicializar desde `cookiecutter https://github.com/tiangolo/full-stack-fastapi-template` con swap de PostgreSQL → MySQL (driver `aiomysql`)
- **Multi-tenancy obligatorio**: `finca_id` extraído del JWT via `Depends()` en cada endpoint — ningún endpoint accede a datos sin este Depends en la firma
- **JWT con roles**: payload `{ sub, finca_id, rol }` — access token 15 min, refresh token 7 días
- **Tabla append-only**: `eventos_trazabilidad` sin UPDATE ni DELETE — nunca modificar registros históricos
- **Sync-friendly desde Fase 1**: IDs UUID v4 (generados en Python), timestamps UTC — anticipar Fase 2 sin refactorización
- **BackgroundTasks para reportes**: usar `FastAPI BackgroundTasks` — sin Celery ni Redis para el MVP
- **React Context solo para auth**: sin Redux ni Zustand — estado de cada pantalla en hooks locales
- **Monorepo `/backend` + `/frontend`**: auto-deploy independiente en Railway (backend) y Vercel (frontend)
- **Connection pooling MySQL**: `pool_size=5, max_overflow=10` — no crear nueva conexión por request
- **Paginación estándar**: todos los GET de listas con `?page=1&size=50` y respuesta `{ items, total, page, size }`
- **Patrones de implementación**: todos los agentes deben seguir `implementation-patterns.md` para estructura de modelos, schemas, deps y hooks

### UX Design Requirements

N/A — No existe documento de diseño UX para Fase 1. Los requisitos de UX están capturados en NFR-1, NFR-2 y NFR-3 del PRD.

### FR Coverage Map

FR-1.1: Epic 2 — Crear animal con arete, nombre, raza, fechas de nacimiento y último parto
FR-1.2: Epic 2 — Dar de baja animal (soft-delete con fecha y motivo, historial conservado)
FR-1.3: Epic 4 — Dashboard: lista del hato activo con última producción por animal
FR-2.1: Epic 3 — Registro de sesión de ordeño mañana/tarde, sin duplicados por día/animal
FR-2.2: Epic 3 — Cálculo automático producción diaria/semanal/mensual por animal
FR-2.3: Epic 3 — Gráfica de tendencia de producción 30 días por animal
FR-3.1: Epic 5 — Registro de alimentación por animal o grupo con ajuste individual
FR-3.2: Epic 5 — Cálculo de eficiencia alimenticia (litros/kg) cuando hay datos de ambos tipos
FR-4.1: Epic 3 — Motor de alertas: umbral configurable 10–50%, disparo automático al guardar sesión
FR-4.2: Epic 3 — Alerta automática cuando animal activo no tiene registro en más de 24 horas
FR-4.3: Epic 4 — Display de alertas con jerarquía crítico/advertencia + reconocimiento (ACK)
FR-5.1: Epic 4 — Dashboard propietario: producción hoy/7 días, alertas activas, top/bottom 5
FR-5.2: Epic 7 — Reportes PDF y Excel semanales/mensuales con campos ICA Resolución 017
FR-6.1: Epic 7 — Historial de eventos append-only por animal (solo lectura una vez guardado)
FR-6.2: Epic 7 — Exportación de trazabilidad compatible con Resolución ICA 017 de 2012
FR-7.1: Epic 1 — Soporte de dos roles por finca: Propietario y Operario
FR-7.2: Epic 6 — Permisos del operario: registrar datos, ver alertas si propietario habilita
FR-7.3: Epic 1 + 6 — Acceso completo propietario; mensaje de acceso restringido para operario en secciones vedadas

## Epic List

### Epic 1: Infraestructura Base y Autenticación
El equipo puede desarrollar localmente con entorno reproducible y un propietario puede registrarse, iniciar sesión y cambiar su contraseña de forma segura. Es el cimiento que habilita todos los epics siguientes.
**FRs cubiertos:** FR-7.1, FR-7.3 (acceso)
**Incluye:** setup desde starter template (cookiecutter Tiangolo), swap PostgreSQL→MySQL, 8 migraciones Alembic, endpoints `/auth/login` `/auth/refresh` `/auth/change-password`, middleware RBAC, pantalla de login con AuthContext en frontend, rutas protegidas con PrivateRoute.

### Epic 2: Gestión del Hato
El propietario puede crear y administrar el listado de animales de su finca: registrar nuevos animales con todos sus datos identificativos y dar de baja animales conservando el historial histórico en modo solo lectura.
**FRs cubiertos:** FR-1.1, FR-1.2
**Depende de:** Epic 1

### Epic 3: Registro de Producción y Alertas Automáticas
El operario puede registrar el volumen de leche por animal en cada sesión de ordeño (mañana/tarde) en máximo 3 toques, y el sistema genera alertas automáticamente al detectar caídas de producción superiores al umbral configurado o animales sin registro por más de 24 horas.
**FRs cubiertos:** FR-2.1, FR-2.2, FR-2.3, FR-4.1, FR-4.2, FR-4.3
**Depende de:** Epic 1, Epic 2

### Epic 4: Dashboard del Propietario
El propietario puede ver en tiempo real el estado completo de su hato: producción total del día y la semana, alertas activas con jerarquía visual, ranking de las 5 vacas con mayor y menor producción, y puede reconocer alertas para marcarlas como revisadas.
**FRs cubiertos:** FR-1.3, FR-5.1, FR-4.3 (display + ACK)
**Depende de:** Epic 1, Epic 3

### Epic 5: Registro de Alimentación
El operario puede registrar el tipo y cantidad de alimento suministrado por animal o por grupo en cada sesión, y el sistema calcula automáticamente la eficiencia alimenticia (litros/kg) cuando existen registros de producción y alimentación del mismo día.
**FRs cubiertos:** FR-3.1, FR-3.2
**Depende de:** Epic 1, Epic 2

### Epic 6: Gestión de Usuarios
El propietario puede crear operarios, asignarles acceso a la plataforma y controlar sus permisos. Los operarios ven un mensaje de acceso restringido (no pantalla de error) si intentan acceder a secciones del propietario.
**FRs cubiertos:** FR-7.2, FR-7.3 (gestión completa)
**Depende de:** Epic 1

### Epic 7: Trazabilidad y Reportes
El propietario puede consultar y exportar el historial de trazabilidad de cualquier animal o del hato completo en formato compatible con la Resolución ICA 017 de 2012, y generar reportes semanales y mensuales en PDF y Excel para entregar a la cooperativa o al veterinario.
**FRs cubiertos:** FR-6.1, FR-6.2, FR-5.2
**Depende de:** Epic 1, Epic 3

---

## Epic 1: Infraestructura Base y Autenticación

El equipo puede desarrollar localmente con entorno reproducible y un propietario puede registrarse, iniciar sesión y cambiar su contraseña de forma segura. Es el cimiento que habilita todos los epics siguientes.

### Story 1.1: Configuración del Repositorio y Entorno de Desarrollo

As a developer on the BoviTech team,
I want a reproducible local development environment with frontend, backend, and database ready to run,
So that any team member can start contributing without manual environment setup.

**Acceptance Criteria:**

**Given** the developer has Python 3.12+, Node 20+, and MySQL 8.0 available locally
**When** they clone the repo and follow the README setup steps
**Then** the backend starts at localhost:8000 (`uvicorn app.main:app --reload`), frontend at localhost:5173 (`npm run dev`), and MySQL is reachable at localhost:3306

**Given** the repo follows a monorepo structure
**When** the developer opens the project
**Then** `/backend` contains the FastAPI app initialized from the Tiangolo full-stack template (adapted for MySQL with `aiomysql`) and `/frontend` contains the Vite + React 19 app

**Given** env vars are required to run the app
**When** the developer copies `.env.example` to `.env`
**Then** all required variables are documented with safe example values: `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS`, `CORS_ORIGINS`, `VITE_API_URL`

**Given** the project is deployed on Railway (backend) and Vercel (frontend)
**When** a commit is pushed to `main`
**Then** Railway auto-deploys the backend and Vercel auto-deploys the frontend (auto-deploy configured in the respective dashboards)

**Given** the SQLAlchemy connection pool is configured
**When** the backend starts
**Then** the pool is set to `pool_size=5, max_overflow=10` — no new connection is created per request

---

### Story 1.2: Esquema de Base de Datos — 8 Tablas con Multi-tenancy

As a developer,
I want the complete database schema created via Alembic migrations,
So that all application data can be persisted with proper multi-tenancy isolation enforced at the database level from day one.

**Acceptance Criteria:**

**Given** `DATABASE_URL` points to a running MySQL 8.0 instance
**When** `alembic upgrade head` is run
**Then** the 8 tables are created: `fincas`, `usuarios`, `animales`, `sesiones_ordeno`, `registros_produccion`, `registros_alimentacion`, `alertas`, `eventos_trazabilidad`

**Given** every tenant-scoped table
**When** the schema is inspected
**Then** all tables except `fincas` have a `finca_id CHAR(36) NOT NULL` column with an index and FK to `fincas.id ON DELETE CASCADE`

**Given** the `animales` table
**When** the schema is inspected
**Then** there is a UNIQUE constraint on `(numero_arete, finca_id)` — aretes are unique per farm, not globally

**Given** the `eventos_trazabilidad` table
**When** the schema is inspected
**Then** it has `created_at` but NO `updated_at` column (append-only by design per ICA 017)

**Given** all ID columns
**When** the schema is inspected
**Then** all primary keys use `CHAR(36)` type (UUID v4 generated in Python, not auto-increment)

**Given** the migrations run cleanly
**When** `alembic downgrade -1` is run
**Then** the last migration is reversed without error (rollback is possible)

---

### Story 1.3: Autenticación Backend (Login, Refresh, Cambio de Contraseña, Middleware RBAC)

As a propietario,
I want to authenticate with my email and password to receive a secure access token with my role and farm embedded,
So that the system can identify who I am and what I'm allowed to do on every request.

**Acceptance Criteria:**

**Given** a registered propietario with valid email and password
**When** POST /api/v1/auth/login is called with correct credentials
**Then** HTTP 200 is returned with `{ access_token, refresh_token, token_type: "bearer" }` and the access token payload contains `{ sub: user_id, finca_id, rol: "propietario" }`

**Given** an incorrect password or non-existent email
**When** POST /api/v1/auth/login is called
**Then** HTTP 401 is returned with `{ detail: "Credenciales incorrectas" }` — the response never reveals whether the email exists

**Given** a valid refresh token
**When** POST /api/v1/auth/refresh is called with it as Bearer
**Then** a new `access_token` and `refresh_token` are returned with renewed expiry

**Given** an expired or tampered token
**When** any protected endpoint is called
**Then** HTTP 401 is returned

**Given** a valid operario token
**When** a propietario-only endpoint is called (e.g., DELETE /animales/:id)
**Then** HTTP 403 is returned with `{ detail: "Solo el propietario puede realizar esta acción" }`

**Given** a user with a valid access token
**When** POST /api/v1/auth/change-password is called with correct `current_password` and valid `new_password`
**Then** the password hash is updated and future logins must use the new password

**Given** passwords stored in the database
**When** the `usuarios` table is inspected
**Then** only bcrypt hashes are stored — never plaintext passwords

---

### Story 1.4: Frontend de Autenticación (Pantalla de Login, AuthContext, Rutas Protegidas)

As a propietario or operario,
I want to log in through a dedicated login screen and have my session persist,
So that I can access my farm's features without re-entering credentials on every page load and the app knows my role.

**Acceptance Criteria:**

**Given** an unauthenticated user navigates to any protected route (e.g., /dashboard)
**When** the router evaluates the route
**Then** the user is immediately redirected to /login

**Given** the user enters valid credentials on /login
**When** the login form is submitted
**Then** `access_token`, `refresh_token`, and user object (`id, nombre, rol, finca_id`) are stored in localStorage, and the user is redirected to /dashboard

**Given** invalid credentials are entered
**When** the login form is submitted
**Then** an error message in Spanish is displayed below the form: "Email o contraseña incorrectos"

**Given** a logged-in user whose access token expires
**When** a protected API call is made
**Then** the Axios interceptor automatically calls /auth/refresh, updates the stored tokens, and retries the original request — the user sees no interruption

**Given** the refresh token is also expired
**When** any protected API call is made
**Then** localStorage is cleared and the user is redirected to /login

**Given** a logged-in user clicks "Cerrar sesión"
**When** logout is triggered
**Then** localStorage is cleared and the user is redirected to /login

**Given** an operario is logged in and navigates to a propietario-only route (e.g., /usuarios)
**When** the route renders
**Then** they see the message "Acceso restringido — Esta sección es solo para el propietario" — not a generic error screen or blank page

---

## Epic 2: Gestión del Hato

El propietario puede crear y administrar el listado de animales de su finca: registrar nuevos animales con todos sus datos identificativos y dar de baja animales conservando el historial histórico en modo solo lectura.

### Story 2.1: API de Gestión de Animales (CRUD Multi-tenant)

As a propietario,
I want API endpoints to create, view, update, and deactivate animals in my farm,
So that herd data is stored securely, isolated from other farms, and available for production registration.

**Acceptance Criteria:**

**Given** a propietario with a valid JWT
**When** POST /api/v1/animales is called with `{ numero_arete, nombre, raza, fecha_nacimiento, fecha_ultimo_parto }`
**Then** the animal is created with `finca_id` taken from the JWT (never from the request body), `activo=true`, a UUID id, and HTTP 201 is returned with the full animal object

**Given** an operario with a valid JWT
**When** POST /api/v1/animales is called
**Then** HTTP 403 is returned

**Given** a `numero_arete` that already exists for an active or inactive animal in the same farm
**When** POST /api/v1/animales is called
**Then** HTTP 409 is returned with `{ detail: "Ya existe un animal con este número de arete en la finca" }`

**Given** a propietario calls GET /api/v1/animales
**When** the response is returned
**Then** only animals with `finca_id` matching the JWT are returned; animals from other farms are never included

**Given** a request with `?solo_activos=true` (default)
**When** GET /api/v1/animales is called
**Then** only animals with `activo=true` are returned; `?solo_activos=false` includes all animals

**Given** a propietario calls PATCH /api/v1/animales/{id}
**When** partial fields are provided
**Then** only those fields are updated (`model_dump(exclude_unset=True)`); `finca_id` is immutable

**Given** a propietario calls DELETE /api/v1/animales/{id}
**When** the request is processed
**Then** `activo` is set to `false` (soft-delete), no physical row is deleted, and HTTP 204 is returned

**Given** an animal ID that belongs to a different farm
**When** any operation (GET, PATCH, DELETE) is attempted
**Then** HTTP 404 is returned — the response never confirms existence of another farm's animals

---

### Story 2.2: UI de Gestión del Hato (Lista, Alta, Edición, Baja de Animales)

As a propietario,
I want a screen to see all my animals and perform herd management actions,
So that I can keep the active animal list accurate without needing technical help.

**Acceptance Criteria:**

**Given** a propietario navigates to /animales
**When** the page loads
**Then** all active animals are shown in a list displaying: número de arete, nombre, raza, and fecha del último parto; the list loads in ≤ 3 seconds

**Given** the propietario clicks "Agregar animal"
**When** they fill in the form (número de arete required; all other fields optional) and submit
**Then** the new animal appears in the list immediately without full page reload, and a success toast in Spanish confirms the action

**Given** the propietario submits a form with a duplicate número de arete
**When** the API returns 409
**Then** the form shows the error "Ya existe un animal con este número de arete" below the arete field

**Given** the propietario clicks on an animal row to edit
**When** they modify fields and save
**Then** the updated data is reflected in the list immediately

**Given** the propietario clicks "Dar de baja" on an animal
**When** a confirmation dialog appears ("¿Seguro que quieres dar de baja a [nombre/arete]?") and they confirm
**Then** the animal disappears from the active list and a success toast is shown

**Given** an operario is logged in and navigates to /animales
**When** the page renders
**Then** the list is visible but "Agregar animal", "Editar", and "Dar de baja" buttons are hidden (not just disabled)

---

## Epic 3: Registro de Producción y Alertas Automáticas

El operario puede registrar el volumen de leche por animal en cada sesión de ordeño en máximo 3 toques, y el sistema genera alertas automáticamente al detectar caídas de producción o animales sin registro por más de 24 horas.

### Story 3.1: API de Sesiones de Ordeño y Registros de Producción

As an operario,
I want API endpoints to create a milking session and record milk volume per animal,
So that daily production data is captured accurately with duplicate-session prevention.

**Acceptance Criteria:**

**Given** a logged-in operario
**When** POST /api/v1/sesiones is called with `{ fecha, tipo: "mañana" | "tarde" }`
**Then** a session is created with `finca_id` from JWT and `operario_id` set to the calling user's id; HTTP 201 is returned

**Given** a "mañana" session already exists for a given date in the farm
**When** POST /api/v1/sesiones with `tipo: "mañana"` for the same date is attempted
**Then** HTTP 409 is returned with `{ detail: "Ya existe una sesión de mañana para esta fecha" }`

**Given** a valid session exists
**When** POST /api/v1/sesiones/{sesion_id}/registros is called with `[{ animal_id, volumen_litros }]`
**Then** a production record is created for each animal in the session; HTTP 201 is returned with the created records

**Given** an `animal_id` that belongs to a different farm
**When** it is included in the production records batch
**Then** HTTP 404 is returned for that animal; no records are created for the batch

**Given** GET /api/v1/animales/{id}/produccion?periodo=30d is called
**When** the propietario is authenticated
**Then** daily totals for the last 30 days are returned as `[{ fecha, total_litros }]`; days without records are NOT included in the array (frontend renders them as gaps)

**Given** an animal has both a morning and afternoon record on the same day
**When** production aggregations are requested
**Then** daily total = morning + afternoon; weekly = sum of 7 prior days; monthly = sum of 30 prior days

---

### Story 3.2: Motor de Alertas Automáticas (Caída de Producción + 24h Sin Registro)

As a propietario,
I want the system to automatically generate alerts when production drops beyond my configured threshold or an animal goes unrecorded for 24+ hours,
So that I can identify problems immediately without manually comparing each animal's daily numbers.

**Acceptance Criteria:**

**Given** a production record is saved for animal X
**When** the backend processes the save
**Then** if X's production is less than `(100 - umbral)%` of its 7-day average, an alert of `tipo: "caida_produccion"`, `severidad: "critico"` is created in `alertas`; if the drop is between 10% and the threshold, `severidad: "advertencia"`

**Given** the alert threshold is configurable
**When** a propietario calls PATCH /api/v1/alertas/config with `{ umbral_porcentaje: 30 }`
**Then** the new threshold (between 10 and 50) is stored and all future evaluations use it; the default is 20%

**Given** a production record is saved for any animal
**When** the alert engine runs (as a BackgroundTask after the save)
**Then** it also checks ALL active animals in the farm that have at least one historical record; for each animal whose most recent record is > 24 hours ago and for which no unacknowledged `sin_registro_24h` alert exists, a new alert is created

**Given** an unacknowledged alert of tipo "sin_registro_24h" already exists for an animal
**When** another trigger condition fires for the same animal and tipo
**Then** no duplicate alert is created — the existing alert remains

**Given** GET /api/v1/alertas is called by the propietario
**When** the response is returned
**Then** all unacknowledged alerts for the farm are included, sorted by `severidad` (critico first), then `created_at` descending

**Given** POST /api/v1/alertas/{id}/ack is called by the propietario
**When** the request is processed
**Then** `reconocida=true` and `fecha_reconocimiento=now()` are set; the alert no longer appears in future calls to GET /api/v1/alertas

---

### Story 3.3: UI de Registro de Ordeño (Flujo Operario ≤ 3 Toques por Vaca)

As an operario,
I want to register milk production for every animal in a session in no more than 3 taps per animal,
So that I can complete data entry for 80 cows in under 90 minutes without errors or frustration.

**Acceptance Criteria:**

**Given** a logged-in operario navigates to /sesiones/nueva
**When** the page loads
**Then** two large, icon-labeled buttons are shown: "Ordeño — Mañana ☀" and "Ordeño — Tarde 🌙"

**Given** the operario selects a session type (tap 1)
**When** a session already exists for today with that type
**Then** the existing session opens in registration view instead of creating a duplicate; already-registered animals are marked with a green checkmark

**Given** the operario is in the session registration view
**When** they see the animal list
**Then** animals are sorted by número de arete; each row shows name + arete + a large numeric input field; the mobile numeric keyboard opens automatically

**Given** the operario taps on an animal row (tap 2), enters the liters, and taps confirm (tap 3)
**When** the record is submitted
**Then** the animal is marked as "registrado ✓" in green; the next unregistered animal in the list is auto-focused

**Given** the operario enters 0 or a negative value
**When** the form validates on submit
**Then** the error "El volumen debe ser mayor a 0" is shown inline — the record is not saved

**Given** all animals in the session are registered
**When** the operario taps "Finalizar sesión"
**Then** a summary screen shows: total litros del hato en esta sesión, número de vacas registradas, and any alerts triggered by this session (shown in red with animal name + arete)

---

### Story 3.4: Gráfica de Tendencia de Producción por Animal (30 días)

As a propietario,
I want to see a 30-day production trend chart for each individual animal on its detail page,
So that I can visually identify declining cows and make informed decisions without reading through tables of numbers.

**Acceptance Criteria:**

**Given** the propietario navigates to an animal's detail page
**When** the production chart section loads
**Then** a line chart displays daily production (litros) for the last 30 calendar days with one data point per day that has records

**Given** a day has no production record for that animal
**When** the chart renders
**Then** that day appears as a gap (broken line), NOT as zero — this visually distinguishes "data not entered" from "cow produced nothing"

**Given** the propietario taps a data point on mobile (Android 9+ Chrome)
**When** the tooltip appears
**Then** it shows: fecha, total litros that day, and number of sessions registered

**Given** the animal has fewer than 30 days of records
**When** the chart renders
**Then** only days with actual data are plotted; the chart does not pad with zeros

**Given** the chart renders on a mid-range Android tablet (768px width)
**When** the layout is observed
**Then** the chart is fully responsive, readable without zooming, and touch-interactive

---

## Epic 4: Dashboard del Propietario

El propietario puede ver en tiempo real el estado completo de su hato: producción total del día y la semana, alertas activas con jerarquía visual, ranking top/bottom 5 vacas, y puede reconocer alertas para marcarlas como revisadas.

### Story 4.1: API del Dashboard (Endpoint de Agregación)

As a propietario,
I want a single API endpoint that returns all dashboard metrics in one call,
So that the dashboard loads in under 3 seconds for a farm of up to 200 animals.

**Acceptance Criteria:**

**Given** a propietario calls GET /api/v1/dashboard
**When** the response is returned
**Then** it includes: `{ produccion_hoy_litros, produccion_7_dias_litros, alertas_activas_count, top_5_mayor: [{animal_id, numero_arete, nombre, litros_hoy}], top_5_menor: [...], ultimo_registro_at }`

**Given** no production records exist for today
**When** GET /api/v1/dashboard is called
**Then** `produccion_hoy_litros` is `null` (not 0) — the frontend must render "Sin registros hoy"

**Given** a farm with 200 active animals and data for the past 30 days
**When** GET /api/v1/dashboard is called
**Then** the DB query completes in under 500ms (indices on `finca_id` and `fecha` ensure this)

**Given** the `finca_id` filter
**When** the endpoint executes any aggregation
**Then** every sub-query is filtered by the calling user's `finca_id` from the JWT — data from other farms is never included

---

### Story 4.2: UI del Dashboard del Propietario

As a propietario,
I want a clear at-a-glance dashboard showing the current state of my herd when I open the app,
So that I can know in seconds if there's a problem that requires my attention today.

**Acceptance Criteria:**

**Given** a propietario navigates to /dashboard
**When** the page loads
**Then** within 3 seconds on a 4G connection they see: producción total hoy, producción últimos 7 días, número de alertas activas, y los rankings top 5 y bottom 5 vacas del día

**Given** `produccion_hoy_litros` is `null` in the API response
**When** the dashboard renders
**Then** the production card shows "Sin registros hoy" — never "0 L" or a blank

**Given** there are unacknowledged alerts
**When** the dashboard renders
**Then** the alert count badge is displayed in red; tapping it navigates to /alertas

**Given** the propietario taps an animal in the top/bottom 5 ranking
**When** the navigation occurs
**Then** they are taken to that animal's detail page with the 30-day trend chart

**Given** the dashboard is viewed on an Android 9+ smartphone in Chrome
**When** the layout renders
**Then** all metric cards and rankings are readable without horizontal scrolling (responsive grid layout)

---

### Story 4.3: Lista de Alertas y Reconocimiento (ACK)

As a propietario,
I want to see all active alerts in one place and mark them as reviewed,
So that I can track which animal issues I've addressed and which still need action.

**Acceptance Criteria:**

**Given** the propietario navigates to /alertas
**When** the page loads
**Then** all unacknowledged alerts are listed sorted by: crítico first, then by `created_at` descending; each alert shows animal name + arete, tipo, message, and creation date

**Given** an alert of tipo "caida_produccion"
**When** it is displayed
**Then** a red "CRÍTICO" badge is shown and the message reads: "#[arete] [nombre] — [litros] L (promedio 7 días: [avg] L, −[drop]%)"

**Given** the propietario clicks "Marcar como revisada" on an alert
**When** the action completes
**Then** the alert disappears from the active list immediately (optimistic update) and a success toast is shown in Spanish

**Given** the propietario wants to review historical acknowledged alerts
**When** they toggle "Ver alertas revisadas"
**Then** acknowledged alerts are shown in a separate section with their `fecha_reconocimiento`

**Given** an operario is logged in and navigates to /alertas
**When** the page renders
**Then** alerts are visible (read access) but the "Marcar como revisada" button is absent — RBAC: only propietario can acknowledge alerts

---

## Epic 5: Registro de Alimentación

El operario puede registrar el tipo y cantidad de alimento suministrado por animal o grupo, y el sistema calcula automáticamente la eficiencia alimenticia cuando existen registros de producción y alimentación del mismo día.

### Story 5.1: API de Registro de Alimentación y Cálculo de Eficiencia

As an operario,
I want API endpoints to record feed consumption per animal or group,
So that the propietario can track feed costs and calculate per-animal efficiency automatically.

**Acceptance Criteria:**

**Given** a logged-in operario
**When** POST /api/v1/alimentacion is called with `{ fecha, animal_id, tipo_alimento, cantidad_kg }`
**Then** a feed record is created with `finca_id` from JWT; HTTP 201 is returned

**Given** a batch feed registration by group
**When** POST /api/v1/alimentacion/grupo is called with `{ fecha, animal_ids: [...], tipo_alimento, cantidad_kg_total }`
**Then** `cantidad_kg_total` is divided equally among all animals; individual records are created for each animal in the group

**Given** GET /api/v1/animales/{id}/eficiencia?fecha=2026-05-28 is called
**When** both a production record AND a feed record exist for the animal on that date
**Then** the response includes `{ fecha, litros_producidos, kg_alimento, eficiencia_litros_por_kg }`

**Given** only one of the two record types exists for a day
**When** eficiencia is requested for that day
**Then** `eficiencia_litros_por_kg` is `null` — never calculated with partial data

**Given** GET /api/v1/alimentacion is called with filter `?fecha=2026-05-28`
**When** the propietario is authenticated
**Then** all feed records for the farm on that date are returned; other farms' records are never included

---

### Story 5.2: UI de Registro de Alimentación y Visualización de Eficiencia

As an operario,
I want a screen to register feed given to each animal or group,
So that feed data is tracked alongside production and the propietario can see efficiency metrics.

**Acceptance Criteria:**

**Given** the operario navigates to /alimentacion/nueva
**When** the page loads
**Then** they see: a date picker (defaulting to today), a toggle "Por animal" / "Por grupo", tipo de alimento selector (concentrado / forraje / suplemento), and cantidad kg input

**Given** the operario selects "Por grupo" and picks multiple animals
**When** they enter a total kg value
**Then** a preview shows kg per animal = total / count before saving; each individual amount is editable

**Given** the operario adjusts individual amounts
**When** they save
**Then** individual records are created with the adjusted values (not the evenly-distributed default)

**Given** the propietario views an animal's detail page
**When** the efficiency section renders
**Then** days where both production and feed records exist show the `eficiencia_litros_por_kg` value; days missing one or both record types show "—" (dash)

---

## Epic 6: Gestión de Usuarios

El propietario puede crear operarios, asignarles acceso y controlar sus permisos. Los operarios ven un mensaje de acceso restringido al intentar acceder a secciones del propietario.

### Story 6.1: API de Gestión de Usuarios (Solo Propietario)

As a propietario,
I want API endpoints to create, view, and remove users (operators) for my farm,
So that I can control exactly who can register data in my farm's platform.

**Acceptance Criteria:**

**Given** a propietario with a valid JWT
**When** POST /api/v1/usuarios is called with `{ email, nombre, rol: "operario", password }`
**Then** a new user is created with `finca_id` from JWT, password stored as bcrypt hash; HTTP 201 is returned

**Given** an operario JWT
**When** any endpoint under /api/v1/usuarios is called
**Then** HTTP 403 is returned

**Given** an email already registered in the same farm
**When** POST /api/v1/usuarios is called with that email
**Then** HTTP 409 is returned with `{ detail: "Ya existe un usuario con este email en la finca" }`

**Given** a propietario calls GET /api/v1/usuarios
**When** the response is returned
**Then** only users with `finca_id` matching the JWT are returned; users from other farms are never included

**Given** the propietario calls DELETE /api/v1/usuarios/{id} on an operario
**When** the request is processed
**Then** the user is deactivated and can no longer log in; HTTP 204 is returned

**Given** the propietario calls DELETE /api/v1/usuarios/{own_id}
**When** the request is processed
**Then** HTTP 403 is returned with `{ detail: "No puedes eliminar tu propia cuenta" }`

---

### Story 6.2: UI de Gestión de Usuarios

As a propietario,
I want a screen to manage the operators of my farm,
So that I can add new staff and revoke access when an employee leaves.

**Acceptance Criteria:**

**Given** the propietario navigates to /usuarios
**When** the page loads
**Then** all farm users are listed showing: nombre, email, rol, and fecha de creación

**Given** the propietario clicks "Agregar operario"
**When** they fill in nombre, email, and a temporary password and submit
**Then** the new operario appears in the list immediately and can log in with those credentials

**Given** the propietario clicks "Eliminar" on an operario
**When** a confirmation dialog is confirmed
**Then** the operario disappears from the list and a success toast is shown

**Given** the propietario's own row in the list
**When** the page renders
**Then** the "Eliminar" button is absent for their own row (cannot self-delete)

**Given** an operario is logged in and navigates to /usuarios
**When** the route resolves
**Then** the "Acceso restringido" message is shown — user list and management actions are not visible

---

## Epic 7: Trazabilidad y Reportes

El propietario puede consultar el historial de trazabilidad de cualquier animal y generar reportes semanales/mensuales en PDF y Excel para entregar a la cooperativa o al ICA (Resolución 017 de 2012).

### Story 7.1: API de Trazabilidad (Historial Append-Only + Exportación ICA 017)

As a propietario,
I want API endpoints to query the complete traceability history per animal and export it in ICA 017-compatible format,
So that I can comply with regulatory requirements and provide documentation to the veterinarian or cooperative.

**Acceptance Criteria:**

**Given** a production record is saved
**When** the backend processes the save
**Then** a corresponding event is automatically written to `eventos_trazabilidad` with: `animal_id`, `tipo_evento: "ordeno"`, `datos_evento: { sesion_id, volumen_litros }`, `responsable_id`, `created_at`

**Given** an animal is deactivated
**When** the deactivation is processed
**Then** a trazabilidad event of `tipo_evento: "baja"` is written with `datos_evento: { motivo, fecha_baja }`

**Given** GET /api/v1/animales/{id}/trazabilidad is called
**When** the propietario is authenticated
**Then** all events for that animal are returned in chronological order with: `id`, `tipo_evento`, `datos_evento`, `responsable_nombre`, `created_at`

**Given** GET /api/v1/trazabilidad/export?animal_id={id} is called
**When** the propietario is authenticated
**Then** a downloadable file is returned with at minimum: identificador del animal, fecha del evento, tipo de evento, and responsable del registro — the fields required by Resolución ICA 017 de 2012

**Given** any PUT, PATCH, or DELETE request is attempted on `eventos_trazabilidad`
**When** the request reaches the API
**Then** HTTP 405 is returned — the table is immutable by design

---

### Story 7.2: API de Generación de Reportes PDF y Excel (Async con BackgroundTasks)

As a propietario,
I want to generate weekly and monthly production reports asynchronously in PDF and Excel format,
So that I can download professional reports to share with my cooperative without the app freezing during generation.

**Acceptance Criteria:**

**Given** the propietario calls POST /api/v1/reportes/pdf with `{ tipo: "semanal" | "mensual", fecha_inicio, fecha_fin }`
**When** the request is received
**Then** HTTP 202 is returned immediately with `{ job_id: "uuid" }`; PDF generation begins as a FastAPI BackgroundTask

**Given** the same endpoint POST /api/v1/reportes/excel
**When** called with the same payload
**Then** HTTP 202 with a job_id is returned; Excel (.xlsx) generation begins as a BackgroundTask

**Given** GET /api/v1/reportes/{job_id}/status is called
**When** the report is still generating
**Then** `{ status: "pending" }` is returned; when complete, `{ status: "ready" }`; if failed, `{ status: "failed" }`

**Given** status is "ready"
**When** GET /api/v1/reportes/{job_id}/download is called
**Then** the binary file is returned with the correct Content-Type and Content-Disposition headers for download

**Given** the PDF report content
**When** inspected
**Then** it contains: producción por animal (table), total hato, consumo de alimento por animal, eficiencia alimenticia, alertas generadas en el período, and farm header (nombre finca, fecha del reporte)

**Given** the Excel (.xlsx) report content
**When** inspected
**Then** it contains the same data in tabular form, with columns matching the fields required by ICA Resolución 017 de 2012

---

### Story 7.3: UI de Historial de Trazabilidad por Animal

As a propietario,
I want to see the complete traceability history of any animal on its detail page,
So that I can review all recorded events in chronological order as required for ICA compliance.

**Acceptance Criteria:**

**Given** the propietario navigates to an animal's detail page
**When** the trazabilidad section loads
**Then** a chronological list of all events is shown: fecha/hora, tipo de evento (human-readable in Spanish), and who registered it (`responsable_nombre`)

**Given** an event of `tipo_evento: "ordeno"`
**When** displayed in the history list
**Then** the label reads "Ordeño — [litros] L" with the session date

**Given** an event of `tipo_evento: "alimentacion"`
**When** displayed
**Then** the label reads "Alimentación — [tipo_alimento], [kg] kg"

**Given** an event of `tipo_evento: "baja"`
**When** displayed
**Then** the label reads "Baja del hato — [motivo]"

**Given** the propietario views the history
**When** they look for edit or delete buttons on any event
**Then** no such buttons exist — the history is displayed as read-only with no modification options

---

### Story 7.4: UI de Reportes (Solicitud, Seguimiento y Descarga)

As a propietario,
I want a screen to generate and download weekly or monthly production reports,
So that I can share professional data with my cooperative or veterinarian with two taps.

**Acceptance Criteria:**

**Given** the propietario navigates to /reportes
**When** the page loads
**Then** they see: tipo selector (Semanal / Mensual), date range picker, format selector (PDF / Excel), and a "Generar reporte" button

**Given** the propietario clicks "Generar reporte"
**When** the request is submitted
**Then** the button is disabled, a spinner and "Generando reporte..." message appear; the app polls job status every 2 seconds

**Given** the job status becomes "ready"
**When** the poll detects the status change
**Then** a "Descargar" button replaces the spinner and the file downloads immediately when tapped

**Given** the job status becomes "failed"
**When** the poll detects it
**Then** the error message "Error al generar el reporte. Por favor intenta de nuevo." is shown in Spanish and the generate button is re-enabled

**Given** the propietario is on a mobile device
**When** they tap "Descargar"
**Then** the file downloads to the device's standard downloads folder (standard browser download behavior, no custom handling needed)
