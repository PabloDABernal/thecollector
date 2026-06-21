import { describe, it, expect } from 'vitest'
import { createBattleState } from '../turno/estado'
import { aplicarEfecto, aplicarEfectoConCaos, type ContextoEjecucion } from './ejecutor'
import { aplicarDañoALider } from './daño'
import type { EfectoAtomico } from '../../content/types'

// ── Contexto base (jugador, ⚫, sin keywords) ─────────────────────────────────
const ctxJugador = (valorNucleo: number): ContextoEjecucion => ({
  valorNucleo,
  fuente: 'jugador',
  colorCoste: null,
  keywords: [],
})

const ctxEnemigo = (valorNucleo: number): ContextoEjecucion => ({
  valorNucleo,
  fuente: 'enemigo',
  colorCoste: null,
  keywords: [],
})

// ─── Ataque — fórmulas ───────────────────────────────────────────────────────

describe('Ataque — fórmulas', () => {
  it('{nucleo} con Núcleo 3 → 3 de daño al rival', () => {
    const s = createBattleState({ enemyHp: 20 })
    const efecto: EfectoAtomico = { tipo: 'ataque', formula: { tipo: 'nucleo' } }
    const s2 = aplicarEfecto(s, efecto, ctxJugador(3))
    expect(s2.enemyHp).toBe(17)
  })

  it('{suma 3} con Núcleo 2 → 5 de daño', () => {
    const s = createBattleState({ enemyHp: 20 })
    const efecto: EfectoAtomico = { tipo: 'ataque', formula: { tipo: 'suma', x: 3 } }
    const s2 = aplicarEfecto(s, efecto, ctxJugador(2))
    expect(s2.enemyHp).toBe(15)
  })

  it('{multiplica 2} con Núcleo 4 → 8 de daño', () => {
    const s = createBattleState({ enemyHp: 20 })
    const efecto: EfectoAtomico = { tipo: 'ataque', formula: { tipo: 'multiplica', x: 2 } }
    const s2 = aplicarEfecto(s, efecto, ctxJugador(4))
    expect(s2.enemyHp).toBe(12)
  })

  // El umbral ya NO vive en el efecto de Ataque: vive en Habilidad.efectosUmbral.
  // Los tests de umbral están en engine/habilidades/activacion.test.ts (spec 04).
  it('ejecutor aplica solo la formula recibida, sin decidir umbral', () => {
    const s = createBattleState({ enemyHp: 20 })
    // El ejecutor siempre usa la fórmula que le dan; la activación elige cuál.
    const efectoSuma: EfectoAtomico = { tipo: 'ataque', formula: { tipo: 'suma', x: 3 } }
    const efectoMult: EfectoAtomico = { tipo: 'ataque', formula: { tipo: 'multiplica', x: 2 } }
    const s1 = aplicarEfecto(s, efectoSuma, ctxJugador(4)) // 4+3=7
    expect(s1.enemyHp).toBe(13)
    const s2 = aplicarEfecto(s, efectoMult, ctxJugador(4)) // 4*2=8
    expect(s2.enemyHp).toBe(12)
  })
})

// ─── Regla de Caos (🟣) ──────────────────────────────────────────────────────

describe('Caos — auto-daño al Líder', () => {
  it('habilidad 🟣 con Núcleo 4: aplica efecto Y resta 4 al Líder', () => {
    const s = createBattleState({ leaderHp: 20, enemyHp: 20 })
    const efecto: EfectoAtomico = { tipo: 'ataque', formula: { tipo: 'nucleo' } }
    const ctxCaos: ContextoEjecucion = {
      valorNucleo: 4,
      fuente: 'jugador',
      colorCoste: ['morado'],
      keywords: [],
    }
    const s2 = aplicarEfectoConCaos(s, efecto, ctxCaos)
    expect(s2.enemyHp).toBe(16)   // efecto principal: 4 de daño al enemigo
    expect(s2.leaderHp).toBe(16)  // auto-daño Caos: 4 al Líder
  })

  it('coste multi-color que incluye morado NO activa Caos', () => {
    const s = createBattleState({ leaderHp: 20 })
    const efecto: EfectoAtomico = { tipo: 'ataque', formula: { tipo: 'nucleo' } }
    const ctxMulti: ContextoEjecucion = {
      valorNucleo: 3,
      fuente: 'jugador',
      colorCoste: ['morado', 'rojo'],
      keywords: [],
    }
    const s2 = aplicarEfectoConCaos(s, efecto, ctxMulti)
    expect(s2.leaderHp).toBe(20) // sin auto-daño
  })

  it('coste ⚫ (null) no activa Caos', () => {
    const s = createBattleState({ leaderHp: 20 })
    const efecto: EfectoAtomico = { tipo: 'ataque', formula: { tipo: 'nucleo' } }
    const s2 = aplicarEfectoConCaos(s, efecto, ctxJugador(3))
    expect(s2.leaderHp).toBe(20)
  })
})

// ─── Defensa ─────────────────────────────────────────────────────────────────

describe('Defensa — escudos', () => {
  it('{3} sobre Líder con 4 escudos → queda en 5 (tope)', () => {
    const s = createBattleState({ escudos: 4 })
    const efecto: EfectoAtomico = { tipo: 'defensa', valor: 3 }
    const s2 = aplicarEfecto(s, efecto, ctxJugador(1))
    expect(s2.escudos).toBe(5)
  })

  it('{2} sobre Líder con 0 escudos → 2 escudos', () => {
    const s = createBattleState({ escudos: 0 })
    const efecto: EfectoAtomico = { tipo: 'defensa', valor: 2 }
    const s2 = aplicarEfecto(s, efecto, ctxJugador(1))
    expect(s2.escudos).toBe(2)
  })
})

// ─── Curar ───────────────────────────────────────────────────────────────────

describe('Curar', () => {
  it('no supera la vida máxima', () => {
    const s = createBattleState({ leaderHp: 18, leaderMaxHp: 20 })
    const efecto: EfectoAtomico = { tipo: 'curar', valor: 5 }
    const s2 = aplicarEfecto(s, efecto, ctxJugador(1))
    expect(s2.leaderHp).toBe(20)
  })

  it('cura normal dentro del tope', () => {
    const s = createBattleState({ leaderHp: 10, leaderMaxHp: 20 })
    const efecto: EfectoAtomico = { tipo: 'curar', valor: 4 }
    const s2 = aplicarEfecto(s, efecto, ctxJugador(1))
    expect(s2.leaderHp).toBe(14)
  })
})

// ─── Absorción por escudos ───────────────────────────────────────────────────

describe('Daño al Líder — absorción por escudos', () => {
  it('daño 5 con 2 escudos → escudo a 0, vida −3', () => {
    const s = createBattleState({ leaderHp: 20, escudos: 2 })
    const s2 = aplicarDañoALider(s, 5)
    expect(s2.escudos).toBe(0)
    expect(s2.leaderHp).toBe(17)
  })

  it('daño menor que escudos → solo reduce escudos', () => {
    const s = createBattleState({ leaderHp: 20, escudos: 5 })
    const s2 = aplicarDañoALider(s, 3)
    expect(s2.escudos).toBe(2)
    expect(s2.leaderHp).toBe(20)
  })

  it('daño 0 no altera nada', () => {
    const s = createBattleState({ leaderHp: 20, escudos: 3 })
    const s2 = aplicarDañoALider(s, 0)
    expect(s2.escudos).toBe(3)
    expect(s2.leaderHp).toBe(20)
  })
})

// ─── Bloqueo por Aliado ───────────────────────────────────────────────────────

describe('Daño al Líder — bloqueo por Aliado', () => {
  const estadoConAliado = createBattleState({
    leaderHp: 20,
    escudos: 0,
    aliados: [{ id: 'a1', hp: 3, maxHp: 5 }],
  })

  it('sin Arrollar: Aliado a 0, Líder intacto', () => {
    const s2 = aplicarDañoALider(estadoConAliado, 5, {
      idAliado: 'a1',
      tieneArrollar: false,
    })
    expect(s2.aliados[0]!.hp).toBe(0)
    expect(s2.leaderHp).toBe(20)
  })

  it('con Arrollar: Aliado a 0, exceso 2 pasa al Líder', () => {
    const s2 = aplicarDañoALider(estadoConAliado, 5, {
      idAliado: 'a1',
      tieneArrollar: true,
    })
    expect(s2.aliados[0]!.hp).toBe(0)
    expect(s2.leaderHp).toBe(18)
  })

  it('Aliado absorbe daño menor sin exceso', () => {
    const s2 = aplicarDañoALider(estadoConAliado, 2, { idAliado: 'a1' })
    expect(s2.aliados[0]!.hp).toBe(1)
    expect(s2.leaderHp).toBe(20)
  })
})

// ─── Daño inabsorbible ───────────────────────────────────────────────────────

describe('Daño inabsorbible', () => {
  it('ignora escudos y va directo a la vida', () => {
    const s = createBattleState({ leaderHp: 20, escudos: 5 })
    const s2 = aplicarDañoALider(s, 4, { inabsorbible: true })
    expect(s2.escudos).toBe(5)   // intactos
    expect(s2.leaderHp).toBe(16)
  })

  it('ignora Aliados presentes', () => {
    const s = createBattleState({
      leaderHp: 20,
      aliados: [{ id: 'a1', hp: 10, maxHp: 10 }],
    })
    const s2 = aplicarDañoALider(s, 5, {
      inabsorbible: true,
      idAliado: 'a1',
    })
    expect(s2.aliados[0]!.hp).toBe(10) // aliado intacto
    expect(s2.leaderHp).toBe(15)
  })
})

// ─── Trama ───────────────────────────────────────────────────────────────────

describe('Trama', () => {
  it('fuente jugador: resta trama', () => {
    const s = createBattleState({ trama: 5 })
    const efecto: EfectoAtomico = { tipo: 'trama', valor: 2 }
    const s2 = aplicarEfecto(s, efecto, ctxJugador(1))
    expect(s2.trama).toBe(3)
  })

  it('fuente enemigo: suma trama', () => {
    const s = createBattleState({ trama: 3 })
    const efecto: EfectoAtomico = { tipo: 'trama', valor: 2 }
    const s2 = aplicarEfecto(s, efecto, ctxEnemigo(1))
    expect(s2.trama).toBe(5)
  })

  it('clamp a 0: resta no produce negativo', () => {
    const s = createBattleState({ trama: 1 })
    const efecto: EfectoAtomico = { tipo: 'trama', valor: 3 }
    const s2 = aplicarEfecto(s, efecto, ctxJugador(1))
    expect(s2.trama).toBe(0)
  })
})

// ─── Energía ─────────────────────────────────────────────────────────────────

describe('Energía — clamp 0-5', () => {
  it('+3 desde 4 → queda en 5', () => {
    const s = createBattleState({ energia: 4 })
    const efecto: EfectoAtomico = { tipo: 'energia', valor: 3 }
    const s2 = aplicarEfecto(s, efecto, ctxJugador(1))
    expect(s2.energia).toBe(5)
  })

  it('-3 desde 1 → queda en 0', () => {
    const s = createBattleState({ energia: 1 })
    const efecto: EfectoAtomico = { tipo: 'energia', valor: -3 }
    const s2 = aplicarEfecto(s, efecto, ctxJugador(1))
    expect(s2.energia).toBe(0)
  })
})

// ─── Robar ───────────────────────────────────────────────────────────────────

describe('Robar', () => {
  it('roba cartas hasta el tope de 10', () => {
    const s = createBattleState({ mano: 8 })
    const efecto: EfectoAtomico = { tipo: 'robar', cantidad: 4 }
    const s2 = aplicarEfecto(s, efecto, ctxJugador(1))
    expect(s2.mano).toBe(10)
  })

  it('roba cantidad normal', () => {
    const s = createBattleState({ mano: 3 })
    const efecto: EfectoAtomico = { tipo: 'robar', cantidad: 2 }
    const s2 = aplicarEfecto(s, efecto, ctxJugador(1))
    expect(s2.mano).toBe(5)
  })
})

// ─── Efectos pendientes — error claro ────────────────────────────────────────

describe('efectos pendientes (stub)', () => {
  it('cancelar con registro vacío devuelve el mismo estado sin lanzar error', () => {
    // Registro vacío → no hay nada que revertir; el estado no cambia
    const s = createBattleState({ efectosUltimoTurnoEnemigo: [] })
    const efecto: EfectoAtomico = { tipo: 'cancelar', alcance: 'solo-daño' }
    const s2 = aplicarEfecto(s, efecto, ctxJugador(1))
    expect(s2.leaderHp).toBe(s.leaderHp)
    expect(s2.efectosUltimoTurnoEnemigo).toHaveLength(0)
  })

  it('invocar: ahora implementado — añade esbirro al estado', () => {
    const s = createBattleState()
    const efecto: EfectoAtomico = {
      tipo: 'invocar',
      esbirro: { id: 'test', nombre: 'Test', vida: 3, ataque: 1, keywords: [] },
    }
    const s2 = aplicarEfecto(s, efecto, ctxJugador(1))
    expect(s2.esbirros).toHaveLength(1)
    expect(s2.esbirros[0]!.vidaActual).toBe(3)
  })

  it('aplicar-estado lanza error', () => {
    const s = createBattleState()
    const efecto: EfectoAtomico = {
      tipo: 'aplicar-estado',
      estado: 'veneno',
      duracion: 2,
    }
    expect(() => aplicarEfecto(s, efecto, ctxJugador(1))).toThrowError(
      /no implementado/,
    )
  })

  it('modificar-dado lanza error', () => {
    const s = createBattleState()
    const efecto: EfectoAtomico = { tipo: 'modificar-dado', datos: {} }
    expect(() => aplicarEfecto(s, efecto, ctxJugador(1))).toThrowError(
      /no implementado/,
    )
  })
})
