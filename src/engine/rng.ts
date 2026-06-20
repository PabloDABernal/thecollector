export type Rng = () => number

/**
 * Mulberry32 — PRNG simple y determinista.
 * Misma semilla = misma secuencia. Nunca usar Math.random() en el engine.
 */
export function createRng(seed: number): Rng {
  let s = seed >>> 0
  return function () {
    s += 0x6d2b79f5
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
