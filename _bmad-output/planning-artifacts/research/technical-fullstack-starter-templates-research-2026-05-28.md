---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
workflowType: 'research'
lastStep: 6
research_type: 'technical'
research_topic: 'Full-stack starter templates 2025-2026 para SaaS B2B multi-tenant'
research_goals: 'Seleccionar el stack tecnológico más adecuado para un equipo de 3-4 estudiantes de ingeniería de sistemas que construyen una app SaaS B2B agrícola con multi-tenancy, PostgreSQL, RBAC, JWT, y despliegue en hosting de bajo costo'
user_name: 'Saram'
date: '2026-05-28'
web_research_enabled: true
source_verification: true
---

# Reporte de Investigación: Full-Stack Starter Templates 2025-2026 para SaaS B2B Multi-tenant

**Fecha:** 2026-05-28
**Autor:** Saram
**Tipo de investigación:** Técnica

---

## Resumen Ejecutivo

Se evaluaron 4 opciones de plantillas full-stack para el proyecto BoviTech, un SaaS B2B agrícola multi-tenant. La investigación considera los requisitos específicos: PostgreSQL, REST API, frontend responsivo (Android 9+ Chrome/Firefox), RBAC con 2 roles, generación de PDF/Excel, autenticación JWT/sesiones, despliegue en hosting de bajo costo, y equipos pequeños de estudiantes con experiencia intermedia en JS/TS.

---

## Tabla Comparativa

| Criterio | Next.js 15 puro | T3 Stack | NestJS + React (monorepo) | Supabase + Next.js |
|---|---|---|---|---|
| **Comando CLI** | `npx create-next-app@latest` | `npm create t3-app@latest` | Manual / `npx create-turbo@latest` | `npx create-next-app@latest` + Supabase CLI |
| **ORM / DB** | Ninguno incluido (añadir Prisma/Drizzle) | Prisma o Drizzle (elección) | TypeORM / Prisma (elección) | Supabase JS client (PostgreSQL gestionado) |
| **Autenticación** | Ninguna incluida | Auth.js / NextAuth | JWT propio o Passport.js | Supabase Auth (JWT integrado) |
| **Estilo / UI** | Ninguno incluido | Tailwind CSS | Sin opinión (añadir manualmente) | Tailwind CSS (plantillas oficiales) |
| **API** | Route Handlers (REST o RPC) | tRPC (type-safe, no REST puro) | REST con controladores NestJS | REST via Supabase o route handlers |
| **Multi-tenancy** | Manual | Manual | Manual | Row Level Security (RLS) en PostgreSQL |
| **RBAC** | Manual | Manual | Guards de NestJS | RLS + Policies en PostgreSQL |
| **PDF/Excel** | Instalar `jspdf`, `exceljs` | Instalar `jspdf`, `exceljs` | Instalar `jspdf`, `exceljs` | Instalar `jspdf`, `exceljs` |
| **Curva de aprendizaje** | Baja-Media | Media | Alta | Baja-Media |
| **Despliegue** | Vercel (ideal) + Railway/Render para DB | Vercel + Supabase/Railway para DB | Railway / Render (backend + frontend separados) | Vercel (frontend) + Supabase (backend) |
| **Costo estimado (escala académica)** | ~$0 Vercel Hobby + ~$5-10/mes DB | ~$0 Vercel Hobby + ~$5-10/mes DB | ~$10-20/mes Railway (app + DB) | ~$0 Supabase Free + $0 Vercel Hobby |
| **TypeScript** | Opcional (recomendado) | Obligatorio | Obligatorio | Opcional (recomendado) |
| **Unidad de despliegue** | Único (monolito full-stack) | Único (monolito full-stack) | Monorepo (2 servicios) | Único front + BaaS externo |

---

## Análisis por Opción

### 1. Next.js 15 Puro

**Comando:** `npx create-next-app@latest bovitech --typescript --tailwind --eslint --app`

**Decisiones arquitectónicas automáticas:** App Router, TypeScript opcional, Tailwind CSS opcional, ESLint. Todo lo demás (ORM, auth, RBAC) se agrega manualmente.

**Idoneidad para el equipo:** Alta flexibilidad pero requiere más decisiones propias. Ideal si el equipo quiere control total. La curva es manejable para quienes ya conocen React.

**Ventajas:** Máximo control, ecosistema enorme, desplegable en Vercel Hobby (gratuito), documentación excelente de Vercel.

**Desventajas:** Mucho boilerplate manual para auth, ORM, multi-tenancy y RBAC. Puede consumir tiempo valioso del equipo académico.

---

### 2. T3 Stack (create-t3-app)

**Comando:** `npm create t3-app@latest`

**Decisiones arquitectónicas automáticas:** Next.js + TypeScript (obligatorio) + tRPC (API type-safe) + Prisma o Drizzle (ORM) + Auth.js/NextAuth + Tailwind CSS. Todo integrado y preconfigurado.

**Idoneidad para el equipo:** Muy buena para equipos con experiencia intermedia en TS. La integración tRPC elimina errores de tipado entre frontend y backend. Prisma facilita las migraciones de esquema.

**Ventajas:** Todo preconfigurado y funciona junto desde el día 1. Auth.js soporta JWT y sesiones. Prisma hace multi-tenancy via `tenantId` en esquemas sencillo. Gran comunidad en 2025-2026.

**Desventajas:** tRPC NO es REST puro — si se requiere una API REST estándar (ej. para integración externa futura), hay fricción. TypeScript es obligatorio (no opcional). Algo más complejo de aprender al inicio.

---

### 3. NestJS + React/Next.js (Monorepo Turborepo)

**Comando:** `npx create-turbo@latest` (luego configurar apps/api con NestJS y apps/web con Next.js)

**Decisiones arquitectónicas automáticas:** Turborepo gestiona el monorepo. NestJS provee estructura MVC estricta, inyección de dependencias, guards para RBAC, decoradores para rutas REST. Prisma/TypeORM para DB.

**Idoneidad para el equipo:** Curva de aprendizaje más alta. NestJS tiene conceptos de Angular (módulos, providers, decoradores) que pueden abrumar a estudiantes. Más adecuado si el equipo tiene experiencia en backend estructurado.

**Ventajas:** La arquitectura REST más limpia y escalable. RBAC con Guards de NestJS es elegante. Separación clara frontend/backend. Mejor para proyectos que crecerán.

**Desventajas:** Más complejo de configurar y desplegar (2 servicios aunque en monorepo). Railway cobra por ambos servicios (~$10-20/mes). Mayor overhead para un equipo académico de 3-4 personas.

---

### 4. Supabase + Next.js

**Comando:** `npx create-next-app@latest bovitech` + `npx supabase init`

**Decisiones arquitectónicas automáticas:** Supabase provee PostgreSQL gestionado + Auth (JWT integrado) + Row Level Security para multi-tenancy + Storage + APIs autogeneradas (PostgREST). El frontend es Next.js estándar.

**Idoneidad para el equipo:** Muy alta. Supabase elimina la mayor parte de la complejidad del backend. Los estudiantes pueden enfocarse en la lógica de negocio y el frontend. La consola de Supabase es intuitiva.

**Ventajas:** Costo ~$0 en Free Tier (500 MB DB, 50k usuarios auth, 2 proyectos). Multi-tenancy con RLS en PostgreSQL es nativo y robusto. RBAC integrado vía policies. Auth JWT integrado. Despliegue Vercel (frontend) + Supabase (backend) sin costo para escala académica.

**Desventajas:** Vendor lock-in con Supabase. Si el proyecto migra fuera de Supabase, hay reescritura. La lógica RLS en SQL puede ser compleja de depurar. El Free Tier pausa proyectos inactivos después de 7 días (en 2025 Supabase cambió esta política, verificar estado actual).

---

## Recomendación

**Para el proyecto BoviTech (equipo académico de 3-4 estudiantes):**

### Opcion Recomendada: T3 Stack

**Comando:** `npm create t3-app@latest bovitech`

**Razón:** Ofrece el mejor equilibrio entre productividad y aprendizaje real. Todo está preconfigurado (Next.js + Prisma + Auth.js + Tailwind), TypeScript enseña buenas prácticas desde el inicio, y el despliegue en Vercel Hobby (gratis) + Railway/Supabase para DB ($5-10/mes) es viable para un proyecto académico. La curva de aprendizaje es manejable con experiencia intermedia en JS/TS.

**Segunda opción: Supabase + Next.js** si el equipo prefiere minimizar la complejidad del backend y el costo es la prioridad absoluta ($0 en Free Tier).

**Evitar:** NestJS + React monorepo para este contexto — la complejidad no justifica el beneficio para un equipo académico con tiempo limitado.

---

## Fuentes

- [Stack Auth Multi-Tenant Starter Template](https://github.com/stack-auth/multi-tenant-starter-template)
- [Create T3 App - Documentación oficial](https://create.t3.gg/en/introduction)
- [GitHub: T3 Stack](https://github.com/t3-oss/create-t3-app)
- [Turbo Starter: NestJS + Next.js](https://github.com/mrgmnn/turbo-starter)
- [Supabase Tenant RBAC Template](https://github.com/point-source/supabase-tenant-rbac)
- [Next.js CLI - Documentación oficial](https://nextjs.org/docs/app/api-reference/cli/create-next-app)
- [Railway vs Render 2026 - The Software Scout](https://thesoftwarescout.com/railway-vs-render-2026-best-platform-for-deploying-apps/)
- [Render Free Tier 2026](https://render.com/articles/platforms-with-a-real-free-tier-for-developers-in-2026)
- [Vercel Templates: Next.js SaaS](https://vercel.com/templates/next.js/next-js-saas-starter)
- [Supabase + Vercel Starter](https://vercel.com/templates/next.js/supabase)
