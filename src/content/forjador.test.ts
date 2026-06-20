import { describe, it, expect } from 'vitest'
import { createBattleState } from '../engine/turno/estado'
import { activarHabilidad } from '../engine/habilidades/activacion'
import {
  FORJADOR,
  MARTILLO_DE_FORJA,
  TEMPLE_DE_ACERO,
  COLADURA_ARDIENTE,
  GRAN_FUNDICION,
} from './forjador'

// ─── Estructura del Forjador ─────────────────────────────────────────────────

describe('FORJADOR — estructura', () => {
  it('tiene 4 habilidades con CDs 1/2/3/4', () => {
    const cds = FORJADOR.habilidades.map((h) => h.coste.cd)
    expect(cds).toEqual([1, 2, 3, 4])
  })

  it('HP = 32', () => {
    expect(FORJADOR.hp).toBe(32)
  })

  it('CD1 ⚫ (cualquier color)', () => {
    expect(MARTILLO_DE_FORJA.coste.color).toBeNull()
  })

  it('CD1 sin efectosUmbral (puro)', () => {
    expect(MARTILLO_DE_FORJA.efectosUmbral).toBeUndefined()
  })
})

// ─── Helper: estado listo para activar con accionesRestantes=2 ───────────────

function estadoCon(pool: Record<string, number>, overrides = {}) {
  return createBattleState({ pool, accionesRestantes: 2, ...overrides })
}

// ─── Martillo de forja ───────────────────────────────────────────────────────

describe('Martillo de forja (CD1 ⚫)', () => {
  it('Núcleo 3 → 3 de daño al enemigo', () => {
    const s = estadoCon({ rojo: 3 }, { enemyHp: 20 })
    const r = activarHabilidad(s, MARTILLO_DE_FORJA, 'rojo', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.enemyHp).toBe(17)
  })

  it('acepta cualquier color (⚫)', () => {
    const colores = ['rojo', 'azul', 'verde', 'amarillo', 'morado'] as const
    for (const color of colores) {
      const s = estadoCon({ [color]: 2 }, { enemyHp: 20 })
      const r = activarHabilidad(s, MARTILLO_DE_FORJA, color, 'jugador')
      expect(r.ok, `debe aceptar color ${color}`).toBe(true)
    }
  })

  it('daño = valor del Núcleo (puro, sin modificador)', () => {
    for (const valor of [1, 2, 3, 4]) {
      const s = estadoCon({ azul: valor }, { enemyHp: 20 })
      const r = activarHabilidad(s, MARTILLO_DE_FORJA, 'azul', 'jugador')
      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.state.enemyHp).toBe(20 - valor)
    }
  })
})

// ─── Temple de acero ─────────────────────────────────────────────────────────

describe('Temple de acero (CD2 🔵)', () => {
  it('Núcleo 2 (<3): Trama 5 → 3; escudo 0 → 3', () => {
    const s = estadoCon({ azul: 2 }, { trama: 5, escudos: 0 })
    const r = activarHabilidad(s, TEMPLE_DE_ACERO, 'azul', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.trama).toBe(3)   // 5 − 2
    expect(r.state.escudos).toBe(3)
  })

  it('Núcleo 3 (≥3, umbral): Trama 5 → 2; escudo 0 → 3', () => {
    const s = estadoCon({ azul: 3 }, { trama: 5, escudos: 0 })
    const r = activarHabilidad(s, TEMPLE_DE_ACERO, 'azul', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.trama).toBe(2)   // 5 − 3
    expect(r.state.escudos).toBe(3)
  })

  it('solo acepta 🔵 (azul)', () => {
    const s = estadoCon({ rojo: 2 })
    const r = activarHabilidad(s, TEMPLE_DE_ACERO, 'rojo', 'jugador')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.razon).toBe('nucleo-invalido')
  })

  it('Trama no baja de 0 (clamp)', () => {
    const s = estadoCon({ azul: 4 }, { trama: 2, escudos: 0 })
    // umbral: Trama3 → 2−3 = −1 → clamp 0
    const r = activarHabilidad(s, TEMPLE_DE_ACERO, 'azul', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.trama).toBe(0)
  })
})

// ─── Coladura ardiente ───────────────────────────────────────────────────────

describe('Coladura ardiente (CD3 🔴)', () => {
  it('Núcleo 2 (<3): Ataque+3 → 5 de daño', () => {
    const s = estadoCon({ rojo: 2 }, { enemyHp: 20 })
    const r = activarHabilidad(s, COLADURA_ARDIENTE, 'rojo', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.enemyHp).toBe(15) // 2 + 3 = 5
  })

  it('Núcleo 4 (≥3, umbral): Ataque×2 → 8 de daño', () => {
    const s = estadoCon({ rojo: 4 }, { enemyHp: 20 })
    const r = activarHabilidad(s, COLADURA_ARDIENTE, 'rojo', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.enemyHp).toBe(12) // 4 × 2 = 8
  })

  it('Núcleo 1: daño 4 (1+3, base)', () => {
    const s = estadoCon({ rojo: 1 }, { enemyHp: 20 })
    const r = activarHabilidad(s, COLADURA_ARDIENTE, 'rojo', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.enemyHp).toBe(16) // 1 + 3 = 4
  })

  it('Núcleo 3: daño 6 (3×2, umbral — sin solapamiento)', () => {
    const s = estadoCon({ rojo: 3 }, { enemyHp: 20 })
    const r = activarHabilidad(s, COLADURA_ARDIENTE, 'rojo', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.enemyHp).toBe(14) // 3 × 2 = 6
  })
})

// ─── Gran Fundición ───────────────────────────────────────────────────────────

describe('Gran Fundición (CD4 🟣 Caos)', () => {
  it('Núcleo 4: 12 daño al enemigo y 4 auto-daño al Líder', () => {
    const s = estadoCon({ morado: 4 }, { enemyHp: 20, leaderHp: 32 })
    const r = activarHabilidad(s, GRAN_FUNDICION, 'morado', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.enemyHp).toBe(8)  // 4 × 3 = 12
    expect(r.state.leaderHp).toBe(28) // 32 − 4 (Caos)
  })

  it('Núcleo 1: 3 daño al enemigo y 1 auto-daño al Líder', () => {
    const s = estadoCon({ morado: 1 }, { enemyHp: 20, leaderHp: 32 })
    const r = activarHabilidad(s, GRAN_FUNDICION, 'morado', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.enemyHp).toBe(17)  // 1 × 3 = 3
    expect(r.state.leaderHp).toBe(31) // 32 − 1 (Caos)
  })

  it('auto-daño Caos es inabsorbible (escudos intactos)', () => {
    const s = estadoCon({ morado: 4 }, { enemyHp: 20, leaderHp: 32, escudos: 5 })
    const r = activarHabilidad(s, GRAN_FUNDICION, 'morado', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.escudos).toBe(5)   // el ataque va al enemigo; el Caos es inabsorbible
    expect(r.state.leaderHp).toBe(28) // −4, no absorbido por escudos
  })

  it('solo acepta 🟣 (morado)', () => {
    const s = estadoCon({ rojo: 4 })
    const r = activarHabilidad(s, GRAN_FUNDICION, 'rojo', 'jugador')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.razon).toBe('nucleo-invalido')
  })
})
