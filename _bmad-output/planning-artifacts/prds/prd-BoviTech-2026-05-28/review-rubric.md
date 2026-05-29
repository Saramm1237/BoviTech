# Revisión de Calidad del PRD — BoviTech

## Veredicto general

El PRD muestra una base sólida para un proyecto académico con intención de lanzamiento real: el problema está bien enunciado, el modelo de negocio tiene lógica interna y las métricas de éxito son notablemente más maduras que lo esperado en esta etapa. El riesgo principal es que varios requisitos funcionales carecen de criterios de aceptación verificables (el equipo de desarrollo no puede saber cuándo terminó), y la estructura del PRD está escrita para un producto de un solo usuario cuando el producto tiene tres actores distintos (ganadero, operario, cooperativa) cuyos flujos no están trazados. Si se construye sobre este PRD sin corregir esas dos debilidades, se corre el riesgo de entregar features que tecnicamente "pasan" pero no cubren las necesidades reales de cada actor.

---

## 1. Decisión-preparación — **adecuada**

El PRD toma decisiones reales y las justifica. La elección del modelo SaaS de suscripción frente al pago único está razonada explícitamente (§7): *"se descartó el modelo de pago único por no ser sostenible"*. La segmentación de 50–200 vacas está justificada con el contexto de mercado (§2 y §10). El roadmap de tres fases es una decisión de alcance, no un comité de posibilidades. Esto es más que la mayoría de PRDs de esta etapa.

Lo que falta: los trade-offs en las decisiones de UX y tecnología son invisibles. La elección de "plataforma web" frente a "PWA" o "app nativa" no aparece como decisión explícita con lo que se sacrificó (la Fase 2 menciona "PWA o nativa" como si fuera una sola cosa). El PRD afirma en §3 que el sistema debe funcionar *offline-first*, pero NFR-4 dice en Fase 1 *"debe ser funcional con latencias de hasta 5 segundos en 3G"* — son requisitos contradictorios que no se han nombrado como tensión activa. Nadie en el equipo puede tomar una decisión de arquitectura sobre esta ambigüedad.

### Hallazgos

- **alto** Contradicción offline no resuelta (§3 vs. §6 NFR-4/NFR-5) — La propuesta de valor afirma "offline-first" pero NFR-4 requiere conexión en Fase 1 y NFR-5 pospone el offline a Fase 2. Esto no está nombrado como tensión ni decisión. *Fix:* Agregar nota explícita: "En Fase 1, BoviTech requiere conexión a internet (tolerante a 3G). El modo offline es una característica de Fase 2. Esta decisión implica que fincas sin ninguna conectividad no son el mercado objetivo de Fase 1."
- **alto** Decisión de stack tecnológico ausente (§4, §11) — El PRD menciona "plataforma web" sin decidir si es SPA, MPA, PWA. En §4 Fase 2 aparece "PWA o nativa" sin elegir. Esta es una decisión de arquitectura que el PRD debería al menos acotar. *Fix:* Agregar [SUPUESTO] con la opción elegida para Fase 1 y la OQ correspondiente.
- **medio** La estrategia de early adopters (§7) no menciona cómo se convierte un piloto gratuito en cliente pagante. El precio de $180.000/mes los primeros 3 meses no tiene un mecanismo de conversión explícito. *Fix:* Agregar el criterio de conversión o marcarlo como [SUPUESTO] con OQ.

---

## 2. Sustancia sobre teatro — **adecuada**

**Lo que funciona:** El PRD evita el teatro de visión al grado que su enunciado de visión (§1) menciona *"volumen de leche por animal y consumo de alimento"* — es específico del dominio, no genérico. La sección competitiva (§9) es honesta: nombra competidores reales, precios reales (Progan ~$490.000 COP/año) y gaps concretos. Las contra-métricas en §8 son genuinas — *"% de operarios que abandonan el registro antes del primer mes"* es una señal de producto real, no decoración.

**Lo que falla:** Las NFRs de seguridad rozam el teatro. NFR-7 cita la Ley 1581 de 2012 y NFR-8 especifica TLS 1.2+ y cifrado en reposo, pero no hay un umbral de seguridad que sea específico del riesgo del producto. ¿Qué pasa si una cooperativa quiere acceder a los datos de un ganadero sin su consentimiento? ¿Hay segregación de datos por finca? Esas preguntas de seguridad del dominio no aparecen. La propuesta de valor en §3 afirma que BoviTech es *"la única solución en Colombia que combina"* los cinco atributos — esa afirmación aparece dos veces (§3 y §9) pero no hay fuente ni fecha de la investigación competitiva. Para un producto con intención de lanzamiento, es una afirmación que puede ser impugnada.

### Hallazgos

- **medio** Teatro de NFR de seguridad (§6 NFR-7/NFR-8) — Las NFRs citan normas y tecnologías pero no plantean el escenario de riesgo específico del dominio: un asesor veterinario de cooperativa que accede a datos de múltiples fincas sin consentimiento. *Fix:* Agregar NFR sobre segregación de datos por finca y restricciones de acceso cross-finca.
- **bajo** Afirmación de unicidad sin fuente (§3, §9) — "Ningún competidor existente en Colombia combina estos cinco atributos" es una afirmación de mercado de alto impacto sin fecha ni metodología de investigación. *Fix:* Agregar una nota de pie con fecha de la investigación o marcarlo como [SUPUESTO — investigación competitiva de mayo 2026, sujeta a revisión].

---

## 3. Coherencia estratégica — **fuerte**

El PRD tiene una tesis clara y sostenida: el ganadero mediano colombiano pierde dinero por falta de visibilidad individual de su hato, y BoviTech la entrega con una UX que un operario sin experiencia técnica puede usar. Esa tesis se traza con coherencia a lo largo del documento:

- El segmento (50–200 vacas, §2) sigue de la tesis.
- Las features de Fase 1 (registro manual, dashboard individual, alertas por caída, §5) sirven directamente a la tesis.
- La North Star Metric (§8) — litros registrados por vaca al mes — valida la tesis, no solo mide actividad.
- El proxy de Fase 1 (% de ordeños programados registrados) es coherente con la limitación de no tener hardware.
- La ruta de tres fases tiene lógica de riesgo decreciente: validar UX antes de fabricar hardware.

El único punto de tensión estratégica es el canal. El PRD apuesta por cooperativas como distribuidor de largo plazo (§7, §10) pero las cooperativas aparecen solo en Fase 3. Si el canal es estratégico, ¿por qué no se trabaja la relación con cooperativas durante la Fase 1 piloto? Esa brecha no está nombrada.

### Hallazgos

- **medio** Brecha en la estrategia de canal (§7 vs. §4) — Las cooperativas son el canal de escala pero no aparecen en el plan de Fase 1. Si las cooperativas son el canal principal, el equipo debería estar construyendo esa relación durante los pilotos de Fase 1. *Fix:* Agregar en §4 Fase 1 una acción explícita de acercamiento a cooperativas (aunque el revenue sharing sea Fase 3).
- **bajo** La meta de "3–5 fincas piloto a 90 días" (§8) es correcta para un MVP académico, pero el PRD no menciona cómo se consiguen esas fincas ni quién es el responsable. *Fix:* Agregar una nota de go-to-market para Fase 1 (aunque sea breve).

---

## 4. Claridad de definición de "terminado" — **delgada**

Este es el punto más débil del PRD. La mayoría de los requisitos funcionales están redactados como capacidades del sistema, no como comportamientos verificables. Un desarrollador puede implementar cualquier cosa que "calcule producción" o "muestre alertas" y técnicamente cumplir el requisito. Ejemplos concretos:

- **FR-2.2**: *"El sistema calcula producción diaria, semanal y mensual por animal y por hato"* — ¿cómo se calcula el diario si hay dos sesiones (mañana/tarde)? ¿Es la suma? ¿Puede haber una sesión sin la otra? No hay criterio de aceptación.
- **FR-2.3**: *"historial de producción por animal con gráfica de tendencia"* — ¿cuántos datos históricos debe mostrar? ¿Qué período? ¿La gráfica es una línea de tiempo? ¿Cómo se define "tendencia"?
- **FR-3.2**: *"El sistema calcula la relación producción / consumo por animal (eficiencia alimenticia)"* — ¿cuál es la fórmula? ¿Litros / kg de alimento? ¿Qué pasa si no hay registro de alimentación ese día?
- **FR-5.2**: *"ranking de vacas por producción diaria"* — ¿cómo se rompen los empates? ¿Qué pasa si una vaca no tiene registro ese día? ¿Aparece al final, en gris, o no aparece?
- **FR-4.1**: Esta es la excepción positiva — umbral configurable, valor por defecto 20%, promedio de 7 días. Es el único FR con semántica completa.

Las NFRs de usabilidad son más fuertes: NFR-1 ("2 horas de capacitación"), NFR-2 ("3 pasos"), NFR-6 ("99% en horarios de ordeño") son testables. NFR-9 ("3 segundos en 4G") también.

### Hallazgos

- **crítico** FR-2.2 sin semántica de cálculo (§5 F2) — "Calcula producción diaria" no define cómo agregar las dos sesiones de ordeño. Si hay datos de mañana pero no de tarde, ¿qué reporta el sistema? *Fix:* Agregar: "La producción diaria es la suma de todas las sesiones registradas ese día. Si solo se registra una sesión, la producción diaria refleja esa sesión y el sistema marca el día como incompleto."
- **crítico** FR-3.2 sin fórmula (§5 F3) — "Eficiencia alimenticia" no define la fórmula ni el comportamiento cuando faltan datos de alimentación. *Fix:* Definir: "Eficiencia = litros de leche / kg de alimento suministrado en el mismo período de 24h. Si no hay registro de alimentación, el campo muestra 'Sin dato' y no se calcula el indicador."
- **alto** FR-2.3 sin horizonte temporal (§5 F2) — "Historial con gráfica de tendencia" no define cuántos días, qué tipo de gráfica ni qué algoritmo define "tendencia". *Fix:* Especificar: "La gráfica muestra los últimos 30 días de producción diaria por animal. La tendencia se indica con una línea de regresión de 7 días."
- **alto** FR-5.2 sin comportamiento para datos faltantes (§5 F5) — El ranking de vacas no define qué hace el sistema con animales sin registro ese día. *Fix:* Agregar: "Los animales sin registro del día aparecen al final del ranking marcados como 'Sin registro' y no se incluyen en el cálculo del promedio del hato ese día."
- **alto** FR-6.2 sin formato especificado (§5 F6) — "Exportable en el formato requerido por el ICA" no define el formato real (¿CSV?, ¿XML?, ¿planilla Excel con columnas específicas?). *Fix:* Agregar el formato específico exigido por la Resolución ICA 017 de 2012, o marcarlo como [SUPUESTO — pendiente revisión del formato ICA] con OQ.

---

## 5. Honestidad de alcance — **adecuada**

El PRD usa etiquetas `[SUPUESTO]` en las dos instancias de mayor riesgo: la estructura de precios (§7) y el porcentaje de revenue sharing con cooperativas (§7). Eso es correcto. Las Preguntas Abiertas (§12) son reales y tienen impacto declarado — OQ-1 a OQ-4 son decisiones bloqueadoras genuinas, no preguntas decorativas.

Lo que falta: la densidad de supuestos es insuficiente para una intención de lanzamiento. Hay inferencias significativas que están escritas como hechos sin etiqueta:

- §2: *"50–200 vacas de ordeño"* como tamaño de segmento. ¿De dónde viene ese rango? ¿Es una validación con ganaderos o una estimación del equipo?
- §3: La afirmación de "curva de aprendizaje < 2 horas" es a la vez una propuesta de valor *y* un NFR — pero en §3 suena como un hecho validado, cuando en §6 NFR-1 es un requisito a cumplir.
- §10: "31% de crecimiento en herramientas tecnológicas en el sector agropecuario colombiano" — sin fuente.
- §5 F6: La compatibilidad con la Resolución ICA 017 de 2012 se afirma como requisito (FR-5.4, FR-6.2) pero no hay una OQ sobre si el equipo ya revisó el formato exacto.

La sección de No-Objetivos está implícita en el listado "Fuera de alcance en Fase 1" de §4, pero no está formalizada como sección propia. En un PRD con intención de lanzamiento, una sección formal de No-Objetivos reduce el scope creep con stakeholders.

### Hallazgos

- **alto** Segmento sin fuente (§2) — El rango "50–200 vacas" es la decisión de segmentación más importante del PRD. Aparece como hecho sin etiqueta de supuesto ni fuente. *Fix:* Agregar [SUPUESTO — rango estimado basado en conocimiento del equipo; pendiente validación con ganaderos en OQ-1].
- **alto** Dato estadístico sin fuente (§10) — "31% de crecimiento en herramientas tecnológicas" no tiene fuente citada. En un proyecto con intención de lanzamiento, los datos de mercado sin fuente son una vulnerabilidad ante inversionistas o jurados. *Fix:* Citar la fuente (DANE, Fedegan, MinTIC) o eliminar el dato.
- **medio** Ausencia de sección formal de No-Objetivos — El "fuera de alcance" de §4 es funcional pero no equivale a una sección de Non-Goals. *Fix:* Agregar §13 "No-Objetivos del PRD" con lista explícita: hardware IoT en Fase 1, app móvil nativa en Fase 1, integración con cooperativas en Fase 1, soporte multi-idioma, gestión financiera / contabilidad de la finca.
- **medio** Formato ICA sin validar (§5 FR-5.4, FR-6.2) — El PRD exige compatibilidad con Resolución ICA 017 de 2012 pero no hay OQ ni supuesto sobre si el equipo revisó el formato exacto. *Fix:* Agregar OQ-6: "¿Cuál es el formato técnico exacto (columnas, campos obligatorios) exigido por el ICA para reportes de trazabilidad bovina? ¿Existe una plantilla oficial?"

---

## 6. Usabilidad para equipos posteriores — **delgada**

El PRD tiene IDs de FR contiguos (FR-1.1 a FR-7.3) y NFRs numerados (NFR-1 a NFR-11), lo que facilita referencias cruzadas. El glosario implícito es consistente: "hato", "ordeño", "operario", "propietario/administrador" se usan de forma uniforme.

Sin embargo, hay problemas estructurales que dificultarían la extracción por equipos de UX y arquitectura:

**Para UX:** No hay flujos de usuario por actor. El producto tiene tres actores con comportamientos radicalmente distintos — el operario que registra un ordeño en 3 pasos (NFR-2), el propietario que revisa el dashboard, y potencialmente el asesor veterinario de cooperativa. Un diseñador de UX tendría que inferir los flujos desde los FRs individuales, con alto riesgo de interpretación incorrecta.

**Para arquitectura:** La sección §11 "Restricciones Técnicas" lista consideraciones pero no hay decisiones de arquitectura. La referencia a "cola de mensajes persistente" en Fase 2 (§4) sugiere una arquitectura event-driven, pero Fase 1 no tiene ningún constraint técnico declarado. Un arquitecto no puede derivar decisiones de stack desde este PRD.

**Para stories:** Los FRs están agrupados por feature (F1–F7) lo cual facilita la extracción de épicas, pero la falta de criterios de aceptación (ver §4 de esta revisión) significa que cada historia requeriría una sesión adicional de refinamiento antes de ser estimable.

### Hallazgos

- **alto** Ausencia de flujos de usuario por actor (global) — No hay un User Journey ni siquiera esquemático para el operario (el usuario más frecuente, según §2) ni para el propietario. Un equipo de UX no puede producir wireframes desde este PRD sin una sesión adicional de discovery. *Fix:* Agregar §13 (o §14 si se agrega Non-Goals) con flujos narrativos mínimos: "Flujo del operario en sesión de ordeño" y "Flujo del propietario revisando alertas".
- **medio** Ausencia de glosario formal (global) — Los términos del dominio son consistentes en el cuerpo del PRD, pero no hay glosario. Para un equipo de ingeniería sin contexto ganadero, términos como "hato", "arete", "ciclo de ordeño", "parto" necesitan definición técnica. *Fix:* Agregar un §0 Glosario con los 8–10 términos de dominio más críticos y su definición operativa en el sistema.
- **bajo** FR-7.2 y FR-7.3 definen permisos por exclusión, no por capacidad (§5 F7) — "El operario no accede a reportes financieros ni configuración" define lo que no puede hacer, no lo que sí puede. En una matriz de permisos real esto genera ambigüedad. *Fix:* Reescribir como matriz de permisos explícita: qué puede hacer cada rol, listado positivamente.

---

## 7. Forma adecuada al tipo de producto — **delgada**

El PRD está formateado como un producto de un solo actor cuando tiene tres actores con tensiones reales entre sí:

1. **Operario:** necesita simplicidad extrema, flujo de 3 pasos, sin errores que lo bloqueen.
2. **Propietario/ganadero:** necesita visibilidad de negocio, alertas accionables, reportes para cooperativas.
3. **Cooperativa (Fase 3):** necesita acceso agregado multi-finca, datos que el ganadero puede no querer compartir.

El PRD reconoce estos actores en §2 ("Usuario operativo") y en §4 (Fase 3), pero los requisitos funcionales están redactados en tercera persona del sistema (*"El sistema calcula..."*, *"El sistema genera alerta..."*) sin anclarlos al actor que los experimenta. Esto produce FRs que suenan completos pero no responden a la pregunta de un diseñador de producto: *¿desde la perspectiva de quién es esto un requisito?*

Para un B2B multi-stakeholder de esta complejidad, lo mínimo esperado son:
- User journeys narrativos con protagonistas nombrados (ausentes)
- Tabla de roles con capacidades declaradas positivamente (parcial — FR-7 lo intenta pero no es suficiente)
- Criterios de éxito diferenciados por actor (ausentes — todos los KPIs en §8 son del sistema, no del usuario)

La sobre-formalización no es el problema. El PRD tiene un tamaño y estructura apropiados para su etapa. El problema es la perspectiva: está escrito desde el sistema hacia afuera, cuando para este tipo de producto debería estar escrito desde el actor hacia adentro.

### Hallazgos

- **crítico** KPIs sin actor propietario (§8) — "NPS del propietario / ganadero ≥ 30" es el único KPI del usuario. No hay ningún KPI del operario (¿tasa de error en el registro? ¿tiempo promedio por sesión de ordeño?). El operario es el usuario más frecuente. *Fix:* Agregar KPI de operario en Fase 1: "Tiempo promedio de registro de un ordeño completo (hato) ≤ X minutos" y "Tasa de sesiones de registro con error o abandono ≤ Y%".
- **alto** FRs sin actor nombrado (§5, global) — Todos los FRs son del sistema. "El sistema calcula..." no dice quién consume ese cálculo ni en qué contexto. *Fix:* Prefixar cada FR con el actor que lo experimenta: "El operario registra [FR-2.1]", "El propietario ve en su dashboard [FR-5.1]".
- **medio** La Propuesta de Valor (§3) está escrita para el ganadero (propietario), no para el operario — pero el operario es quien determina si el sistema se usa o no. Si el operario rechaza la herramienta, el ganadero nunca recibe el valor. *Fix:* Agregar una propuesta de valor explícita para el operario: "Para el operario, BoviTech es la única herramienta de registro que puede usar sin necesitar capacitación previa más allá de 2 horas."

---

## Notas mecánicas

- **IDs de FR:** Contiguos y bien formados (FR-1.1 a FR-7.3). No hay saltos. Correcto.
- **IDs de NFR:** Contiguos (NFR-1 a NFR-11). Correcto.
- **Etiquetas [FASE N]:** Usadas correctamente en FR-2.4, FR-4.4, NFR-5. Consistentes.
- **Etiquetas [SUPUESTO]:** Solo 2 instancias en §7. Insuficiente para la densidad de supuestos real del documento (ver §5 de esta revisión).
- **Etiquetas [NOTE FOR PM]:** Ausentes. Para un proyecto académico con múltiples autores, estas etiquetas ayudan a distinguir decisiones pendientes de decisiones tomadas.
- **Glosario:** Ausente. Los términos del dominio ganadero se usan consistentemente pero sin definición formal.
- **Sección Non-Goals:** Ausente como sección formal. Parcialmente cubierta en §4.
- **Referencias cruzadas:** Las pocas que existen (NFR-6 menciona horarios de ordeño, consistent con §2) son correctas. No hay referencias cruzadas entre FRs, lo que es adecuado para este nivel de detalle.
- **Dato sin fuente en §10:** "31% de crecimiento en herramientas tecnológicas en el sector agropecuario colombiano" — sin citar DANE, Fedegan, MinTIC u otra fuente.
- **Contradicción offline (§3 vs §6 NFR-4/5):** La propuesta de valor afirma offline-first; NFR-4 requiere conexión en Fase 1. Debe nombrarse explícitamente como trade-off de fase, no dejarse como tensión silenciosa.
