import type { BattleState } from './types'

/**
 * Stub del turno del enemigo.
 * Implementación completa pendiente de la spec de Dramaturgia/Enemigo.
 *
 * Estructura esperada (spec §Turno del enemigo):
 *   1. Roba la carta superior de Dramaturgia.       ← implementado (parcial)
 *   2. Resuelve el efecto de la carta.              ← pendiente
 *   3. Ejecuta habilidad según icono (⚔️/📜).       ← pendiente
 *   4. Un Esbirro actúa (si los hay).               ← pendiente
 */
export function ejecutarTurnoEnemigo(state: BattleState): BattleState {
  // Paso 1: Roba carta de Dramaturgia
  if (state.dramaturgia.length === 0) {
    // Sin mazo no hay turno de enemigo — stub acepta este caso para tests
    return { ...state, fase: 'jugador' }
  }
  const [_carta, ...resto] = state.dramaturgia

  // Pasos 2-4: pendientes (spec de Dramaturgia / Enemigo)
  return {
    ...state,
    dramaturgia: resto,
    fase: 'jugador',
  }
}
