# Estructura del Repositorio — The Collector v1

> Índice de orientación para reanudar sesiones. No es documentación exhaustiva.
> Actualizar cuando cambien exports públicos o se implementen nuevas specs.
> Generado: 2026-06-21 · 248 tests pasan · specs 01-09 implementadas.

---

## 1. Árbol de `src/`

```
src/
├── content/                   ← datos del juego (sin lógica)
│   ├── types.ts               ← todos los tipos de contenido (tipos, no valores)
│   ├── index.ts               ← barrel de reexportaciones
│   ├── forjador.ts            ← Líder: El Forjador
│   ├── forjador.test.ts
│   ├── verdugo.ts             ← Enemigo: El Verdugo + fases + habilidades
│   ├── verdugo.test.ts
│   ├── esbirros.ts            ← plantillas de Esbirros (Refuerzo, Defensor)
│   ├── esbirros.test.ts
│   └── dramaturgia.ts         ← mazo base de 30 cartas + 17 definiciones
│
├── engine/                    ← motor de reglas puro (sin React, sin DOM)
│   ├── rng.ts                 ← tipo Rng + createRng(seed) — Mulberry32
│   ├── index.ts               ← barrel del engine
│   │
│   ├── nucleos/
│   │   ├── types.ts           ← NucleoColor, NucleoPool, NucleoCost, DadoVirtualMod
│   │   ├── pool.ts            ← launchPool, poolSize, isPoolEmpty, gastarNucleo
│   │   ├── dado-virtual.ts    ← rollDado(rng, mod?) — 1-4, con modificadores
│   │   ├── index.ts
│   │   └── pool.test.ts
│   │
│   ├── efectos/
│   │   ├── ejecutor.ts        ← aplicarEfecto, ContextoEjecucion
│   │   ├── daño.ts            ← aplicarDañoALider, aplicarDañoAEnemigo
│   │   ├── index.ts
│   │   ├── ejecutor.test.ts
│   │   └── efectos-restantes.test.ts
│   │
│   ├── habilidades/
│   │   ├── activacion.ts      ← activarHabilidad, calentarHabilidades, ResultadoActivacion
│   │   ├── index.ts
│   │   └── activacion.test.ts
│   │
│   ├── dramaturgia/
│   │   ├── mazo.ts            ← barajar, robarCarta, ResultadoRobo
│   │   ├── index.ts
│   │   └── mazo.test.ts
│   │
│   ├── esbirros/
│   │   ├── mesa.ts            ← limpiarEsbirrosMuertos
│   │   └── index.ts
│   │
│   ├── enemigo/
│   │   ├── fases.ts           ← faseActiva(hp, fases)
│   │   ├── ia.ts              ← elegirHabilidad, elegirNucleo, COLORES_JUGADOR_PROTOTIPO
│   │   ├── index.ts
│   │   └── ia.test.ts
│   │
│   └── turno/
│       ├── types.ts           ← BattleState, EsbirroEnMesa, AliAdoEnMesa, TipoAccion, constantes
│       ├── estado.ts          ← createBattleState(overrides?) — estado inicial/tests
│       ├── inicio-turno.ts    ← bajarCooldowns, getEleccionForzada, aplicarEleccionInicio, iniciarTurnoJugador
│       ├── acciones.ts        ← getAccionesDisponibles, ejecutarCanalizar, ejecutarGenerarEnergia, activarCombo
│       ├── enemigo.ts         ← ejecutarTurnoEnemigo(state, rng, config), ConfigTurnoEnemigo
│       ├── index.ts
│       ├── turno.test.ts
│       └── enemigo.test.ts
│
├── validator/
│   └── index.ts               ← stub vacío (pendiente)
│
└── ui/
    ├── App.tsx                ← placeholder (pantalla "Motor en construcción")
    ├── main.tsx               ← punto de entrada React
    └── index.css              ← Tailwind base
```

---

## 2. Inventario de exports públicos por fichero

### `content/`

| Fichero | Exports |
|---------|---------|
| `types.ts` | `EsbirroKeyword`, `EsbirroTemplate`, `FormulaAtaque`, `EfectoAtomico` (unión discriminada), `Keyword`, `CosteHabilidad`, `Habilidad`, `Carta`, `Lider`, `FaseEnemigo`, `Enemigo`, `IconoDramaturgia`, `OrigenDramaturgia`, `CartaDramaturgia` |
| `forjador.ts` | `FORJADOR` — instancia del Líder con sus 4 habilidades (Golpe, Contención, Estocada de Energía, Golpe Potenciado) |
| `verdugo.ts` | `TAJO`, `GRITO_DE_GUERRA`, `EJECUCION`, `PROCLAMA`, `DECAPITACION`, `FASES_VERDUGO`, `VERDUGO` |
| `esbirros.ts` | `ESBIRRO_REFUERZO`, `ESBIRRO_DEFENSOR` — plantillas `EsbirroTemplate` |
| `dramaturgia.ts` | `MAZO_BASE_DRAMATURGIA` (30 cartas `CartaDramaturgia[]`), `DEFINICIONES_DRAMATURGIA` (17 definiciones con campo `copias`) |

### `engine/`

| Fichero | Exports |
|---------|---------|
| `rng.ts` | `Rng` (tipo `() => number`), `createRng(seed: number): Rng` — Mulberry32 con semilla |
| `nucleos/types.ts` | `NucleoColor`, `NUCLEO_COLORS`, `NucleoPool`, `NucleoCost`, `DadoVirtualMod` |
| `nucleos/pool.ts` | `launchPool(rng, mod?)`, `poolSize(pool)`, `isPoolEmpty(pool)`, `gastarNucleo(pool, color)` |
| `nucleos/dado-virtual.ts` | `rollDado(rng, mod?)` — dado 1-4 con modificadores opcionales |
| `efectos/ejecutor.ts` | `ContextoEjecucion`, `aplicarEfecto(state, efecto, ctx)` — interpreta toda la unión `EfectoAtomico` |
| `efectos/daño.ts` | `OpcionesDañoLider`, `aplicarDañoALider(state, cantidad, opciones?)`, `aplicarDañoAEnemigo(state, cantidad)` |
| `habilidades/activacion.ts` | `ResultadoActivacion`, `calentarHabilidades(habilidades)`, `activarHabilidad(state, habilidad, nucleo, fuente)` |
| `dramaturgia/mazo.ts` | `ResultadoRobo`, `barajar(cartas, rng)`, `robarCarta(state, rng)` — con deck-out automático |
| `esbirros/mesa.ts` | `limpiarEsbirrosMuertos(state)` |
| `enemigo/fases.ts` | `faseActiva(hpActual, fases)` — fase activa derivada del HP, sin estado guardado |
| `enemigo/ia.ts` | `COLORES_JUGADOR_PROTOTIPO`, `elegirHabilidad(icono, cooldowns, pool, habilidades)`, `elegirNucleo(coste, pool, coloresJugador?)` |
| `turno/types.ts` | `BattleState`, `EsbirroEnMesa`, `AliAdoEnMesa`, `TipoAccion`, `EleccionInicio` + constantes (`ENERGIA_MAX`, `MANO_MAX`, `ACCIONES_POR_TURNO`, `ESCUDO_MAX`) |
| `turno/estado.ts` | `createBattleState(overrides?)` — estado inicial para tests y partidas nuevas |
| `turno/inicio-turno.ts` | `bajarCooldowns(state)`, `getEleccionForzada(state)`, `aplicarEleccionInicio(state, eleccion)`, `iniciarTurnoJugador(state)` |
| `turno/acciones.ts` | `getAccionesDisponibles(state)`, `ejecutarCanalizar(state)`, `ejecutarGenerarEnergia(state)`, `activarCombo(state)` |
| `turno/enemigo.ts` | `ConfigTurnoEnemigo`, `ejecutarTurnoEnemigo(state, rng, config)` — turno completo (6 pasos) |

### `validator/` y `ui/`

| Fichero | Estado |
|---------|--------|
| `validator/index.ts` | Stub vacío — pendiente |
| `ui/App.tsx` | Placeholder visual — sin conexión al engine |

---

## 3. Tipos núcleo del dominio

| Tipo | Fichero | Nota |
|------|---------|------|
| `BattleState` | `src/engine/turno/types.ts` | Estado completo de la batalla; todas las funciones del engine lo reciben y devuelven |
| `EfectoAtomico` | `src/content/types.ts` | Unión discriminada (17 miembros); el engine los interpreta, nunca hay lógica por carta |
| `Habilidad` | `src/content/types.ts` | Describe una habilidad con efectos, coste y keywords; usada por Líder y Enemigo |
| `CartaDramaturgia` | `src/content/types.ts` | Carta del mazo del enemigo: `icono` ('ataque'/'trama') + `efectos: EfectoAtomico[]` |
| `NucleoPool` | `src/engine/nucleos/types.ts` | `Partial<Record<NucleoColor, number>>` — color presente = activo; ausente = gastado |
| `NucleoColor` | `src/engine/nucleos/types.ts` | `'rojo' | 'azul' | 'verde' | 'amarillo' | 'morado'` |
| `EsbirroTemplate` | `src/content/types.ts` | Plantilla de tipo de esbirro (datos); la instancia en mesa es `EsbirroEnMesa` |
| `EsbirroEnMesa` | `src/engine/turno/types.ts` | Instancia de esbirro activo: `instanceId`, `vidaActual`, `recienInvocado`, etc. |
| `FaseEnemigo` / `Enemigo` | `src/content/types.ts` | Fases del enemigo (`activaA` = HP umbral); `faseActiva()` las deriva sin estado |
| `Rng` | `src/engine/rng.ts` | `() => number` — generador con semilla inyectado; misma semilla = partida reproducible |
| `ContextoEjecucion` | `src/engine/efectos/ejecutor.ts` | Contexto de un efecto: `fuente` ('jugador'/'enemigo'), `valorNucleo`, `keywords`, etc. |

---

## 4. Estado de specs

| Spec | Título | Estado | Tests |
|------|--------|--------|-------|
| 01 | Estructura de turno (acciones, inicio, cooldowns jugador) | **Implementada** | `turno.test.ts` — 25 tests |
| 02 | Núcleos (pool, dado virtual, launchPool, gastar) | **Implementada** | `pool.test.ts` — 26 tests |
| 03 | Efectos atómicos base (ataque, defensa, curar, trama, energía, robar) | **Implementada** | `ejecutor.test.ts` — 30 tests |
| 04 | Cooldowns y activación de habilidades (`activarHabilidad`) | **Implementada** | `activacion.test.ts` — 25 tests |
| 05 | Esbirros (`invocar`, `EsbirroEnMesa`, `limpiarEsbirrosMuertos`) | **Implementada** | `esbirros.test.ts` — 15 tests |
| 06 | Efectos restantes para Dramaturgia (`dañoFijo`, `buffAtaqueTemporal`, `siguienteDañoInabsorbible`, `dañoATodosAliados`, `descartar`, generalizar `curar`/`defensa`) | **Implementada** | `efectos-restantes.test.ts` — 26 tests |
| 07 | Mazo de Dramaturgia (30 cartas, `barajar`, `robarCarta`, deck-out) | **Implementada** | `mazo.test.ts` — 24 tests |
| 08 | Turno enemigo — cabeza: `faseActiva`, `elegirHabilidad`, `elegirNucleo` | **Implementada** | `ia.test.ts` — 26 tests |
| 09 | Turno enemigo — orquestación completa (6 pasos, `ejecutarTurnoEnemigo`) | **Implementada** | `enemigo.test.ts` — 9 tests |
| — | Validator (simulación de N batallas) | **Pendiente** | — |
| — | UI: conectar engine a React | **Pendiente** | — |

### Huecos conocidos dentro de specs implementadas

- `engine/esbirros/mesa.ts`: selección aleatoria de esbirro activo por turno → resuelto en spec 09
- `engine/turno/enemigo.ts` paso 1: pasiva del Bastión (+1 escudo/esbirro) → pendiente hasta spec del escenario
- `engine/turno/enemigo.ts` paso 5: keyword `Defensor` (prioridad de objetivo) → pendiente
- `engine/turno/enemigo.ts` paso 5: redirección de daño de esbirro a Aliado → pendiente
- `ejecutor.ts`: efectos `cancelar`, `aplicar-estado`, `modificar-dado` → stubs, lanzan error claro

---

*Para añadir nuevas specs: crear fichero en `specs/`, implementar en `engine/` o `content/`, tests en Vitest, commit en español.*
