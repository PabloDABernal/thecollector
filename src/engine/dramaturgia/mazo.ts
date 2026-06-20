import type { CartaDramaturgia } from '../../content/types'
import type { BattleState } from '../turno/types'
import type { Rng } from '../rng'

// ─── Barajado ─────────────────────────────────────────────────────────────────

/**
 * Fisher-Yates con RNG con semilla. Devuelve una nueva copia barajada.
 * Misma semilla = mismo orden (determinista).
 */
export function barajar(cartas: CartaDramaturgia[], rng: Rng): CartaDramaturgia[] {
  const a = [...cartas]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = a[i]!
    a[i] = a[j]!
    a[j] = tmp
  }
  return a
}

// ─── Robar carta ─────────────────────────────────────────────────────────────

export interface ResultadoRobo {
  carta: CartaDramaturgia
  state: BattleState
}

/**
 * Roba la carta superior del mazo (`dramaturgia[0]`) y la mueve al descarte.
 * Si el mazo está vacío, rebaraja el descarte automáticamente (deck-out: GDD §3.2).
 * Lanza si mazo Y descarte están vacíos (nunca debería ocurrir en partida normal).
 */
export function robarCarta(state: BattleState, rng: Rng): ResultadoRobo {
  let mazo = state.dramaturgia
  let descarte = state.dramaturgiaDescarte

  // Deck-out: rebarajar el descarte
  if (mazo.length === 0) {
    if (descarte.length === 0) {
      throw new Error('robarCarta: mazo y descarte vacíos')
    }
    mazo = barajar(descarte, rng)
    descarte = []
  }

  const carta = mazo[0]!
  return {
    carta,
    state: {
      ...state,
      dramaturgia: mazo.slice(1),
      dramaturgiaDescarte: [...descarte, carta],
    },
  }
}
