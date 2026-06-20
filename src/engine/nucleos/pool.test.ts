import { describe, it, expect } from 'vitest'
import { createRng } from '../rng'
import { NUCLEO_COLORS } from './types'
import {
  launchPool,
  countPool,
  isPoolEmpty,
  canPay,
  spendNucleo,
} from './pool'
import { rollDado } from './dado-virtual'

// ─── Criterio 1: pool recién lanzado ──────────────────────────────────────────

describe('launchPool', () => {
  it('tiene exactamente 5 Núcleos, uno por color', () => {
    const rng = createRng(42)
    const pool = launchPool(rng)
    expect(countPool(pool)).toBe(5)
    for (const color of NUCLEO_COLORS) {
      expect(pool[color]).toBeDefined()
    }
  })

  it('todos los valores están en rango 1-4', () => {
    const rng = createRng(42)
    const pool = launchPool(rng)
    for (const color of NUCLEO_COLORS) {
      const val = pool[color]!
      expect(val).toBeGreaterThanOrEqual(1)
      expect(val).toBeLessThanOrEqual(4)
    }
  })
})

// ─── Criterio 2: gastar Núcleo lo retira ──────────────────────────────────────

describe('spendNucleo', () => {
  it('retira el Núcleo gastado del pool', () => {
    const rng = createRng(1)
    const pool = launchPool(rng)
    const result = spendNucleo(pool, { colors: ['rojo'], minValor: 1 })
    expect(result).not.toBeNull()
    expect(result!.pool['rojo']).toBeUndefined()
    expect(countPool(result!.pool)).toBe(4)
  })

  it('devuelve el color y valor del Núcleo gastado', () => {
    const rng = createRng(1)
    const pool = launchPool(rng)
    const valorOriginal = pool['rojo']!
    const result = spendNucleo(pool, { colors: ['rojo'], minValor: 1 })
    expect(result!.color).toBe('rojo')
    expect(result!.valor).toBe(valorOriginal)
  })

  it('devuelve null si el coste no puede pagarse', () => {
    // Pool con solo rojo valor 1; intentar pagar ⚫3 (mínimo 3)
    const pool = { rojo: 1 }
    const result = spendNucleo(pool, { colors: null, minValor: 3 })
    expect(result).toBeNull()
  })

  it('⚫ (any color) toma el primer color disponible en orden', () => {
    // Pool sin rojo ni azul
    const pool = { verde: 2, amarillo: 3, morado: 1 }
    const result = spendNucleo(pool, { colors: null, minValor: 1 })
    expect(result!.color).toBe('verde')
  })
})

// ─── Criterio 3: pool NO se relanza mientras quede ≥1 Núcleo ─────────────────

describe('isPoolEmpty', () => {
  it('false cuando queda al menos 1 Núcleo', () => {
    const pool = { rojo: 2 }
    expect(isPoolEmpty(pool)).toBe(false)
  })

  it('false con el pool completo', () => {
    const rng = createRng(10)
    const pool = launchPool(rng)
    expect(isPoolEmpty(pool)).toBe(false)
  })

  // ─── Criterio 4: pool se relanza cuando llega a 0 ─────────────────────────

  it('true cuando no queda ningún Núcleo', () => {
    const pool = {}
    expect(isPoolEmpty(pool)).toBe(true)
  })

  it('pool vacío tras gastar los 5 Núcleos uno a uno', () => {
    const rng = createRng(7)
    let pool = launchPool(rng)
    for (const color of NUCLEO_COLORS) {
      const result = spendNucleo(pool, { colors: [color], minValor: 1 })
      pool = result!.pool
    }
    expect(isPoolEmpty(pool)).toBe(true)
  })
})

// ─── Criterio 5: ⚫3 solo pagable con valor ≥3 ────────────────────────────────

describe('canPay', () => {
  it('⚫3 puede pagarse cuando hay un Núcleo de valor ≥3', () => {
    const pool = { rojo: 1, azul: 3, verde: 2, amarillo: 1, morado: 4 }
    expect(canPay(pool, { colors: null, minValor: 3 })).toBe(true)
  })

  it('⚫3 NO puede pagarse cuando todos los Núcleos valen <3', () => {
    const pool = { rojo: 1, azul: 2, verde: 1, amarillo: 2, morado: 2 }
    expect(canPay(pool, { colors: null, minValor: 3 })).toBe(false)
  })

  it('⚫ (sin mínimo) puede pagarse mientras haya algún Núcleo', () => {
    const pool = { rojo: 1 }
    expect(canPay(pool, { colors: null, minValor: 1 })).toBe(true)
  })

  it('⚫ no puede pagarse con pool vacío', () => {
    expect(canPay({}, { colors: null, minValor: 1 })).toBe(false)
  })

  it('🔴🟡🟢 puede pagarse si alguno de esos colores está disponible', () => {
    const pool = { azul: 4, morado: 2 }
    // rojo, amarillo, verde ausentes → no puede pagarse
    expect(canPay(pool, { colors: ['rojo', 'amarillo', 'verde'], minValor: 1 })).toBe(false)
    const pool2 = { azul: 4, verde: 1 }
    expect(canPay(pool2, { colors: ['rojo', 'amarillo', 'verde'], minValor: 1 })).toBe(true)
  })

  it('🔴3 requiere rojo con valor ≥3', () => {
    expect(canPay({ rojo: 2 }, { colors: ['rojo'], minValor: 3 })).toBe(false)
    expect(canPay({ rojo: 3 }, { colors: ['rojo'], minValor: 3 })).toBe(true)
  })

  it('spendNucleo ⚫3 solo elige Núcleos de valor ≥3', () => {
    const pool = { rojo: 1, azul: 4, verde: 2, amarillo: 3, morado: 1 }
    const result = spendNucleo(pool, { colors: null, minValor: 3 })
    expect(result).not.toBeNull()
    expect(result!.valor).toBeGreaterThanOrEqual(3)
  })
})

// ─── Criterio 6: determinismo — misma semilla = mismo pool ───────────────────

describe('determinismo', () => {
  it('dos instancias con la misma semilla producen pools idénticos', () => {
    const seed = 99999
    const pool1 = launchPool(createRng(seed))
    const pool2 = launchPool(createRng(seed))
    expect(pool1).toEqual(pool2)
  })

  it('secuencias completas (launch + spend × 3) son reproducibles', () => {
    const seed = 12345
    function simulate(s: number) {
      const rng = createRng(s)
      let pool = launchPool(rng)
      const log: Array<{ color: string; valor: number }> = []
      for (let i = 0; i < 3; i++) {
        const r = spendNucleo(pool, { colors: null, minValor: 1 })!
        log.push({ color: r.color, valor: r.valor })
        pool = r.pool
      }
      return log
    }
    expect(simulate(seed)).toEqual(simulate(seed))
  })

  it('semillas diferentes producen pools diferentes (probabilístico)', () => {
    const pool1 = launchPool(createRng(1))
    const pool2 = launchPool(createRng(2))
    // No garantizado al 100% pero con semillas distintas es extremadamente improbable
    expect(pool1).not.toEqual(pool2)
  })
})

// ─── Criterio 7: dados virtuales ─────────────────────────────────────────────

describe('dado virtual', () => {
  const RUNS = 200

  it('truncar-abajo: todos los valores ≥ min', () => {
    const rng = createRng(5)
    const valores = Array.from({ length: RUNS }, () =>
      rollDado(rng, { type: 'truncar-abajo', min: 2 }),
    )
    expect(valores.every((v) => v >= 2 && v <= 4)).toBe(true)
    expect(valores.some((v) => v === 2)).toBe(true)
    expect(valores.some((v) => v === 4)).toBe(true)
  })

  it('truncar-arriba: todos los valores ≤ max', () => {
    const rng = createRng(5)
    const valores = Array.from({ length: RUNS }, () =>
      rollDado(rng, { type: 'truncar-arriba', max: 2 }),
    )
    expect(valores.every((v) => v >= 1 && v <= 2)).toBe(true)
    expect(valores.some((v) => v === 1)).toBe(true)
    expect(valores.some((v) => v === 2)).toBe(true)
  })

  it('fijar: siempre devuelve el valor fijo', () => {
    const rng = createRng(5)
    const valores = Array.from({ length: RUNS }, () =>
      rollDado(rng, { type: 'fijar', valor: 4 }),
    )
    expect(valores.every((v) => v === 4)).toBe(true)
  })

  it('filtrar: solo devuelve valores de la lista (impares)', () => {
    const rng = createRng(5)
    const valores = Array.from({ length: RUNS }, () =>
      rollDado(rng, { type: 'filtrar', valores: [1, 3] }),
    )
    expect(valores.every((v) => v === 1 || v === 3)).toBe(true)
    expect(valores.some((v) => v === 1)).toBe(true)
    expect(valores.some((v) => v === 3)).toBe(true)
  })

  it('expandir: rango extendido 1-6', () => {
    const rng = createRng(5)
    const valores = Array.from({ length: RUNS }, () =>
      rollDado(rng, { type: 'expandir', min: 1, max: 6 }),
    )
    expect(valores.every((v) => v >= 1 && v <= 6)).toBe(true)
    expect(valores.some((v) => v === 5 || v === 6)).toBe(true)
  })

  it('launchPool con modificador aplica dado virtual a todo el pool', () => {
    const rng = createRng(20)
    const pool = launchPool(rng, { type: 'truncar-abajo', min: 3 })
    for (const color of NUCLEO_COLORS) {
      expect(pool[color]).toBeGreaterThanOrEqual(3)
    }
  })
})
