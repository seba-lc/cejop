# Post-mortem E1 — Datos cuantitativos

**Generado:** 2026-04-19
**Base de datos:** `cejop_production` (MongoDB Atlas)
**Colecciones relevantes:** `encuestas`, `feedback_encuentro_1`, `asistentes_encuentro_1`, `confirmaciones_encuentro_1`, `pendientes_acreditacion_1`

---

## Notas sobre estructura de campos

- **Colección `encuestas`** (formulario de inscripción pre-evento): campos reales son `personal.edad`, `personal.nombre`, `personal.mail`, `dirigentes.tucGustar`, `dirigentes.argGustar`, `dirigentes.tucDisgustar`, `dirigentes.argDisgustar`, `prioridades` (array), `otraPreocupacion`. **No existe campo `origenPolitico` en esta colección** — ningún documento lo tiene.
- **Colección `feedback_encuentro_1`**: campos reales son `nps`, `teLlevas`, `mejorarias`, `proximoTemas` (array), `proximoOtro`, `recomendaria`, `origenPolitico`, `mail`, `encuentro`, `createdAt`.
- Los dirigentes se dividieron en cuatro subcampos: `tucGustar` (Tucumán, valorado), `argGustar` (Argentina, valorado), `tucDisgustar` (Tucumán, cuestionado), `argDisgustar` (Argentina, cuestionado). No existe un único campo `dirigentesValora`.
- Los nombres de dirigentes son texto libre, sin normalización — se presentan en minúsculas tal como fueron ingresados. Variantes de un mismo nombre (ej. "milei" / "javier milei") se listan por separado.

---

## 1. Colección `encuestas` — Formulario de inscripción pre-evento

### 1.1 Total de registros

| Métrica | Valor |
|---|---|
| Total inscriptos (formulario pre-evento) | **104** |

### 1.2 Distribución por edad

| Rango | Cantidad | % |
|---|---|---|
| 18–22 | 42 | 40.4% |
| 23–26 | 32 | 30.8% |
| 27–30 | 21 | 20.2% |
| 30+ | 9 | 8.7% |
| Sin dato | 0 | — |

Observación: el 71.2% de los inscriptos tiene hasta 26 años.

### 1.3 Origen político / partido

El campo `origenPolitico` no existe en la colección `encuestas`. Ninguno de los 104 documentos lo tiene — ni en `personal` ni a nivel raíz.

### 1.4 Top 10 — Dirigentes tucumanos valorados (`dirigentes.tucGustar`)

| # | Nombre (texto libre) | Menciones |
|---|---|---|
| 1 | rossana chahla | 13 |
| 2 | ninguno | 8 |
| 3 | enzo ferreira | 6 |
| 4 | federico pelli | 6 |
| 5 | paula omodeo | 4 |
| 6 | lisandro catalán | 4 |
| 7 | osvaldo jaldo | 4 |
| 8 | soledad molinuevo | 3 |
| 9 | pablo macchiarola | 3 |
| 10 | gerardo huesen | 2 |

### 1.5 Top 10 — Dirigentes nacionales valorados (`dirigentes.argGustar`)

| # | Nombre (texto libre) | Menciones |
|---|---|---|
| 1 | javier milei | 24 |
| 2 | ninguno | 3 |
| 3 | axel kicillof | 3 |
| 4 | victoria villarruel | 3 |
| 5 | miriam bregman | 3 |
| 6 | martín menem | 2 |
| 7 | federico sturzenegger | 2 |
| 8 | ofelia fernández | 2 |
| 9 | milei *(variante)* | 2 |
| 10 | kirchner *(sin nombre)* | 2 |

Observación: "javier milei" y "milei" son entradas separadas por texto libre; juntos suman al menos 26 menciones.

### 1.6 Top 10 — Dirigentes tucumanos cuestionados (`dirigentes.tucDisgustar`)

| # | Nombre (texto libre) | Menciones |
|---|---|---|
| 1 | osvaldo jaldo | 16 |
| 2 | dario monteros | 9 |
| 3 | rossana chahla | 6 |
| 4 | ricardo bussi | 4 |
| 5 | darío monteros *(variante)* | 4 |
| 6 | jaldo *(variante)* | 4 |
| 7 | gonzalo monteros | 3 |
| 8 | german alfaro | 3 |
| 9 | carlos cisneros | 2 |
| 10 | mariano campero | 2 |

Observación: "osvaldo jaldo" + "jaldo" suman al menos 20 menciones como cuestionado. "dario monteros" + "darío monteros" suman al menos 13 menciones.

### 1.7 Top 10 — Dirigentes nacionales cuestionados (`dirigentes.argDisgustar`)

| # | Nombre (texto libre) | Menciones |
|---|---|---|
| 1 | javier milei | 16 |
| 2 | axel kicillof | 12 |
| 3 | cristina kirchner | 7 |
| 4 | cristina fernández de kirchner *(variante)* | 6 |
| 5 | milei *(variante)* | 5 |
| 6 | — *(sin nombre)* | 3 |
| 7 | sergio massa | 2 |
| 8 | máximo kirchner | 2 |
| 9 | kicillof *(variante)* | 2 |
| 10 | nicolas del caño | 2 |

Observación: Milei aparece simultáneamente como el más valorado (24+ menciones) y el más cuestionado (21+ menciones) a nivel nacional. Idem con Kicillof, aunque con menor distancia relativa.

### 1.8 Ranking de prioridades / preocupaciones (`prioridades`)

El campo es un array. Cada inscripto seleccionó hasta 3 opciones de un listado de 16.

| # | Prioridad | Menciones | % sobre 104 inscriptos |
|---|---|---|---|
| 1 | educacion | 59 | 56.7% |
| 2 | economia | 43 | 41.3% |
| 3 | seguridad | 39 | 37.5% |
| 4 | infraestructura | 38 | 36.5% |
| 5 | salud | 30 | 28.8% |
| 6 | corrupcion | 26 | 25.0% |
| 7 | vulnerabilidad | 18 | 17.3% |
| 8 | empleo | 14 | 13.5% |
| 9 | participacion | 9 | 8.7% |
| 10 | justicia | 8 | 7.7% |
| 11 | inclusion | 8 | 7.7% |
| 12 | vivienda | 7 | 6.7% |
| 13 | medioambiente | 4 | 3.8% |
| 14 | cultura | 4 | 3.8% |
| 15 | ddhh | 3 | 2.9% |
| 16 | tecnologia | 2 | 1.9% |

Observación: se detectaron exactamente 16 valores distintos, coincidiendo con el número esperado de opciones.

---

## 2. Colección `feedback_encuentro_1` — Formulario post-evento primer encuentro

### 2.1 Total de respuestas

| Métrica | Valor |
|---|---|
| Total respuestas feedback | **14** |
| Total asistentes (colección `asistentes_encuentro_1`) | 72 |
| Total confirmaciones (colección `confirmaciones_encuentro_1`) | 49 |
| Total inscriptos encuesta pre-evento | 104 |

### 2.2 NPS promedio

| Métrica | Valor |
|---|---|
| NPS promedio (escala 1–10) | **8.43** |

### 2.3 Distribución NPS (histograma)

| Score | Respuestas |
|---|---|
| 1 | 0 |
| 2 | 0 |
| 3 | 0 |
| 4 | 1 |
| 5 | 0 |
| 6 | 1 |
| 7 | 1 |
| 8 | 3 |
| 9 | 3 |
| 10 | 5 |

Observación: 11 de 14 respuestas (78.6%) son 8, 9 o 10.

### 2.4 Ranking de temas para próximo encuentro (`proximoTemas`)

| # | Tema | Menciones | % sobre 14 respuestas |
|---|---|---|---|
| 1 | interior | 7 | 50.0% |
| 2 | legislativo | 7 | 50.0% |
| 3 | urbanizacion | 6 | 42.9% |
| 4 | economia | 4 | 28.6% |
| 5 | juventudes | 4 | 28.6% |
| 6 | empresas | 3 | 21.4% |
| 7 | judicial | 3 | 21.4% |
| 8 | medios | 2 | 14.3% |

Observación: se detectaron 8 valores distintos en `proximoTemas`.

### 2.5 Temas adicionales propuestos en `proximoOtro`

2 personas llenaron el campo `proximoOtro` (texto libre):

1. "Crisis de la democracia y de la representación política"
2. "Salud, discapacidad"

### 2.6 Breakdown de `recomendaria`

| Opción | Cantidad | % |
|---|---|---|
| si | 14 | 100.0% |
| talvez | 0 | — |
| no | 0 | — |

Observación: el 100% de quienes respondieron el feedback indicó que recomendaría el evento.

### 2.7 Breakdown por `origenPolitico` en feedback

| Origen político (texto libre) | Respuestas | NPS promedio |
|---|---|---|
| LLA (variantes: LLa, LLA, La libertad avanza, La Libertad avanza, La Libertad Avanza, Juventud LLA) | 6 | 8.80 |
| Individual | 2 | 8.50 |
| Ateneo SRT | 2 | 7.00 |
| Federalismo y Libertad | 1 | 9.00 |
| La Bachofen (FaCET-UNT) | 1 | 10.00 |
| U. C. R | 1 | 4.00 |
| Sin dato | 1 | 10.00 |

Observación: el campo `origenPolitico` tiene alta variabilidad de escritura (al menos 6 variantes para LLA). El único respondente identificado como UCR registró el NPS más bajo (4).

---

## 3. Cruces

### 3.1 Tasa de respuesta feedback / inscriptos encuesta

| Métrica | Valor |
|---|---|
| feedback_e1 / encuesta pre-evento | 14 / 104 = **13.5%** |
| feedback_e1 / asistentes_encuentro_1 | 14 / 72 = **19.4%** |
| feedback_e1 / confirmaciones_encuentro_1 | 14 / 49 = **28.6%** |

### 3.2 NPS promedio segmentado por `origenPolitico` (feedback)

Ver tabla en sección 2.7. Muestra pequeña (n=14): los promedios por segmento son referenciales, no estadísticamente robustos.

### 3.3 Temas más pedidos en feedback (`proximoTemas`) vs prioridades declaradas en encuesta (`prioridades`)

| Tema pedido en feedback | Menciones en feedback | Posición en ranking prioridades encuesta | Menciones en encuesta |
|---|---|---|---|
| interior | 7 | No figura en prioridades | — |
| legislativo | 7 | No figura en prioridades | — |
| urbanizacion | 6 | No figura en prioridades | — |
| economia | 4 | **#2** | 43 |
| juventudes | 4 | No figura en prioridades | — |
| empresas | 3 | No figura en prioridades | — |
| judicial | 3 | No figura (justicia: #10 con 8) | 8 |
| medios | 2 | No figura en prioridades | — |

Observación: los temas del formulario `proximoTemas` (lista de temas de panel) y los del formulario `prioridades` (lista de preocupaciones ciudadanas) usan taxonomías distintas y no se solapan directamente, salvo `economia` que aparece en ambas. El cruce es indicativo, no directo.

---

## 4. Otras colecciones en `cejop_production`

| Colección | Documentos | Descripción observada |
|---|---|---|
| `asistentes_encuentro_1` | 72 | Registro de quienes efectivamente asistieron al E1 (campo `tipo`: "confirmado", `inscripto`: true) |
| `confirmaciones_encuentro_1` | 49 | Confirmaciones de asistencia (campo `confirmado`: true) |
| `pendientes_acreditacion_1` | 29 | Personas que se acreditaron en puerta sin inscripción previa (campo `estado`: "approved", `inscripto`: false) |
| `email_sends` | 63 | Log de envíos transaccionales (campañas: gracias-inscripcion, gracias-feedback, etc.) |
| `settings` | 1 | Configuración de la app (ej. `encuestas_habilitadas`: false) |
