import { describe, it, expect } from 'vitest'
import { createBattleState } from '../turno/estado'
import { MANO_MAX, ENERGIA_MAX } from '../turno/types'
import { decidirEleccionInicio, politicaRedireccionLider } from './ia'
import type { Carta } from '../../content/types'

// ─── Helper: carta mínima para tests ─────────────────────────────────────────

function cartaConCosteEnergia(costeEnergia: number): Carta {
  return {
    id: `carta-coste-${costeEnergia}`,
    nombre: `Carta E${costeEnergia}`,
    efectos: [],
    coste: { cd: 1, color: null, valorMinimo: 1, energia: costeEnergia },
    keywords: [],
  }
}

// ─── Pieza A: decidirEleccionInicio ──────────────────────────────────────────

describe('decidirEleccionInicio — paso 2 (carta impagable)', () => {
  it('carta de coste 3 con energía 2 → generar-energia', () => {
    const s = createBattleState({ energia: 2 })
    const resultado = decidirEleccionInicio(s, [cartaConCosteEnergia(3)])
    expect(resultado).toBe('generar-energia')
  })

  it('carta de coste 2 con energía 3 (pagable) → canalizar', () => {
    const s = createBattleState({ energia: 3 })
    const resultado = decidirEleccionInicio(s, [cartaConCosteEnergia(2)])
    expect(resultado).toBe('canalizar')
  })

  it('sin cartas en mano → canalizar', () => {
    const s = createBattleState({ energia: 2 })
    const resultado = decidirEleccionInicio(s, [])
    expect(resultado).toBe('canalizar')
  })
})

describe('decidirEleccionInicio — paso 1 (auto-regla forzada)', () => {
  it('mano llena (10) → forzado generar-energia', () => {
    const s = createBattleState({ mano: MANO_MAX, energia: 2 })
    // Aunque haya carta impagable, la auto-regla tiene prioridad
    const resultado = decidirEleccionInicio(s, [cartaConCosteEnergia(5)])
    expect(resultado).toBe('generar-energia')
  })

  it('energía llena (5) → forzado canalizar', () => {
    const s = createBattleState({ energia: ENERGIA_MAX, mano: 3 })
    const resultado = decidirEleccionInicio(s, [cartaConCosteEnergia(6)])
    expect(resultado).toBe('canalizar')
  })
})

// ─── Pieza C: politicaRedireccionLider ───────────────────────────────────────

describe('politicaRedireccionLider — inabsorbible', () => {
  it('daño inabsorbible → siempre lider', () => {
    const s = createBattleState({
      leaderHp: 5,
      leaderMaxHp: 20,
      aliados: [{ id: 'a1', hp: 10, maxHp: 10 }],
    })
    const resultado = politicaRedireccionLider(s, { cantidad: 3, inabsorbible: true })
    expect(resultado).toEqual({ destino: 'lider' })
  })
})

describe('politicaRedireccionLider — Líder sano, no redirige', () => {
  it('golpe pequeño sobre Líder sano → lider (no desperdicia aliado)', () => {
    // leaderMaxHp=20 → umbral=floor(20/3)=6; leaderHp=20; daño=1 → después=19 > 6
    const s = createBattleState({
      leaderHp: 20,
      leaderMaxHp: 20,
      aliados: [{ id: 'a1', hp: 10, maxHp: 10 }],
    })
    const resultado = politicaRedireccionLider(s, { cantidad: 1, inabsorbible: false })
    expect(resultado).toEqual({ destino: 'lider' })
  })
})

describe('politicaRedireccionLider — Líder en peligro, redirige a Aliado', () => {
  it('golpe lleva al Líder bajo umbral y hay aliado disponible → aliado', () => {
    // umbral = floor(20/3) = 6; leaderHp=7; daño=3 → después=4 < 6
    const s = createBattleState({
      leaderHp: 7,
      leaderMaxHp: 20,
      aliados: [{ id: 'a1', hp: 5, maxHp: 10 }],
    })
    const resultado = politicaRedireccionLider(s, { cantidad: 3, inabsorbible: false })
    expect(resultado).toEqual({ destino: 'aliado', instanceId: 'a1' })
  })

  it('si ningún aliado puede absorber el golpe, el Líder aguanta', () => {
    // umbral=6; leaderHp=7; daño=3 → después=4 < 6; pero aliado solo tiene hp=2 < 3
    const s = createBattleState({
      leaderHp: 7,
      leaderMaxHp: 20,
      aliados: [{ id: 'a1', hp: 2, maxHp: 10 }],
    })
    const resultado = politicaRedireccionLider(s, { cantidad: 3, inabsorbible: false })
    expect(resultado).toEqual({ destino: 'lider' })
  })

  it('elige el aliado con menos vida que aún puede absorber', () => {
    // Dos aliados: gordo (hp=8) y justo (hp=4), daño=3
    // Ambos pueden absorber (hp≥3); elige el de menor vida: hp=4
    const s = createBattleState({
      leaderHp: 5,
      leaderMaxHp: 20,
      aliados: [
        { id: 'gordo', hp: 8, maxHp: 10 },
        { id: 'justo', hp: 4, maxHp: 10 },
      ],
    })
    const resultado = politicaRedireccionLider(s, { cantidad: 3, inabsorbible: false })
    expect(resultado).toEqual({ destino: 'aliado', instanceId: 'justo' })
  })
})
