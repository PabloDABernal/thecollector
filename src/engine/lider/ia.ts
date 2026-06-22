import type { BattleState, EleccionInicio, PoliticaRedireccion } from '../turno/types'
import type { Habilidad, Carta } from '../../content/types'
import type { NucleoColor } from '../nucleos'
import { getEleccionForzada } from '../turno/inicio-turno'

// ─── Constante de diseño ──────────────────────────────────────────────────────

/** El bot evalúa daño y amenazas SIEMPRE a valor medio de Núcleo (nunca mira el pool real). */
export const NUCLEO_VALOR_MEDIO = 2.5

// ─── Tipo Accion ──────────────────────────────────────────────────────────────

/**
 * Acción que el bot puede ejecutar en su turno.
 * La Tanda 2 usa esta unión para construir la heurística completa.
 */
export type Accion =
  | { tipo: 'canalizar' }
  | { tipo: 'generar-energia' }
  | { tipo: 'activar-habilidad'; habilidad: Habilidad; nucleo: NucleoColor }
  | { tipo: 'bajar-carta'; carta: Carta }

// ─── Pieza A: Elección de inicio ─────────────────────────────────────────────

/**
 * Decide la elección gratuita de inicio de turno.
 *   1. Auto-regla forzada (mano llena / energía llena) → respetarla.
 *   2. Hay carta impagable en mano → 'generar-energia' para desbloquearla.
 *   3. En cualquier otro caso → 'canalizar'.
 *
 * @param cartasMano Cartas actuales del jugador. Opcional: si no se pasa, el
 *   paso 2 no se activa (el validador las pasará cuando el sistema de cartas esté listo).
 */
export function decidirEleccionInicio(
  state: BattleState,
  cartasMano: Carta[] = [],
): EleccionInicio {
  // Paso 1: elección impuesta por auto-regla
  const forzada = getEleccionForzada(state)
  if (forzada !== null) return forzada

  // Paso 2: hay carta con coste de Energía mayor que la Energía actual
  const hayImpagable = cartasMano.some((c) => c.coste.energia > state.energia)
  if (hayImpagable) return 'generar-energia'

  // Paso 3: por defecto, robar
  return 'canalizar'
}

// ─── Pieza C: Política de redirección conservadora ───────────────────────────

/** Umbral de HP del Líder (1/3 del máximo) por debajo del cual redirigir a un Aliado. */
const UMBRAL_REDIRECCION_FACTOR = 1 / 3

/**
 * Política conservadora: protege al Líder solo cuando está en peligro real.
 * Cumple el tipo PoliticaRedireccion.
 *
 * Reglas:
 *   1. Inabsorbible → Líder (el orquestador ya lo gestiona, pero ser coherente).
 *   2. Golpe llevaría al Líder bajo UMBRAL y hay aliado que puede absorberlo → aliado
 *      con menos vida disponible (mínimo desperdicio).
 *   3. Cualquier otro caso → Líder.
 */
export const politicaRedireccionLider: PoliticaRedireccion = (state, daño) => {
  if (daño.inabsorbible) return { destino: 'lider' }

  const umbral = Math.floor(state.leaderMaxHp * UMBRAL_REDIRECCION_FACTOR)
  const hpDespues = state.leaderHp - daño.cantidad

  if (hpDespues < umbral) {
    // Aliados vivos que pueden absorber el golpe entero
    const candidatos = state.aliados.filter((a) => a.hp > 0 && a.hp >= daño.cantidad)
    if (candidatos.length > 0) {
      // Redirigir al de menor vida (minimiza desperdicio futuro)
      const elegido = candidatos.reduce((a, b) => (a.hp <= b.hp ? a : b))
      return { destino: 'aliado', instanceId: elegido.id }
    }
  }

  return { destino: 'lider' }
}

// ─── Pieza B (STUB): Decidir acciones del turno ──────────────────────────────

// TODO heurística completa (tanda 2): letal → Defensor → Trama → daño

/**
 * Devuelve la secuencia de acciones que el bot jugará este turno.
 * STUB: elige la habilidad de mayor daño esperado (Núcleo medio = 2.5) si las hay;
 * si no, canalizar como plan B.
 * La Tanda 2 implementará la heurística completa.
 */
export function decidirAccionesTurno(_state: BattleState): Accion[] {
  // Sin habilidades expuestas aún por getAccionesDisponibles → plan B siempre
  return [{ tipo: 'canalizar' }]
}
