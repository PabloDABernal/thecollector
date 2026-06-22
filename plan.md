# PLAN.md — Hoja de ruta de "The Collector"

> Construimos por fases. El orden importa: **primero el motor, después los
> gráficos.** Principio de diseño: simulaciones antes que documentos.

---

## Estado actual (22-jun-2026)

**Fase 1 en curso — motor de reglas.** 271 tests pasan. Specs 01-10 (+10a, 10b) implementadas.

Lo que funciona:
- Estructura de turno completa (acciones, cooldowns, inicio).
- Pool de Núcleos + dados virtuales con semilla.
- Todos los efectos atómicos (incluido `cancelar`/Contratiempo).
- IA del Enemigo: fase activa, elección de habilidad y Núcleo, orquestación de 6 pasos.
- Registro invertible `EfectoAplicado` + `resolverDañoEntrante` con política de redirección y keyword Berserker.
- IA del Líder tanda 1: `decidirEleccionInicio`, `politicaRedireccionLider`, tipo `Accion`, stub `decidirAccionesTurno`.

---

## Próximos pasos (orden)

### 1. Decisión: modelo de la mano (`BattleState.mano`)
`mano` es ahora un contador `number`. Para que la IA pueda evaluar cartas (coste de Energía, efectos) hay que convertirlo en `Carta[]`.

- Impacta: `BattleState`, `createBattleState`, `cancelar` (descarte), `decidirEleccionInicio` paso 2, validador.
- Refactor de capas pequeño pero transversal. Hacerlo **antes** de la tanda 2 para no bloquearla.
- Spec 11 debería cubrir este refactor + los ajustes en tests existentes.

### 2. Spec 11 — IA del Líder tanda 2 (heurística completa)
Prioridad por turno: letal → Defensor → Trama → daño. Requiere mano como lista (paso 1).
También: Combo, y elección Energía vs Canalizar delegada a `decidirEleccionInicio`.

### 3. Validador (spec 12)
Corre N batallas Forjador vs Verdugo en Bastión con semillas distintas.
Agrega métricas del Devkit §5: tasa de victoria, turnos medios, Trama máxima alcanzada.
Usa `ejecutarTurnoEnemigo` + IA del Líder tanda 2 para cerrar el bucle automático.

### 4. Pasiva del Bastión (paso 1 del turno enemigo)
+1 escudo al Verdugo por cada esbirro en mesa al inicio de su turno.
Pendiente hasta tener la spec del escenario. Bajo impacto hasta que el validador esté activo.

### 5. Keyword Defensor en esbirros (paso 5)
Los esbirros con `Defensor` atacan con prioridad en el paso 5.
Actualmente la selección es aleatoria entre todos los candidatos.

---

## Deudas conscientes

| Deuda | Dónde | Impacto | Cuándo resolver |
|-------|-------|---------|-----------------|
| `descarte-jugador` en `EfectoAplicado` usa `cantidad: number` (nº de cartas) en vez de `cartaId: string` | `turno/types.ts`, `ejecutor.ts` | Contratiempo no puede restaurar cartas específicas; solo el conteo | Al convertir `mano` a lista |
| Aliado que cae a 0 HP no se elimina automáticamente de `aliados[]` | `turno/types.ts`, `engine` | Sin efecto mientras no haya lógica de muerte de Aliado | Fase 2+ |
| Escudo del Bastión (+1 por esbirro) no está tapeado a `ESCUDO_MAX` (5) por diseño, pero la pasiva podría saturarlo | `turno/enemigo.ts` paso 1 | Solo relevante cuando la pasiva se implemente | Al implementar pasiva del Bastión |

---

## Fases futuras (sin cambios)

**Fase 2** — Interfaz: tablero, mano, pool, Trama, cartas con estética de coleccionista. UI conectada al engine. Batalla jugable con ratón.

**Fase 3** — Validador extendido + Devkit: editor de contenido, calculadora de presupuesto en vivo, 1000 batallas por carta nueva.

**Fase 4** — Móvil: layout táctil, Capacitor (iOS/Android).
