---
title: "BoviTech — Plataforma de Trazabilidad y Automatización para Ganadería Lechera"
status: final
created: 2026-05-28
updated: 2026-05-28
---

# BoviTech — PRD

## 1. Visión y Problema

### El problema

En fincas ganaderas medianas colombianas (50–200 vacas de ordeño), el registro de datos productivos sigue siendo manual, disperso e impreciso. El ganadero de la región Andina no tiene visibilidad real del desempeño individual de su hato, lo que genera pérdidas no detectadas por variaciones de producción por animal, sobrealimentación o subalimentación sin monitoreo, y riesgo de incumplimiento con los registros de trazabilidad exigidos por el ICA.

El productor toma decisiones de negocio con datos incompletos o inexistentes.

### La visión

BoviTech es una plataforma B2B de automatización y trazabilidad para el sector ganadero lechero colombiano que entrega al ganadero visibilidad individual de su hato en tiempo real — registrando volumen de leche por animal y consumo de alimento — con una interfaz diseñada para operarios rurales sin experiencia tecnológica previa.

---

## 2. Actores del Sistema

El sistema tiene tres actores con roles y necesidades distintas:

### Operario de ordeño *(usuario más frecuente del sistema)*
Persona que ejecuta los ordeños diariamente en la sala de ordeño. Conoce a cada vaca por nombre y número de arete. Sin experiencia previa con software. Usa el sistema entre 2 y 4 veces por día (sesiones de ordeño mañana y tarde). Si el operario rechaza la herramienta, el ganadero nunca recibe el valor prometido.

**Lo que necesita de BoviTech:** registrar datos de producción y alimentación en el menor número de pasos posibles, sin requerir lectura ni formación técnica.
**Lo que rechaza:** cualquier flujo con más de 3 pasos por vaca o que falle si se pierde la señal.

### Ganadero / Propietario *(tomador de decisiones)*
Propietario o administrador de la finca. Nivel técnico empírico o básico. Usa el sistema 1–2 veces por día para revisar el estado de su hato, alertas y reportes. Vinculado a cooperativa lechera. Sus decisiones se basan en voz a voz y en el consejo de su asesor veterinario.

**Lo que necesita de BoviTech:** alertas accionables cuando una vaca tiene problemas, reportes listos para entregar a la cooperativa o al veterinario, visibilidad del costo de alimentación vs producción.
**Lo que rechaza:** dashboards complejos, tecnología que falle sin internet, costos fuera de su margen.

### Cooperativa / Asesor veterinario *(canal e influenciador — Fase 3)*
La cooperativa y el veterinario asociado a ella influyen directamente en la decisión de compra del ganadero. En Fase 3 tendrán acceso a un panel multi-finca para acompañar a sus productores asociados.

---

## 3. Journeys de Usuario

### UJ-1 — Mateo registra el ordeño de la mañana

**Protagonista:** Mateo, 38 años, operario con 12 años en la finca. Tiene Android básico. Nunca usó software antes de BoviTech.

1. **5:00 a.m.** — Mateo abre BoviTech en la tablet de la sala de ordeño. Toca "Ordeño — mañana".
2. Las vacas entran una por una al puesto de ordeño. Mateo ve la lista de vacas pendientes en la pantalla.
3. Toca el nombre o número de la primera vaca y confirma que inició el ordeño. El sistema activa simultáneamente el registro de concentrado.
4. **[Fase 1]** Al terminar esa vaca, Mateo ingresa el volumen leído en el medidor (ej. 4.8 L) y la cantidad de concentrado suministrado.
   **[Fase 2]** El sensor en el punto de ordeño captura el volumen automáticamente; Mateo solo confirma si algo fue inusual.
5. Repite para cada vaca de la sesión (~80 vacas en 90 minutos).
6. Al finalizar la sesión, el sistema muestra el resumen: litros totales del hato y alertas destacadas en rojo. Mateo avisa a Carlos si ve una alerta crítica.

### UJ-2 — Carlos revisa el estado de su hato

**Protagonista:** Carlos, 52 años, propietario de finca con 80 vacas en Antioquia. Entrega leche a Colanta. Usa WhatsApp, poco más.

1. **7:00 a.m.** — Carlos abre BoviTech en su smartphone tras el primer ordeño. Ve el dashboard: "Producción hoy: 342 L. Ayer: 351 L (−2.6%)".
2. Ve 1 alerta crítica en rojo: "#47 La Mora — 3.1 L (promedio 7 días: 4.9 L, −37%)".
3. Toca la vaca. Ve el historial de los últimos 14 días en gráfica: tendencia descendente clara desde hace 5 días.
4. Exporta el historial de La Mora en PDF y se lo envía al veterinario por WhatsApp.
5. Revisa el ranking de las 5 vacas con mayor y menor producción de la semana.
6. Descarga el reporte semanal del hato para su archivo y para la cooperativa.

---

## 4. Propuesta de Valor

Según la investigación de mercado realizada en Colombia a mayo de 2026, BoviTech es la única solución disponible que combina simultáneamente:

1. Captura automática de volumen de leche **por animal** por ciclo de ordeño
2. Seguimiento de consumo de alimento individual
3. Interfaz diseñada para operario rural (curva de aprendizaje < 2 horas)
4. Funcionamiento **offline-first** para zonas sin conectividad estable
5. Precio accesible para finca mediana colombiana

Ningún competidor identificado en Colombia combina estos cinco atributos. DeLaval (el referente más cercano en automatización) requiere una inversión de hardware de $17.5M–$30M COP solo en sensores para una finca de 50 vacas, más $200K–$400K COP/mes en suscripción de nube — entre 20 y 25 veces el costo de hardware de BoviTech.

---

## 5. Fases del Producto

### Fase 1 — MVP Software *(alcance actual)*

Plataforma web con ingreso manual de datos. Los datos que en Fase 2 capturará el dispositivo IoT son ingresados manualmente por el operario en Fase 1. Objetivo: demostrar la propuesta de valor de la plataforma y validar la UX con usuarios reales.

- Gestión del hato (animales, registros individuales)
- Ingreso de producción por ordeño (sesión mañana / tarde)
- Registro de alimentación por animal o por grupo
- Dashboard individual por animal y por hato
- Alertas configurables por caída de producción
- Reportes semanales y mensuales (PDF / Excel)
- Trazabilidad básica compatible con Resolución ICA 017 de 2012
- Roles: Propietario y Operario

### Fase 2 — Integración IoT

Incorporación del dispositivo físico en cada puesto de ordeño.

- Dispositivo IoT: sensor de flujo de leche + identificación de animal por RFID/arete + registro de concentrado dispensado + sensor ambiental (temperatura de sala)
- Captura automática de volumen de leche por animal por ciclo
- Captura de consumo de alimento por animal
- Sincronización offline → nube con cola de mensajes persistente
- App móvil (PWA o nativa)
- Notificaciones por WhatsApp / SMS para alertas críticas

### Fase 3 — Ecosistema Cooperativo

- API de integración con cooperativas (Colanta, FEDECOOLECHE)
- Dashboard multi-finca para asesores veterinarios de cooperativa
- Revenue sharing automatizado con cooperativas
- Trazabilidad avanzada y certificaciones ICA

---

### Límites del producto

**Fuera del alcance en cualquier fase:**
- Gestión reproductiva (celos, inseminaciones, partos)
- Monitoreo de salud animal o detección de enfermedades
- Funcionalidades de contabilidad o nómina de la finca
- Integración con proveedores de alimento o farmacias veterinarias

**Fuera del alcance de Fase 1** *(incorporado en fases siguientes):*
- Hardware IoT físico y captura automática de datos
- API para cooperativas
- App móvil nativa
- Notificaciones por WhatsApp o SMS
- Dashboard multi-finca para cooperativas o veterinarios

---

## 6. Funcionalidades — Fase 1 MVP

Los requisitos funcionales de Fase 1 se organizan en siete grupos. Los ítems marcados con `[FASE 2]` están documentados aquí para contexto de diseño pero no forman parte del alcance de entrega de Fase 1.

### F1. Gestión del Hato

- **FR-1.1** La plataforma permite registrar animales con: identificador único (número de arete), nombre, raza, fecha de nacimiento y fecha del último parto. *Criterio:* el animal aparece en la lista de vacas activas y puede recibir registros de producción el mismo día de su creación.
- **FR-1.2** La plataforma permite dar de baja un animal con fecha y motivo (venta, muerte, descarte productivo). *Criterio:* el animal dado de baja deja de aparecer en los flujos de registro activo y sus datos históricos se conservan en modo solo lectura.
- **FR-1.3** El dashboard muestra el listado completo del hato activo con la producción del último ordeño registrado por animal. *Criterio:* la lista carga en ≤ 3 segundos y refleja el último registro disponible.

### F2. Registro de Producción

- **FR-2.1** El operario puede registrar el volumen de leche (en litros, con un decimal) por animal para una sesión de ordeño identificada como "mañana" o "tarde" del día en curso. *Criterio:* no es posible registrar dos sesiones del mismo tipo (ej. dos "mañana") para la misma vaca en el mismo día calendario.
- **FR-2.2** La plataforma calcula la producción diaria de cada animal como la suma de las sesiones "mañana" y "tarde" del mismo día calendario. La producción semanal es la suma de los 7 días anteriores. La mensual, los 30 días anteriores. *Criterio:* si solo existe una sesión en el día, la producción diaria equivale a esa sesión; no se imputa la sesión faltante.
- **FR-2.3** La plataforma muestra el historial de producción por animal en una gráfica de tendencia de los últimos 30 días. *Criterio:* la gráfica muestra un punto por día con el total diario; los días sin registro se visualizan como brecha en la gráfica, no como cero.
- **FR-2.4** *\[FASE 2]* La captura de volumen ocurre automáticamente vía sensor de flujo en el punto de ordeño, sin acción del operario.

### F3. Registro de Alimentación

- **FR-3.1** El operario puede registrar el tipo de alimento (concentrado, forraje, suplemento) y la cantidad en kilogramos suministrados por animal o por grupo de animales en la misma sesión de ordeño. *Criterio:* si se registra por grupo, la plataforma distribuye el total en partes iguales entre los animales del grupo; el operario puede ajustar individualmente antes de guardar.
- **FR-3.2** La plataforma calcula la eficiencia alimenticia por animal como: litros de leche producidos / kg de alimento consumido en el mismo día. *Criterio:* el indicador solo se muestra en días donde existen registros de producción Y alimentación; no se calcula con datos parciales.

### F4. Alertas y Monitoreo

- **FR-4.1** La plataforma genera una alerta cuando la producción de un animal en un día cae más de un porcentaje configurable (valor por defecto: 20%) respecto al promedio de sus últimos 7 días con registro. *Criterio:* el umbral es configurable por el propietario entre 10% y 50%; la alerta se genera automáticamente al guardar el registro que supera el umbral.
- **FR-4.2** La plataforma genera una alerta si un animal activo no tiene registro de producción en más de 24 horas desde su último registro. *Criterio:* la alerta aparece en el dashboard del propietario; el operario la ve solo si tiene acceso a alertas habilitado por el propietario.
- **FR-4.3** Las alertas se muestran en el dashboard con jerarquía visual: crítico (rojo), advertencia (amarillo). *Criterio:* una alerta no desaparece hasta que el propietario la marca como revisada.
- **FR-4.4** *\[FASE 2]* Las alertas críticas se envían por WhatsApp al número del propietario configurado en la cuenta.

### F5. Dashboard y Reportes

- **FR-5.1** El dashboard del propietario muestra: producción total del hato en el día actual, producción total de los últimos 7 días, número de alertas activas sin revisar, y acceso rápido a las 5 vacas con mayor y menor producción del día. *Criterio:* todos estos valores se calculan a partir de los registros existentes; si no hay registros del día, muestra "Sin registros hoy" en lugar de cero.
- **FR-5.2** La plataforma genera un reporte semanal (lunes a domingo) y uno mensual con: producción por animal, producción total del hato, consumo de alimento por animal, eficiencia alimenticia por animal, y listado de alertas generadas. *Criterio:* el reporte se exporta en PDF y en Excel (.xlsx); los campos requeridos por la Resolución ICA 017 de 2012 están presentes en ambos formatos.

### F6. Trazabilidad

- **FR-6.1** La plataforma mantiene el historial de eventos por animal: ordeños registrados, cantidades de alimento, fechas de baja, y notas de novedad ingresadas por el operario o el propietario. *Criterio:* el historial es de solo lectura una vez guardado; no se pueden editar ni eliminar registros históricos.
- **FR-6.2** La plataforma exporta el historial de trazabilidad de un animal o del hato completo en un formato compatible con la Resolución ICA 017 de 2012. *Criterio:* el archivo exportado incluye como mínimo: identificador del animal, fecha de cada evento, tipo de evento, y responsable del registro.

  > **[NOTA PARA PM]** El formato exacto de exportación debe validarse con el ICA antes de Fase 2; en Fase 1 el formato es best-effort.

### F7. Gestión de Usuarios y Acceso

- **FR-7.1** La plataforma soporta dos roles por cuenta de finca: **Propietario** y **Operario**.
- **FR-7.2** El operario puede: registrar producción, registrar alimentación, y ver alertas si el propietario lo habilita. No puede acceder a reportes financieros, configuración de la cuenta, ni gestión de animales.
- **FR-7.3** El propietario tiene acceso completo: configuración, reportes, gestión de animales, gestión de usuarios, y configuración de umbrales de alerta. *Criterio:* un operario que intente acceder a una sección de propietario recibe un mensaje de acceso restringido, no una pantalla de error.

---

## 7. Requisitos No Funcionales

### Usabilidad

- **NFR-1** Un operario rural sin experiencia tecnológica debe operar el sistema de forma autónoma después de máximo 2 horas de capacitación presencial.
- **NFR-2** El flujo de registro de un ordeño (una vaca, una sesión) debe completarse en máximo 3 toques en pantalla desde que el operario abre la sesión de ordeño.
- **NFR-3** La interfaz debe estar en español colombiano, con íconos visuales como apoyo al texto para usuarios con baja lectura digital. No se usan anglicismos técnicos.

### Disponibilidad y Conectividad

- **NFR-4** `[Fase 1]` La plataforma web debe ser funcional con latencias de hasta 5 segundos en conexiones 3G móvil.
- **NFR-5** `[Fase 2]` La plataforma debe funcionar sin conexión a internet y sincronizar automáticamente al recuperar señal; la cola de sincronización debe conservar hasta 72 horas de registros sin pérdida.
- **NFR-6** La plataforma debe tener disponibilidad ≥ 99% en horarios pico de ordeño: 5:00–8:00 a.m. y 3:00–6:00 p.m. hora Colombia.

### Seguridad y Privacidad

- **NFR-7** Los datos de producción son propiedad del ganadero y no pueden ser compartidos con terceros (incluidas cooperativas) sin consentimiento explícito, cumpliendo la Ley 1581 de 2012.
- **NFR-8** Comunicaciones cifradas en tránsito (TLS 1.2+); datos en reposo cifrados. Las credenciales de acceso se almacenan con hash (no en texto plano).

### Rendimiento y Capacidad

- **NFR-9** El dashboard principal carga en menos de 3 segundos en conexión 4G para un hato de hasta 200 animales.
- **NFR-10** La plataforma soporta hasta 200 animales activos por finca en Fase 1.

### Compatibilidad

- **NFR-11** La plataforma web funciona en navegadores Chrome y Firefox en tabletas y smartphones Android de gama media (Android 9+) sin instalación de aplicación.

---

## 8. Modelo de Negocio

### Modelo de monetización

BoviTech opera como **SaaS por suscripción mensual** (modelo recurrente). El modelo de pago único (una transacción sin relación continua) fue descartado porque el producto requiere soporte técnico continuo, actualizaciones de firmware en Fase 2, y la propuesta de valor se acumula con el tiempo (los datos históricos son el activo del ganadero). Un modelo de pago único no sostiene estos costos operativos recurrentes.

### Estructura de precios

> **\[SUPUESTO — pendiente validación con entrevistas a ganaderos reales]**

| Plan | Precio / mes | Alcance |
|---|---|---|
| Plan Básico | $150.000 COP | Hasta 50 vacas |
| Plan Estándar | $280.000 COP | 50–120 vacas *(plan núcleo)* |
| Plan Avanzado | $420.000 COP | 120–200+ vacas + API cooperativa (Fase 3) |

**Hardware** *\[FASE 2 — SUPUESTO]:* Pago único $800.000–$1.200.000 COP por finca (financiable por cuotas o a través de cooperativa).

### Referencia de precios vs. competencia

| Solución | Hardware (50 vacas) | Suscripción mensual (50 vacas) |
|---|---|---|
| **DeLaval DelPro** | $17.500.000–$30.000.000 COP | $200.000–$400.000 COP (DeLaval Plus) |
| **Progan** (solo software) | N/A | ~$41.000 COP |
| **BoviTech** (Fase 2) | $800.000–$1.200.000 COP | $150.000 COP |

BoviTech tiene un hardware entre 20 y 25 veces más barato que DeLaval para el mismo tamaño de hato, con una suscripción mensual similar o inferior — y con una interfaz diseñada específicamente para el contexto rural colombiano donde DeLaval no tiene soporte local.

### Estrategia de entrada — Early Adopters *(primeros 6 meses de operación comercial)*

> **\[SUPUESTO — modelo a confirmar con primeros clientes]**

- Sin cobro del costo del hardware durante los primeros 6 meses (el hardware se instala sin pago inicial)
- Plan Estándar a $180.000 COP/mes durante los primeros 3 meses (luego pasa a precio regular)
- A partir del mes 7 el ganadero paga el hardware en cuotas mensuales o en un solo pago

### Canal — Revenue Sharing con cooperativas *\[FASE 3 — SUPUESTO]*

Las cooperativas lecheras (Colanta, afiliadas de FEDECOOLECHE) identifican clientes, generan confianza y facilitan instalación. A cambio reciben un porcentaje de la suscripción mensual por cada ganadero adoptante.

> **\[SUPUESTO]** Porcentaje pendiente de negociación. Referencia para modelos B2B2C similares en LATAM: 10–15%.

### Canal de referencia temprana — Asesores veterinarios

Los asesores veterinarios que acompañan fincas medianas son el canal de referencia prioritario antes de formalizar acuerdos con cooperativas. Una recomendación del veterinario de confianza tiene mayor peso que cualquier publicidad. Táctica: programa de embajadores para veterinarios que recomienden BoviTech a sus clientes, con acceso anticipado a la plataforma y soporte prioritario.

---

## 9. Métricas de Éxito

### North Star Metric

**Litros de leche registrados automáticamente por vaca al mes** — valida que el dispositivo funciona, que el usuario está activo, y que BoviTech cumple su propuesta de valor.

**Métrica operativa de Fase 1** (proxy hasta que exista hardware IoT): **porcentaje de ordeños programados registrados activamente en la plataforma por finca por semana.** Esta es la métrica de seguimiento principal mientras no haya captura automática. La North Star reemplaza al proxy en el momento en que el dispositivo IoT esté operativo.

### KPIs — Fase 1 (MVP Software)

| KPI | Meta | Actor dueño |
|---|---|---|
| Fincas piloto con acceso activo a los 90 días | 3–5 fincas | Equipo BoviTech |
| % de ordeños programados registrados en plataforma | ≥ 80% por finca / semana | Operario |
| Tiempo de capacitación del operario | ≤ 2 horas (100% de pilotos) | Operario |
| NPS del propietario / ganadero | ≥ 30 | Ganadero |
| Alertas que derivaron en acción del ganadero | ≥ 60% de alertas generadas | Ganadero |
| Tasa de abandono del operario en mes 1 | < 20% de operarios capacitados | Operario |

### KPIs — Fase 2 (Lanzamiento Comercial)

| KPI | Meta | Actor dueño |
|---|---|---|
| Suscripciones activas a los 3 meses | 5 fincas | Equipo BoviTech |
| Costo de adquisición de cliente (CAC) | < 2 mensualidades | Equipo BoviTech |
| Retención mensual | ≥ 80% en el primer trimestre | Ganadero |
| Ordeños capturados automáticamente | ≥ 90% al mes 2 | Sistema IoT |
| Tiempo de instalación del dispositivo | < 4 horas por finca | Equipo BoviTech |
| Recuperación de inversión por cliente | ≤ 6 meses | Equipo BoviTech |
| Fallas técnicas recurrentes por finca / mes | 0 | Sistema IoT |

### Contra-métricas

- % de operarios que abandonan el registro antes del primer mes → señal de UX fallida
- Churn en meses 2–3 → el valor percibido no supera la fricción del uso diario
- Alertas ignoradas sistemáticamente → las alertas no son accionables o son ruidosas

---

## 10. Panorama Competitivo

### Competidores directos

| Competidor | Tipo | Hardware (50 vacas) | Suscripción mensual | Brecha vs BoviTech |
|---|---|---|---|---|
| **DeLaval DelPro** | Hardware + software global | $17.5M–$30M COP | $200K–$400K COP | Precio prohibitivo; sin soporte local Colombia |
| **Software Ganadero SG** | SaaS local (líder de mercado) | N/A | No publicado | Registro manual, sin IoT |
| **Progan** | Software desktop (Bogotá) | N/A | ~$41K COP/mes | Sin hardware, sin automatización |
| **GanSoft** | SaaS freemium (LATAM) | N/A | Gratuito (básico) | Sin hardware, sin automatización |
| **Merck Animal Health** | Collar IA | Premium | Premium | Precio fuera del nicho objetivo |

### Competidores adyacentes

| Competidor | País | Qué hace | Brecha vs BoviTech |
|---|---|---|---|
| **Basto** | Argentina | Aretes IoT, salud, cercas virtuales | No captura volumen de leche por animal |
| **GanaderIA** | Colombia | Drones + IA para pesaje y conteo visual | Sin hardware fijo en sala de ordeño |
| **Identigan** | Colombia | Trazabilidad electrónica normativa | Solo cumplimiento, sin datos de producción |

### Ventaja diferencial

BoviTech llena el espacio vacío entre Progan/GanSoft (software barato, registro manual) y DeLaval (automatización completa, precio prohibitivo). Es la única opción que entrega automatización real al precio de una finca mediana colombiana.

---

## 11. Contexto de Mercado

Colombia es el 4° productor de leche en América Latina, con más de 320.000 familias productoras. Antioquia concentra el 20,3% de la producción nacional. Colanta tiene ~3.622 productores asociados; FEDECOOLECHE agremia a Colanta y otras 63+ cooperativas lecheras. El mercado global de ganadería de precisión proyecta crecer de USD 4.900M en 2024 a USD 9.700M en 2032, con un crecimiento del 31% en adopción de herramientas tecnológicas en el sector agropecuario colombiano.

El segmento de fincas medianas (50–200 vacas) es el que tiene mayor presión de eficiencia por parte de cooperativas y el menor acceso a soluciones de automatización al precio de DeLaval. Es el segmento estructuralmente desatendido.

### Aliados institucionales relevantes

| Programa / Entidad | Relevancia |
|---|---|
| Fedegan Gantech | Iniciativa de IA aplicada a ganadería — aliado natural y canal de visibilidad |
| MinTIC AgroTech 2026 | Programa activo de digitalización agropecuaria — oportunidad de postulación |
| SENA AgroSENA | Canal de capacitación de operarios |
| ICA + Fedegan | Impulso a trazabilidad bovina digitalizada — alineación normativa |

---

## 12. Restricciones y Consideraciones Técnicas

### Conectividad rural

Solo el 28,8% de las zonas rurales colombianas tienen internet estable. En Fase 1 (software web), la plataforma requiere conexión pero debe tolerar intermitencia. En Fase 2, el sistema debe funcionar completamente offline y sincronizar al recuperar señal, conservando hasta 72 horas de registros locales sin pérdida.

### Marco regulatorio

- Los datos de producción son propiedad del ganadero — Ley 1581 de 2012.
- El sistema debe generar registros compatibles con la **Resolución ICA 017 de 2012** (trazabilidad bovina obligatoria).

### Hardware `[FASE 2]`

En la sala de ordeño las vacas pasan por cada puesto una a una: mientras se ordeñan, reciben concentrado simultáneamente. El dispositivo IoT se instala en cada puesto y captura cuatro variables por ciclo:

1. **Identificación del animal** — por RFID o lectura de arete
2. **Volumen de leche** — sensor de flujo
3. **Concentrado dispensado** — registro por animal en la sesión
4. **Temperatura ambiental** — sensor en sala

El dispositivo opera sin conexión continua y sincroniza en cola asíncrona al recuperar señal. Tiempo de instalación por finca: < 4 horas. Hardware y plataforma operan independientemente e integran vía API (modularidad requerida).

### Etapa actual del equipo

Proyecto iniciado como trabajo de aula de ingeniería de sistemas, con intención de escalar a startup. Fase 1 es software puro; los datos IoT son ingresados manualmente (simulando la captura automática futura). Sin hardware físico ni financiación externa a la fecha.

---

## 13. Preguntas Abiertas

| # | Pregunta | Impacto | Estado |
|---|---|---|---|
| OQ-1 | ¿Los rangos de precio propuestos ($150K–$420K COP/mes) son aceptados por el segmento objetivo? | Alto — valida toda la estructura de precios | Pendiente: entrevistas con ganaderos |
| OQ-2 | ¿Qué porcentaje de revenue sharing hace viable el canal cooperativo (Colanta / FEDECOOLECHE)? | Alto — define viabilidad del go-to-market | Pendiente: acercamiento a cooperativas |
| OQ-3 | ¿Qué tecnología de hardware es más viable para el punto de ordeño colombiano dado el costo? (sensor de flujo, RFID, cámara + visión artificial) | Alto — define arquitectura de Fase 2 | Pendiente: exploración técnica |
| OQ-4 | ¿Es viable desarrollar el hardware in-house o se debe alianzar con un fabricante o laboratorio? | Alto — define modelo operativo de Fase 2 | Pendiente: evaluación de capacidades |
| OQ-5 | ¿El proyecto califica para MinTIC AgroTech 2026 o Fedegan Gantech como fuente de financiación o validación? | Medio — puede acelerar la transición de académico a startup | Pendiente: revisión de convocatorias |

---

## 14. Glosario

| Término | Definición en este PRD |
|---|---|
| **Hato** | Conjunto de animales bovinos activos en una finca |
| **Vaca activa** | Animal en producción registrado en la plataforma, no dado de baja |
| **Operario** | Usuario que ejecuta los ordeños y registra datos en la plataforma |
| **Propietario** | Dueño o administrador de la finca; tomador de decisiones |
| **Sesión de ordeño** | Ciclo de ordeño identificado como "mañana" o "tarde" de un día calendario |
| **Producción diaria** | Suma de litros de las sesiones mañana y tarde de un mismo día |
| **Eficiencia alimenticia** | Litros de leche producidos / kg de alimento consumido en el mismo día |
| **Alerta crítica** | Caída de producción de un animal por encima del umbral configurado vs su promedio de 7 días |
| **Punto de ordeño** | Puesto físico en la sala de ordeño donde se ordeña una vaca a la vez |
| **Revenue sharing** | Modelo en el que la cooperativa recibe un porcentaje de la suscripción mensual por cada ganadero que incorporó al sistema |

---

## 15. Índice de Supuestos

| ID | Supuesto | Sección | Cómo validar |
|---|---|---|---|
| S-1 | Los precios de suscripción ($150K–$420K COP/mes) son aceptables para el segmento objetivo | §8 | Entrevistas con ganaderos (OQ-1) |
| S-2 | El hardware de Fase 2 tiene un costo de fabricación que permite un precio de venta de $800K–$1.2M COP | §8 | Cotización con proveedores / laboratorios de electrónica |
| S-3 | El revenue sharing del 10–15% es atractivo para las cooperativas | §8 | Acercamiento a Colanta / FEDECOOLECHE (OQ-2) |
| S-4 | La oferta early adopter (hardware sin costo 6 meses + descuento 3 meses) es financieramente sostenible | §8 | Modelo financiero detallado (pendiente) |
