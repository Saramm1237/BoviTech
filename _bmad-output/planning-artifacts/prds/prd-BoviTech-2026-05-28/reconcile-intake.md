# Reconciliación de Input — BoviTech PRD

## Resumen

El PRD captura la esencia del intake con buena fidelidad en cuanto a segmento, propuesta de valor y KPIs, pero omite cuatro elementos técnicos y de negocio específicos del intake original: la captura de condiciones del entorno por el dispositivo IoT, el papel del asesor veterinario como actor del sistema, la distinción entre el modelo "Solution Provider" y el SaaS puro que el PRD declara, y el tratamiento completo de la oferta early adopter (el PRD omite el descuento en hardware para los primeros adoptadores). Además, algunos KPIs del intake fueron modificados sutilmente o desplazados de fase.

---

## Gaps identificados

- **[alto]** Captura de condiciones del entorno (temperatura) — El intake especifica que el hardware captura "condiciones del entorno (temperatura, etc.)". El PRD en la Fase 2 menciona únicamente "captura automática de volumen de leche por animal por ciclo" y "captura de consumo de alimento", pero no hace ninguna referencia a sensores ambientales ni temperatura. Esto es un requisito funcional del dispositivo que desaparece completamente del PRD. *Acción:* Añadir en la sección 4 (Fase 2 — Integración IoT) un ítem: "Captura de condiciones del entorno en sala de ordeño (temperatura ambiente, humedad)." Y añadir un FR correspondiente en la sección 5 o en la nota de alcance Fase 2.

- **[alto]** Modelo de negocio declarado como "SaaS puro" vs. "Solution Provider" del intake — El intake declara explícitamente: *"Modelo de negocio: Solution Provider."* El PRD (sección 7) indica: *"BoviTech opera como SaaS por suscripción mensual (modelo recurrente). Se descartó el modelo de pago único."* Esta redacción descarta el modelo de pago único de hardware, pero el intake establece hardware con pago único de $800K–$1.2M COP como parte estructural del modelo Solution Provider (no como alternativa desechada). El PRD relativiza esto al decir "financiable por cuotas" sin mencionar el pago único como opción base. La justificación del descarte es interna del PRD y no del intake. *Acción:* Precisar en la sección 7 que el modelo es "Solution Provider" (hardware + software como solución integrada), que el hardware tiene pago único como opción base y que la suscripción cubre el software. El descarte del "pago único de software sin relación continua" no debe leerse como eliminación del pago único de hardware.

- **[alto]** Early adopter: descuento en hardware omitido — El intake dice: *"Early adopters: 6 meses sin cobro hardware + Plan Estándar a $180K/mes primeros 3 meses."* El PRD (sección 7) recoge el Plan Estándar a $180.000/mes por 3 meses, pero transforma el "sin cobro de hardware" en "Hardware sin costo adicional (incluido en la suscripción)", que es una formulación ambigua y diferente. "Incluido en la suscripción" sugiere un modelo bundle permanente, mientras el intake indica un beneficio temporal de 6 meses para early adopters. *Acción:* Corregir la redacción: "Los primeros clientes no pagan el hardware durante los primeros 6 meses (beneficio temporal, no modelo permanente). A partir del mes 7, el hardware retoma su precio de lista ($800K–$1.2M COP pago único o financiado)."

- **[medio]** Asesor veterinario como actor influyente — El intake menciona: *"Decisiones influenciadas por voz a voz y asesores veterinarios"*, y la Fase 3 del PRD introduce un "Dashboard multi-finca para asesores veterinarios de cooperativa". Sin embargo, el intake señala al asesor veterinario como canal de influencia en la decisión de compra, no solo como usuario de Fase 3. Este rol en la estrategia de adquisición (go-to-market) no aparece en el PRD como actor de ventas/adopción en Fase 1 ni en la sección de cliente objetivo. *Acción:* Añadir en la sección 2 (Cliente Objetivo) una nota sobre el asesor veterinario como influenciador clave en la decisión de compra, y considerarlo en la estrategia de entrada temprana (no solo en Fase 3).

- **[medio]** KPI "Recuperación de inversión ≤ 6 meses" desplazado a Fase 2 — El intake presenta este KPI como parte de los KPIs financieros generales del proyecto, sin adscribirlo explícitamente a una fase. El PRD lo ubica solo en la tabla de KPIs de Fase 2 (Lanzamiento Comercial). Dado que la inversión del ganadero en software ya existe desde Fase 1, la métrica debería al menos señalarse como objetivo desde la activación comercial temprana. *Acción:* Añadir una nota en la tabla de KPIs Fase 1 indicando que "Recuperación de inversión ≤ 6 meses" es una meta que se mide desde el primer cliente de pago, independiente de la fase de hardware.

- **[medio]** KPI "90% de ordeños registrados automáticamente al mes 2" — El intake vincula este KPI a la automatización IoT: *"90% ordeños registrados automáticamente al mes 2."* El PRD lo traslada correctamente a Fase 2, pero cambia la formulación a "Ordeños capturados automáticamente (dispositivo) ≥ 90% al mes 2", perdiendo la referencia temporal de "al mes 2 de operación del dispositivo". La aclaración de qué cuenta como "mes 2" (mes 2 desde instalación del IoT, no desde lanzamiento de software) debería ser explícita. *Acción:* Aclarar en la tabla de KPIs Fase 2: "≥ 90% al mes 2 desde instalación del dispositivo IoT."

- **[bajo]** Conectividad intermitente en Fase 1 — El intake dice: *"sistema debe funcionar con conectividad intermitente"* de forma general, sin limitarlo a la Fase 2. El PRD en NFR-4 dice: "*[Fase 1]* La plataforma web debe ser funcional con latencias de hasta 5 segundos en conexiones 3G", pero no menciona manejo de intermitencia real (caídas de señal, no solo lentitud). NFR-5 reserva el modo offline completo para Fase 2. La tolerancia a intermitencia en Fase 1 queda reducida a latencia, no a robustez ante desconexiones cortas. *Acción:* Añadir en NFR-4 o en un NFR adicional: "La plataforma web debe recuperarse sin pérdida de datos ante desconexiones de hasta 30 segundos durante el flujo de registro."

- **[bajo]** Cero fallas recurrentes como KPI de proceso — El intake lista *"cero fallas recurrentes"* como KPI de procesos independiente. El PRD lo convierte en: "Fallas técnicas recurrentes por finca / mes → 0", que es equivalente en contenido pero lo ubica solo en Fase 2. Si la plataforma software (Fase 1) tiene fallas recurrentes, este KPI también es aplicable. *Acción:* Incluir este KPI en la tabla de Fase 1 referido a disponibilidad y estabilidad del software.

---

## Items sin gaps

Los siguientes elementos del intake están bien representados en el PRD:

- Segmento objetivo (50–200 vacas, región Andina, cooperativas, perfil empírico)
- Propuesta de valor diferencial y comparación vs. competidores (DeLaval, Software Ganadero SG, Merck Animal Health)
- North Star Metric (litros de leche registrados automáticamente por vaca al mes) con proxy para Fase 1
- Principio de diseño UX (curva de aprendizaje < 2 horas, interfaz para operario rural)
- Precios de suscripción mensual (Básico $150K, Estándar $280K, Avanzado $420K)
- Restricción de conectividad rural (28,8% con internet estable)
- Ley 1581 de datos personales y Resolución ICA 017 de 2012
- Modularidad hardware/software
- Revenue sharing con cooperativas (señalado como canal Fase 3 con supuesto pendiente)
- Contexto de mercado (USD 4.9B → 9.7B, Colombia 4° LATAM, Antioquia 20.3%, Colanta 3.622 productores, 31% adopción tecnológica)
- KPIs: CAC < 2 mensualidades, retención ≥ 80%, NPS positivo, instalación < 4 horas, capacitación < 2 horas
- Trazabilidad y alertas en tiempo real como funcionalidades centrales
