import { describe, it, expect } from 'vitest'
import { createBattleState } from '../turno/estado'
import { resolverDañoEntrante } from './daño'
import type { PoliticaRedireccion } from '../turno/types'

// ─── Políticas de prueba ──────────────────────────────────────────────────────

const SIEMPRE_LIDER: PoliticaRedireccion = () => ({ destino: 'lider' })

const siempreAliado = (instanceId: string): PoliticaRedireccion =>
  () => ({ destino: 'aliado', instanceId })

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('resolverDañoEntrante — sin política (siempre Líder)', () => {
  it('daño 1 sin escudos → Líder pierde 1 HP', () => {
    const s = createBattleState({ leaderHp: 20, escudos: 0 })
    const s2 = resolverDañoEntrante(s, { cantidad: 1, inabsorbible: false }, SIEMPRE_LIDER, 'esbirro')
    expect(s2.leaderHp).toBe(19)
    expect(s2.escudos).toBe(0)
  })

  it('daño 3 con 2 escudos → escudo absorbe 2, Líder pierde 1', () => {
    const s = createBattleState({ leaderHp: 20, escudos: 2 })
    const s2 = resolverDañoEntrante(s, { cantidad: 3, inabsorbible: false }, SIEMPRE_LIDER, 'esbirro')
    expect(s2.escudos).toBe(0)
    expect(s2.leaderHp).toBe(19)
  })
})

describe('resolverDañoEntrante — inabsorbible', () => {
  it('ignora política "aliado" y escudos: daño directo al Líder', () => {
    const s = createBattleState({
      leaderHp: 20,
      escudos: 5,
      aliados: [{ id: 'a1', hp: 10, maxHp: 10 }],
    })
    const s2 = resolverDañoEntrante(
      s,
      { cantidad: 3, inabsorbible: true },
      siempreAliado('a1'),
      'esbirro',
    )
    expect(s2.leaderHp).toBe(17)     // daño directo a vida
    expect(s2.escudos).toBe(5)        // escudos intactos
    expect(s2.aliados[0]!.hp).toBe(10) // aliado intacto
  })
})

describe('resolverDañoEntrante — política redirige a Aliado', () => {
  it('Aliado pierde vida; Líder no recibe daño', () => {
    const s = createBattleState({
      leaderHp: 20,
      escudos: 0,
      aliados: [{ id: 'a1', hp: 10, maxHp: 10 }],
    })
    const s2 = resolverDañoEntrante(
      s,
      { cantidad: 3, inabsorbible: false },
      siempreAliado('a1'),
      'esbirro',
    )
    expect(s2.aliados[0]!.hp).toBe(7)
    expect(s2.leaderHp).toBe(20)
  })
})

describe('resolverDañoEntrante — Berserker', () => {
  it('Berserker en mesa fuerza la redirección aunque política diga Líder', () => {
    const s = createBattleState({
      leaderHp: 20,
      escudos: 0,
      aliados: [{ id: 'b1', hp: 8, maxHp: 8, keywords: ['Berserker'] }],
    })
    const s2 = resolverDañoEntrante(
      s,
      { cantidad: 2, inabsorbible: false },
      SIEMPRE_LIDER, // política dice Líder, pero Berserker lo ignora
      'esbirro',
    )
    expect(s2.aliados[0]!.hp).toBe(6)
    expect(s2.leaderHp).toBe(20) // Líder intacto
  })
})

describe('resolverDañoEntrante — sin Arrollar, exceso se pierde', () => {
  it('daño 5 sobre Aliado con 3 HP → Aliado a 0, exceso 2 no llega al Líder', () => {
    const s = createBattleState({
      leaderHp: 20,
      aliados: [{ id: 'a1', hp: 3, maxHp: 3 }],
    })
    const s2 = resolverDañoEntrante(
      s,
      { cantidad: 5, inabsorbible: false, tieneArrollar: false },
      siempreAliado('a1'),
      'esbirro',
    )
    expect(s2.aliados[0]!.hp).toBe(0)
    expect(s2.leaderHp).toBe(20) // exceso perdido, Líder intacto
  })
})

describe('resolverDañoEntrante — registro en efectosUltimoTurnoEnemigo', () => {
  it('daño que llega al Líder genera entrada daño-lider en el registro', () => {
    const s = createBattleState({
      leaderHp: 20,
      escudos: 0,
      efectosUltimoTurnoEnemigo: [],
    })
    const s2 = resolverDañoEntrante(
      s,
      { cantidad: 3, inabsorbible: false },
      SIEMPRE_LIDER,
      'esbirro',
    )
    expect(s2.efectosUltimoTurnoEnemigo).toHaveLength(1)
    const entrada = s2.efectosUltimoTurnoEnemigo[0]!
    expect(entrada.tipo).toBe('daño-lider')
    if (entrada.tipo === 'daño-lider') {
      expect(entrada.cantidad).toBe(3)
      expect(entrada.absorbidoPorEscudo).toBe(0)
      expect(entrada.origen).toBe('esbirro')
    }
  })
})
