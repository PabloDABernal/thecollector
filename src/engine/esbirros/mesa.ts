import type { BattleState } from '../turno/types'

/**
 * Elimina del tablero todo esbirro con vidaActual ≤ 0.
 * Llamar después de cualquier acción que pueda dejar esbirros a 0 HP.
 */
export function limpiarEsbirrosMuertos(state: BattleState): BattleState {
  const vivos = state.esbirros.filter((e) => e.vidaActual > 0)
  if (vivos.length === state.esbirros.length) return state
  return { ...state, esbirros: vivos }
}

// TODO (spec 05 / turno enemigo): selección de 1 esbirro activo por turno (aleatorio, filtro recienInvocado)
// TODO (spec 05 / presencia pasiva): Verdugo +1 Trama/esbirro en Proclama; Bastión +1 escudo/esbirro al inicio turno enemigo
