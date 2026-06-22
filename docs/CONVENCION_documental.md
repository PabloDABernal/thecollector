# CONVENCIÓN DOCUMENTAL — THE COLLECTOR
## Estructura fija. El orquestador (Claude) la mantiene; no se decide ad-hoc.

> Este documento existe para que NUNCA vuelva a haber dudas de "dónde guardo esto".
> Cada tipo de documento tiene un sitio único y una regla de actualización.

---

## 1. MAPA DE CARPETAS

### `docs/` — documentos vivos de diseño
Documentos que evolucionan con versión (v5, v6...). Estado 🟢🟡⬜. Se actualizan
editando, no creando ficheros nuevos con fecha.

- `GDD_The_Collector_v5.md`
- `Sistema_y_Balanceo_The_Collector_v6.md`
- `Devkit_The_Collector_v1.md`
- `Prompt_Sistema_The_Collector_v6.md`
- `Simulacion_Prototipo_The_Collector_v1_2.md`
- `Flujo_LLM_Local_The_Collector_v1.md`
- `Estructura_Repo_The_Collector_v1.md`  ← MOVER aquí desde raíz

### `specs/` — specs de implementación
Una por pieza de código. Numeración secuencial limpia. Se escriben ANTES de
implementar (método spec-driven). No se editan tras implementar salvo corrección.

- `01` … `10`, más `10a`, `10b` (las dos retroactivas de la sesión 22-jun).
- **Siguiente spec = `11`.** No más sufijos a/b: número limpio.

### Raíz — control de proyecto y config
- `CLAUDE.md` — instrucciones permanentes para Claude Code (cómo trabajar en el repo).
- `PLAN.md` — **estado actual + próximos pasos + deudas. Aquí va el cierre de sesión.**
- `README.md`, ficheros de config (vite, tsconfig, package, tailwind, postcss).

### `src/` — código (su mapa está en Estructura_Repo).

---

## 2. REGLA DEL CIERRE DE SESIÓN

**NO se crea un fichero `CIERRE_fecha.md`.** Eso multiplica documentos sin control.
El cierre de sesión se vuelca así, repartido:

| Contenido del cierre | Va a |
|----------------------|------|
| Estado actual, próximos pasos, qué se hizo | `PLAN.md` (se reescribe la sección) |
| Deudas conscientes permanentes | sección "Deudas" de `PLAN.md` |
| Firmas/exports nuevos | `Estructura_Repo` (inventario de exports) |
| Estado de specs (cuál implementada) | `Estructura_Repo` (tabla de specs) |
| Decisiones de diseño cerradas | el documento vivo que corresponda (Sistema, GDD…) |

---

## 3. QUIÉN ACTUALIZA QUÉ, Y CUÁNDO

- **Specs:** Claude las escribe (artefacto) → tú las guardas en `specs/` → Claude Code
  implementa con prompt de una línea.
- **`Estructura_Repo`:** se actualiza al cierre de cada sesión que toque exports o
  specs. Lo dirige Claude vía prompt a Claude Code.
- **`PLAN.md`:** se reescribe al cierre de cada sesión. Lo dirige Claude.
- **Documentos vivos de diseño:** se editan cuando una decisión de diseño se cierra.
  Lo dirige Claude.

> Claude es el orquestador: decide dónde va cada cosa y emite el prompt. El humano
> ejecuta y reporta. Si Claude no sabe el estado del disco, pide un listado antes de
> dirigir — nunca manda "guárdalo donde lleves las notas".
