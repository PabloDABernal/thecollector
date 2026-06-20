import type { Rng } from '../rng'
import type { DadoVirtualMod } from './types'

function rollInRange(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

/**
 * Lanza un único dado con el modificador activo.
 * Sin modificador: distribución uniforme 1-4.
 */
export function rollDado(rng: Rng, mod?: DadoVirtualMod): number {
  if (mod === undefined) return rollInRange(rng, 1, 4)

  switch (mod.type) {
    case 'truncar-abajo':
      return rollInRange(rng, mod.min, 4)
    case 'truncar-arriba':
      return rollInRange(rng, 1, mod.max)
    case 'fijar':
      return mod.valor
    case 'filtrar': {
      const idx = Math.floor(rng() * mod.valores.length)
      return mod.valores[idx]!
    }
    case 'expandir':
      return rollInRange(rng, mod.min, mod.max)
  }
}
