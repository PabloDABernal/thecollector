import type { Habilidad } from '../../content/types'
import type { NucleoColor } from '../nucleos'
import type { BattleState } from '../turno/types'
import { aplicarEfecto, type ContextoEjecucion } from '../efectos/ejecutor'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ResultadoActivacion =
  | { ok: true; state: BattleState }
  | { ok: false; razon: 'cooldown-activo' | 'nucleo-invalido' | 'sin-acciones' }

// ─── Calentamiento ────────────────────────────────────────────────────────────

/**
 * Devuelve un mapa de cooldowns inicializado en calentamiento:
 * cada habilidad empieza con su cd completo (usable desde el turno N).
 * Aplicar a `state.cooldowns` (jugador) o `state.cooldownsEnemigo` (enemigo).
 */
export function calentarHabilidades(habilidades: Habilidad[]): Record<string, number> {
  const cooldowns: Record<string, number> = {}
  for (const h of habilidades) {
    cooldowns[h.id] = h.coste.cd
  }
  return cooldowns
}

// ─── Activación ───────────────────────────────────────────────────────────────

/**
 * Activa una habilidad del Líder o de un Aliado.
 * Pasos (spec 04 §Activación):
 *  1. Valida cooldown = 0.
 *  2. Valida que el Núcleo elegido cumple color y valorMinimo.
 *  3. Gasta el Núcleo del pool.
 *  4. Pone cooldown = cd.
 *  5. Elige efectos base vs efectosUmbral (valorNucleo ≥ 3).
 *  6. Ejecuta los efectos.
 *  7. Aplica regla Caos si coste es 🟣.
 *  8. Descuenta 1 acción (solo cuando fuente = 'jugador').
 */
export function activarHabilidad(
  state: BattleState,
  habilidad: Habilidad,
  nucleoElegido: NucleoColor,
  fuente: 'jugador' | 'enemigo',
): ResultadoActivacion {
  const coste = habilidad.coste
  const cdMapKey = fuente === 'jugador' ? 'cooldowns' : 'cooldownsEnemigo'

  // ── 1. Cooldown = 0 ──────────────────────────────────────────────────────
  const cdActual = state[cdMapKey][habilidad.id] ?? 0
  if (cdActual > 0) return { ok: false, razon: 'cooldown-activo' }

  // ── 2a. Acciones disponibles (solo jugador) ───────────────────────────────
  if (fuente === 'jugador' && state.accionesRestantes <= 0) {
    return { ok: false, razon: 'sin-acciones' }
  }

  // ── 2b. Validar Núcleo elegido ────────────────────────────────────────────
  const valorNucleo = state.pool[nucleoElegido]
  if (valorNucleo === undefined) return { ok: false, razon: 'nucleo-invalido' }

  if (coste.color !== null && !coste.color.includes(nucleoElegido)) {
    return { ok: false, razon: 'nucleo-invalido' }
  }
  if (valorNucleo < coste.valorMinimo) {
    return { ok: false, razon: 'nucleo-invalido' }
  }

  // ── 3. Gastar Núcleo del pool ─────────────────────────────────────────────
  const newPool = { ...state.pool }
  delete newPool[nucleoElegido]
  let s: BattleState = { ...state, pool: newPool }

  // ── 4. Poner cooldown ─────────────────────────────────────────────────────
  s = {
    ...s,
    [cdMapKey]: { ...s[cdMapKey], [habilidad.id]: coste.cd },
  }

  // ── 5. Decidir efectos base vs umbral ─────────────────────────────────────
  const efectosAEjecutar =
    valorNucleo >= 3 && habilidad.efectosUmbral !== undefined
      ? habilidad.efectosUmbral
      : habilidad.efectos

  // ── 6. Ejecutar efectos ───────────────────────────────────────────────────
  const ctx: ContextoEjecucion = {
    valorNucleo,
    fuente,
    colorCoste: coste.color,
    keywords: habilidad.keywords,
  }
  for (const efecto of efectosAEjecutar) {
    s = aplicarEfecto(s, efecto, ctx)
  }

  // ── 7. Regla Caos (🟣) ───────────────────────────────────────────────────
  const esCaos =
    coste.color !== null &&
    coste.color.length === 1 &&
    coste.color[0] === 'morado'
  if (esCaos) {
    s = { ...s, leaderHp: Math.max(0, s.leaderHp - valorNucleo) }
  }

  // ── 8. Descontar acción (solo jugador) ────────────────────────────────────
  if (fuente === 'jugador') {
    s = { ...s, accionesRestantes: s.accionesRestantes - 1 }
  }

  return { ok: true, state: s }
}
