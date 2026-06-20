import { describe, it, expect } from 'vitest'
import { createBattleState } from '../engine/turno/estado'
import { activarHabilidad } from '../engine/habilidades/activacion'
import {
  VERDUGO,
  FASES_VERDUGO,
  TAJO,
  GRITO_DE_GUERRA,
  EJECUCION,
  PROCLAMA,
  DECAPITACION,
} from './verdugo'

// ─── Estructura del Verdugo ───────────────────────────────────────────────────

describe('VERDUGO — estructura', () => {
  it('HP total = 80', () => {
    expect(VERDUGO.hpTotal).toBe(80)
  })

  it('tiene 2 fases', () => {
    expect(VERDUGO.fases).toHaveLength(2)
  })

  it('Fase 1 (activaA=80): 4 habilidades con CDs 1/1/2/3', () => {
    const cds = FASES_VERDUGO[0]!.habilidades.map((h) => h.coste.cd)
    expect(cds).toEqual([1, 1, 2, 3])
  })

  it('Fase 1: todas las habilidades son ⚫ (color null)', () => {
    FASES_VERDUGO[0]!.habilidades.forEach((h) => {
      expect(h.coste.color).toBeNull()
    })
  })

  it('Ejecución requiere valorMinimo 4 (⚫4)', () => {
    expect(EJECUCION.coste.valorMinimo).toBe(4)
  })

  it('Fase 2 tiene activaA=40', () => {
    expect(FASES_VERDUGO[1]!.activaA).toBe(40)
  })

  it('Fase 2: Decapitación reemplaza a Ejecución', () => {
    const ids = FASES_VERDUGO[1]!.habilidades.map((h) => h.id)
    expect(ids).toContain('verdugo-decapitacion')
    expect(ids).not.toContain('verdugo-ejecucion')
  })

  it('Decapitación tiene valorMinimo 4 igual que Ejecución', () => {
    expect(DECAPITACION.coste.valorMinimo).toBe(4)
  })
})

// ─── Helper ───────────────────────────────────────────────────────────────────

function estadoEnemigo(pool: Record<string, number>, overrides = {}) {
  return createBattleState({ pool, leaderHp: 32, trama: 0, ...overrides })
}

// ─── Tajo (CD1 ⚫ Ataque puro) ────────────────────────────────────────────────

describe('Tajo (CD1 ⚫)', () => {
  it('Núcleo 4 → 4 de daño al Líder', () => {
    const s = estadoEnemigo({ rojo: 4 }, { leaderHp: 32 })
    const r = activarHabilidad(s, TAJO, 'rojo', 'enemigo')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.leaderHp).toBe(28)
  })

  it('acepta cualquier color (⚫)', () => {
    const colores = ['rojo', 'azul', 'verde', 'amarillo', 'morado'] as const
    for (const color of colores) {
      const s = estadoEnemigo({ [color]: 2 })
      const r = activarHabilidad(s, TAJO, color, 'enemigo')
      expect(r.ok, `debe aceptar ${color}`).toBe(true)
    }
  })

  it('daño = valor del Núcleo (puro)', () => {
    for (const valor of [1, 2, 3, 4]) {
      const s = estadoEnemigo({ azul: valor }, { leaderHp: 32 })
      const r = activarHabilidad(s, TAJO, 'azul', 'enemigo')
      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.state.leaderHp).toBe(32 - valor)
    }
  })

  it('no descuenta accionesRestantes del jugador', () => {
    const s = estadoEnemigo({ rojo: 2 }, { accionesRestantes: 2 })
    const r = activarHabilidad(s, TAJO, 'rojo', 'enemigo')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.accionesRestantes).toBe(2)
  })
})

// ─── Grito de guerra (CD1 ⚫ Trama1) ─────────────────────────────────────────

describe('Grito de guerra (CD1 ⚫)', () => {
  it('Trama 0 → sube a 1 (enemigo suma)', () => {
    const s = estadoEnemigo({ verde: 1 }, { trama: 0 })
    const r = activarHabilidad(s, GRITO_DE_GUERRA, 'verde', 'enemigo')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.trama).toBe(1)
  })

  it('acumula Trama (enemigo suma, no resta)', () => {
    const s = estadoEnemigo({ verde: 1 }, { trama: 3 })
    const r = activarHabilidad(s, GRITO_DE_GUERRA, 'verde', 'enemigo')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.trama).toBe(4)
  })
})

// ─── Ejecución (CD2 ⚫4 Ataque+2) ────────────────────────────────────────────

describe('Ejecución (CD2 ⚫4)', () => {
  it('Núcleo 4 → 6 de daño al Líder (4+2)', () => {
    const s = estadoEnemigo({ rojo: 4 }, { leaderHp: 32 })
    const r = activarHabilidad(s, EJECUCION, 'rojo', 'enemigo')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.leaderHp).toBe(26)
  })

  it('Núcleo 3 → nucleo-invalido (valorMinimo 4)', () => {
    const s = estadoEnemigo({ rojo: 3 })
    const r = activarHabilidad(s, EJECUCION, 'rojo', 'enemigo')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.razon).toBe('nucleo-invalido')
  })

  it('Núcleo 1 → nucleo-invalido', () => {
    const s = estadoEnemigo({ azul: 1 })
    const r = activarHabilidad(s, EJECUCION, 'azul', 'enemigo')
    expect(r.ok).toBe(false)
  })

  it('Núcleo 2 → nucleo-invalido', () => {
    const s = estadoEnemigo({ morado: 2 })
    const r = activarHabilidad(s, EJECUCION, 'morado', 'enemigo')
    expect(r.ok).toBe(false)
  })
})

// ─── Proclama (CD3 ⚫ Trama3) ────────────────────────────────────────────────

describe('Proclama (CD3 ⚫)', () => {
  it('Trama 0 → sube a 3', () => {
    const s = estadoEnemigo({ amarillo: 2 }, { trama: 0 })
    const r = activarHabilidad(s, PROCLAMA, 'amarillo', 'enemigo')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.trama).toBe(3)
  })

  it('acumula sobre Trama existente', () => {
    const s = estadoEnemigo({ amarillo: 1 }, { trama: 2 })
    const r = activarHabilidad(s, PROCLAMA, 'amarillo', 'enemigo')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.trama).toBe(5)
  })
})

// ─── Decapitación — Fase 2 (CD2 ⚫4 Ataque+3) ────────────────────────────────

describe('Decapitación (Fase 2, CD2 ⚫4)', () => {
  it('Núcleo 4 → 7 de daño al Líder (4+3)', () => {
    const s = estadoEnemigo({ verde: 4 }, { leaderHp: 32 })
    const r = activarHabilidad(s, DECAPITACION, 'verde', 'enemigo')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.leaderHp).toBe(25)
  })

  it('Núcleo 3 → nucleo-invalido (valorMinimo 4)', () => {
    const s = estadoEnemigo({ verde: 3 })
    const r = activarHabilidad(s, DECAPITACION, 'verde', 'enemigo')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.razon).toBe('nucleo-invalido')
  })

  it('hace más daño que Ejecución (+3 vs +2)', () => {
    const s = estadoEnemigo({ rojo: 4 }, { leaderHp: 32 })
    const rEj  = activarHabilidad(s, EJECUCION,   'rojo', 'enemigo')
    const rDec = activarHabilidad(s, DECAPITACION, 'rojo', 'enemigo')
    expect(rEj.ok && rDec.ok).toBe(true)
    if (!rEj.ok || !rDec.ok) return
    expect(rDec.state.leaderHp).toBe(rEj.state.leaderHp - 1)
  })
})
