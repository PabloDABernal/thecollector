import type { BattleState, TipoAccion } from './types'
import { ENERGIA_MAX, MANO_MAX } from './types'
import type { Habilidad } from '../../content/types'
import type { NucleoColor } from '../nucleos'
import { activarHabilidad, type ResultadoActivacion } from '../habilidades/activacion'

// ── Consultas ─────────────────────────────────────────────────────────────────

/**
 * Lista de acciones disponibles en este momento del turno.
 * 'canalizar' y 'generar-energia' están SIEMPRE presentes (nunca acción muerta).
 * Las demás dependen de contenido aún no implementado.
 *
 * TODO (Fase 1 cont.): añadir 'activar-habilidad-lider' cuando existan habilidades.
 * TODO (Fase 2+): añadir 'activar-habilidad-aliado' y 'bajar-carta'.
 */
export function getAccionesDisponibles(state: BattleState): TipoAccion[] {
  if (state.accionesRestantes <= 0) return []

  const acciones: TipoAccion[] = [
    'canalizar',
    'generar-energia',
    // 'activar-habilidad-lider'  ← pendiente de habilidades del Líder
    // 'activar-habilidad-aliado' ← pendiente de aliados
    // 'bajar-carta'              ← pendiente de cartas en mano
  ]
  return acciones
}

// ── Acciones implementadas ────────────────────────────────────────────────────

/**
 * Gasta 1 acción y añade 1 carta a la mano (máximo MANO_MAX).
 * Siempre disponible como plan B ("nunca acción muerta").
 */
export function ejecutarCanalizar(state: BattleState): BattleState {
  if (state.accionesRestantes <= 0) {
    throw new Error('ejecutarCanalizar: sin acciones restantes')
  }
  return {
    ...state,
    mano: Math.min(MANO_MAX, state.mano + 1),
    accionesRestantes: state.accionesRestantes - 1,
  }
}

/**
 * Gasta 1 acción y añade 1 Energía (máximo ENERGIA_MAX).
 * Siempre disponible como plan B ("nunca acción muerta").
 */
export function ejecutarGenerarEnergia(state: BattleState): BattleState {
  if (state.accionesRestantes <= 0) {
    throw new Error('ejecutarGenerarEnergia: sin acciones restantes')
  }
  return {
    ...state,
    energia: Math.min(ENERGIA_MAX, state.energia + 1),
    accionesRestantes: state.accionesRestantes - 1,
  }
}

/**
 * Concede la acción extra de Combo (+1 acción restante).
 * Solo se puede activar una vez por turno.
 * En la práctica lo llama ejecutarAccion cuando detecta la keyword Combo.
 *
 * TODO (Fase 1 cont.): llamar desde ejecutarAccion al resolver habilidades con Combo.
 */
export function activarCombo(state: BattleState): BattleState {
  if (state.comboActivo) return state
  return {
    ...state,
    comboActivo: true,
    accionesRestantes: state.accionesRestantes + 1,
  }
}

// ── Huecos para contenido futuro ──────────────────────────────────────────────

/**
 * Activa una habilidad del Líder. Delega en `activarHabilidad` (spec 04).
 */
export function ejecutarHabilidadLider(
  state: BattleState,
  habilidad: Habilidad,
  nucleoElegido: NucleoColor,
): ResultadoActivacion {
  return activarHabilidad(state, habilidad, nucleoElegido, 'jugador')
}

/**
 * TODO (Fase 2+): activar una habilidad de un Aliado en mesa.
 */
export function ejecutarHabilidadAliado(
  _state: BattleState,
  _idAliado: string,
  _idHabilidad: string,
): BattleState {
  throw new Error('ejecutarHabilidadAliado: pendiente de implementar (Fase 2+)')
}

/**
 * TODO (Fase 2+): bajar una carta de la mano pagando su coste en Energía.
 */
export function ejecutarBajarCarta(
  _state: BattleState,
  _idCarta: string,
): BattleState {
  throw new Error('ejecutarBajarCarta: pendiente de implementar (Fase 2+)')
}
