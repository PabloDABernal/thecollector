import type { BattleState, EleccionInicio } from './types'
import { ENERGIA_MAX, MANO_MAX, ACCIONES_POR_TURNO } from './types'

/**
 * Paso 1 del turno del jugador: reduce todos los cooldowns activos en 1.
 * Los cooldowns que ya están a 0 no cambian.
 */
export function bajarCooldowns(state: BattleState): BattleState {
  const cooldowns: Record<string, number> = {}
  for (const [id, cd] of Object.entries(state.cooldowns)) {
    cooldowns[id] = cd > 0 ? cd - 1 : 0
  }
  return { ...state, cooldowns }
}

/**
 * Devuelve la elección de inicio forzada por las auto-reglas, o null si
 * el jugador puede elegir libremente.
 *   - mano = MANO_MAX  → forzado 'generar-energia'
 *   - energia = ENERGIA_MAX → forzado 'canalizar'
 */
export function getEleccionForzada(state: BattleState): EleccionInicio | null {
  if (state.mano >= MANO_MAX) return 'generar-energia'
  if (state.energia >= ENERGIA_MAX) return 'canalizar'
  return null
}

/**
 * Aplica la elección de inicio (gratuita, NO descuenta acción).
 * Respeta los límites ENERGIA_MAX y MANO_MAX.
 */
export function aplicarEleccionInicio(
  state: BattleState,
  eleccion: EleccionInicio,
): BattleState {
  if (eleccion === 'generar-energia') {
    return { ...state, energia: Math.min(ENERGIA_MAX, state.energia + 1) }
  }
  return { ...state, mano: Math.min(MANO_MAX, state.mano + 1) }
}

/**
 * Ejecuta la fase completa de inicio del turno del jugador:
 *   1. (stub) Efectos de Trama — pendiente de spec de Trama.
 *   2. Baja cooldowns.
 *   3. Aplica la elección de inicio (gratuita).
 *   4. Resetea acciones (2) y Combo.
 *   5. Avanza el número de turno.
 */
export function iniciarTurnoJugador(
  state: BattleState,
  eleccion: EleccionInicio,
): BattleState {
  // Paso 1 — Efectos de Trama: pendiente (spec de Trama)
  let s = state

  // Paso 2 — Bajar cooldowns
  s = bajarCooldowns(s)

  // Paso 3 — Elección de inicio gratuita
  s = aplicarEleccionInicio(s, eleccion)

  // Paso 4 — Resetear acciones, Combo y buffs temporales del enemigo
  s = {
    ...s,
    accionesRestantes: ACCIONES_POR_TURNO,
    comboActivo: false,
    buffAtaqueTemporal: 0,
    fase: 'jugador',
  }

  // Paso 5 — Avanzar turno (el número sube al inicio del turno del jugador)
  s = { ...s, turno: s.turno + 1 }

  return s
}
