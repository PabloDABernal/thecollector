import { describe, it, expect } from 'vitest'
import { createBattleState } from '../turno/estado'
import { iniciarTurnoJugador } from '../turno/inicio-turno'
import { aplicarEfecto } from './ejecutor'
import type { EfectoAtomico } from '../../content/types'
import type { ContextoEjecucion } from './ejecutor'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ctx(fuente: 'jugador' | 'enemigo' = 'enemigo'): ContextoEjecucion {
  return { valorNucleo: 1, fuente, colorCoste: null, keywords: [] }
}

function efecto(e: EfectoAtomico) { return e }

// ─── dañoFijo ─────────────────────────────────────────────────────────────────

describe('dañoFijo', () => {
  it('inabsorbible=true: vida −3, escudo intacto', () => {
    const s = createBattleState({ leaderHp: 20, escudos: 2 })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'dañoFijo', valor: 3, inabsorbible: true }), ctx('enemigo'))
    expect(s2.leaderHp).toBe(17)
    expect(s2.escudos).toBe(2)
  })

  it('absorbible: 2 daño con 2 escudos → escudo 0, vida intacta', () => {
    const s = createBattleState({ leaderHp: 20, escudos: 2 })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'dañoFijo', valor: 2 }), ctx('enemigo'))
    expect(s2.leaderHp).toBe(20)
    expect(s2.escudos).toBe(0)
  })

  it('absorbible: exceso daña vida si supera escudo', () => {
    const s = createBattleState({ leaderHp: 20, escudos: 1 })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'dañoFijo', valor: 4 }), ctx('enemigo'))
    expect(s2.leaderHp).toBe(17)
    expect(s2.escudos).toBe(0)
  })

  it('fuente jugador: daña al enemigo (no al Líder)', () => {
    const s = createBattleState({ enemyHp: 20 })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'dañoFijo', valor: 5 }), ctx('jugador'))
    expect(s2.enemyHp).toBe(15)
    expect(s2.leaderHp).toBe(s.leaderHp)
  })
})

// ─── curar generalizado ───────────────────────────────────────────────────────

describe('curar (generalizado)', () => {
  it('fuente jugador: cura al Líder', () => {
    const s = createBattleState({ leaderHp: 15, leaderMaxHp: 20 })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'curar', valor: 3 }), ctx('jugador'))
    expect(s2.leaderHp).toBe(18)
  })

  it('fuente enemigo: cura al Enemigo', () => {
    const s = createBattleState({ enemyHp: 77, enemyMaxHp: 80 })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'curar', valor: 3 }), ctx('enemigo'))
    expect(s2.enemyHp).toBe(80)
  })

  it('enemigo no pasa del máximo', () => {
    const s = createBattleState({ enemyHp: 79, enemyMaxHp: 80 })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'curar', valor: 5 }), ctx('enemigo'))
    expect(s2.enemyHp).toBe(80)
  })
})

// ─── defensa / escudo del enemigo ────────────────────────────────────────────

describe('defensa — escudo del enemigo', () => {
  it('fuente enemigo: añade escudo al Enemigo', () => {
    const s = createBattleState({ escudosEnemigo: 0 })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'defensa', valor: 2 }), ctx('enemigo'))
    expect(s2.escudosEnemigo).toBe(2)
  })

  it('fuente jugador: añade escudo al Líder (tope 5)', () => {
    const s = createBattleState({ escudos: 4 })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'defensa', valor: 3 }), ctx('jugador'))
    expect(s2.escudos).toBe(5)
  })

  it('enemigo sin tope: puede acumular más de 5', () => {
    const s = createBattleState({ escudosEnemigo: 4 })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'defensa', valor: 3 }), ctx('enemigo'))
    expect(s2.escudosEnemigo).toBe(7)
  })

  it('ataque 5 al enemigo con 2 de escudo → escudo 0, vida −3', () => {
    const s = createBattleState({ enemyHp: 20, escudosEnemigo: 2 })
    // Ataque del jugador (fuente jugador)
    const s2 = aplicarEfecto(
      s,
      efecto({ tipo: 'dañoFijo', valor: 5 }),
      ctx('jugador'),
    )
    expect(s2.escudosEnemigo).toBe(0)
    expect(s2.enemyHp).toBe(17)
  })

  it('daño exactamente igual al escudo: vida intacta', () => {
    const s = createBattleState({ enemyHp: 20, escudosEnemigo: 3 })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'dañoFijo', valor: 3 }), ctx('jugador'))
    expect(s2.escudosEnemigo).toBe(0)
    expect(s2.enemyHp).toBe(20)
  })
})

// ─── descartar ────────────────────────────────────────────────────────────────

describe('descartar', () => {
  it('reduce la mano en 1', () => {
    const s = createBattleState({ mano: 5 })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'descartar', cantidad: 1 }), ctx())
    expect(s2.mano).toBe(4)
  })

  it('mano no baja de 0 (clamp)', () => {
    const s = createBattleState({ mano: 0 })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'descartar', cantidad: 3 }), ctx())
    expect(s2.mano).toBe(0)
  })

  it('descarta más de lo que hay: clamp a 0', () => {
    const s = createBattleState({ mano: 2 })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'descartar', cantidad: 5 }), ctx())
    expect(s2.mano).toBe(0)
  })
})

// ─── buffAtaqueTemporal ───────────────────────────────────────────────────────

describe('buffAtaqueTemporal', () => {
  it('fija el estado con el valor del buff', () => {
    const s = createBattleState()
    const s2 = aplicarEfecto(s, efecto({ tipo: 'buffAtaqueTemporal', valor: 1 }), ctx('enemigo'))
    expect(s2.buffAtaqueTemporal).toBe(1)
  })

  it('acumula si se aplica varias veces', () => {
    const s = createBattleState()
    const s1 = aplicarEfecto(s, efecto({ tipo: 'buffAtaqueTemporal', valor: 1 }), ctx('enemigo'))
    const s2 = aplicarEfecto(s1, efecto({ tipo: 'buffAtaqueTemporal', valor: 2 }), ctx('enemigo'))
    expect(s2.buffAtaqueTemporal).toBe(3)
  })

  it('se limpia a 0 al inicio del turno del jugador', () => {
    const s = createBattleState({ buffAtaqueTemporal: 2 })
    const s2 = iniciarTurnoJugador(s, 'canalizar')
    expect(s2.buffAtaqueTemporal).toBe(0)
  })
})

// ─── siguienteDañoInabsorbible ────────────────────────────────────────────────

describe('siguienteDañoInabsorbible', () => {
  it('el efecto activa el flag', () => {
    const s = createBattleState()
    const s2 = aplicarEfecto(s, efecto({ tipo: 'siguienteDañoInabsorbible' }), ctx('enemigo'))
    expect(s2.siguienteDañoInabsorbible).toBe(true)
  })

  it('con flag activo: daño ignora escudo y consume el flag', () => {
    const s = createBattleState({ leaderHp: 20, escudos: 3, siguienteDañoInabsorbible: true })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'dañoFijo', valor: 4 }), ctx('enemigo'))
    expect(s2.leaderHp).toBe(16)   // ignoró los 3 escudos
    expect(s2.escudos).toBe(3)     // escudo intacto
    expect(s2.siguienteDañoInabsorbible).toBe(false)  // consumido
  })

  it('daño siguiente (sin flag) vuelve a ser normal', () => {
    const s = createBattleState({ leaderHp: 20, escudos: 3, siguienteDañoInabsorbible: true })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'dañoFijo', valor: 4 }), ctx('enemigo'))
    // segundo daño: ya no hay flag, escudo absorbe
    const s3 = aplicarEfecto(s2, efecto({ tipo: 'dañoFijo', valor: 2 }), ctx('enemigo'))
    expect(s3.escudos).toBe(1)     // 3−2 = 1
    expect(s3.leaderHp).toBe(16)   // sin cambio en vida
  })

  it('flag activo: ignora también a los Aliados (aplica primero el flag)', () => {
    const s = createBattleState({
      leaderHp: 20,
      siguienteDañoInabsorbible: true,
      aliados: [{ id: 'a1', hp: 10, maxHp: 10 }],
    })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'dañoFijo', valor: 5 }), ctx('enemigo'))
    expect(s2.leaderHp).toBe(15)   // daño fue directo al Líder
    expect(s2.aliados[0]!.hp).toBe(10)  // Aliado intacto
    expect(s2.siguienteDañoInabsorbible).toBe(false)
  })
})

// ─── dañoATodosAliados ────────────────────────────────────────────────────────

describe('dañoATodosAliados', () => {
  it('con lista vacía: no pasa nada', () => {
    const s = createBattleState({ aliados: [] })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'dañoATodosAliados', valor: 2 }), ctx('enemigo'))
    expect(s2).toBe(s)  // misma referencia: sin cambios
  })

  it('con 2 aliados: cada uno recibe −2', () => {
    const s = createBattleState({
      aliados: [
        { id: 'a1', hp: 5, maxHp: 8 },
        { id: 'a2', hp: 3, maxHp: 6 },
      ],
    })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'dañoATodosAliados', valor: 2 }), ctx('enemigo'))
    expect(s2.aliados[0]!.hp).toBe(3)
    expect(s2.aliados[1]!.hp).toBe(1)
  })

  it('aliado con menos HP que el daño: clamp a 0', () => {
    const s = createBattleState({
      aliados: [{ id: 'a1', hp: 1, maxHp: 6 }],
    })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'dañoATodosAliados', valor: 5 }), ctx('enemigo'))
    expect(s2.aliados[0]!.hp).toBe(0)
  })

  it('el Líder y el pool no cambian', () => {
    const s = createBattleState({
      leaderHp: 20,
      aliados: [{ id: 'a1', hp: 5, maxHp: 5 }],
    })
    const s2 = aplicarEfecto(s, efecto({ tipo: 'dañoATodosAliados', valor: 2 }), ctx('enemigo'))
    expect(s2.leaderHp).toBe(20)
  })
})
