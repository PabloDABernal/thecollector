import type { Rng } from '../rng'
import {
  type NucleoColor,
  type NucleoPool,
  type NucleoCost,
  type DadoVirtualMod,
  NUCLEO_COLORS,
} from './types'
import { rollDado } from './dado-virtual'

/** Lanza (o relanza) el pool: 5 Núcleos, uno por color. */
export function launchPool(rng: Rng, mod?: DadoVirtualMod): NucleoPool {
  const pool: NucleoPool = {}
  for (const color of NUCLEO_COLORS) {
    pool[color] = rollDado(rng, mod)
  }
  return pool
}

/** Núcleos restantes en el pool. */
export function countPool(pool: NucleoPool): number {
  return NUCLEO_COLORS.filter((c) => pool[c] !== undefined).length
}

/** true si no queda ningún Núcleo (momento de relanzar). */
export function isPoolEmpty(pool: NucleoPool): boolean {
  return NUCLEO_COLORS.every((c) => pool[c] === undefined)
}

/** true si el coste puede pagarse con el pool actual. */
export function canPay(pool: NucleoPool, cost: NucleoCost): boolean {
  const eligible = cost.colors ?? NUCLEO_COLORS
  return eligible.some((c) => {
    const val = pool[c]
    return val !== undefined && val >= cost.minValor
  })
}

/**
 * Gasta un Núcleo del pool que satisfaga el coste.
 * Itera en orden NUCLEO_COLORS y toma el primer válido.
 * Devuelve null si el coste no puede pagarse.
 */
export function spendNucleo(
  pool: NucleoPool,
  cost: NucleoCost,
): { pool: NucleoPool; color: NucleoColor; valor: number } | null {
  const eligible = cost.colors ?? [...NUCLEO_COLORS]
  for (const color of eligible) {
    const val = pool[color]
    if (val !== undefined && val >= cost.minValor) {
      const next = { ...pool }
      delete next[color]
      return { pool: next, color, valor: val }
    }
  }
  return null
}
