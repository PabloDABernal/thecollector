import { describe, it, expect } from 'vitest'
import { createBattleState } from '../turno/estado'
import { aplicarEfecto, type ContextoEjecucion } from './ejecutor'
import type { EfectoAtomico } from '../../content/types'
import type { EfectoAplicado, EsbirroEnMesa } from '../turno/types'

// El jugador usa Contratiempo durante su turno (fuente = 'jugador')
const ctxJugador = (valorNucleo: number): ContextoEjecucion => ({
  valorNucleo,
  fuente: 'jugador',
  colorCoste: null,
  keywords: [],
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CANCELAR_SOLO_DAÑO: EfectoAtomico = { tipo: 'cancelar', alcance: 'solo-daño' }
const CANCELAR_CARTA: EfectoAtomico     = { tipo: 'cancelar', alcance: 'carta-dramaturgia-entera' }

function entradaDaño(
  cantidad: number,
  absorbidoPorEscudo = 0,
  origen: EfectoAplicado['origen'] = 'habilidad',
): EfectoAplicado {
  return { tipo: 'daño-lider', cantidad, absorbidoPorEscudo, origen }
}

function esbirroEnMesa(instanceId: string): EsbirroEnMesa {
  return {
    instanceId,
    templateId: 'esbirro-refuerzo',
    nombre: 'Esbirro refuerzo',
    vidaActual: 4,
    ataque: 1,
    keywords: [],
    recienInvocado: false,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("cancelar — alcance 'solo-daño'", () => {
  it('restaura HP y escudo del Líder; la Trama NO cambia', () => {
    const registro: EfectoAplicado[] = [
      { tipo: 'daño-lider', cantidad: 5, absorbidoPorEscudo: 2, origen: 'habilidad' },
      { tipo: 'trama',      cantidad: 3,                        origen: 'habilidad' },
    ]
    const s = createBattleState({
      leaderHp: 10,     // sufrió daño: 10 HP restantes
      escudos:  1,      // le quedaba 1 escudo tras absorber 2
      trama:    3,      // el enemigo subió la Trama en 3
      efectosUltimoTurnoEnemigo: registro,
    })
    const s2 = aplicarEfecto(s, CANCELAR_SOLO_DAÑO, ctxJugador(1))

    expect(s2.leaderHp).toBe(15)   // 10 + 5 HP recuperados
    expect(s2.escudos).toBe(3)     // 1 + 2 escudos restaurados
    expect(s2.trama).toBe(3)       // Trama intacta: no es daño-lider
  })
})

describe("cancelar — alcance 'carta-dramaturgia-entera'", () => {
  it('retira el esbirro invocado por carta; la Trama de habilidad NO cambia', () => {
    const INSTANCE_ID = 'esbirro-0'
    const registro: EfectoAplicado[] = [
      { tipo: 'invocar-esbirro', instanceId: INSTANCE_ID, origen: 'carta-dramaturgia' },
      { tipo: 'trama',           cantidad: 2,             origen: 'habilidad' },
    ]
    const s = createBattleState({
      esbirros: [esbirroEnMesa(INSTANCE_ID)],
      trama:    2,
      efectosUltimoTurnoEnemigo: registro,
    })
    const s2 = aplicarEfecto(s, CANCELAR_CARTA, ctxJugador(1))

    expect(s2.esbirros).toHaveLength(0)  // esbirro retirado
    expect(s2.trama).toBe(2)             // Trama de 'habilidad': no afectada
  })
})

describe('cancelar — doble cancelación (limpieza de registro)', () => {
  it('segunda aplicación no restaura HP (entradas ya limpias tras la primera)', () => {
    const registro: EfectoAplicado[] = [
      { tipo: 'daño-lider', cantidad: 5, absorbidoPorEscudo: 0, origen: 'habilidad' },
    ]
    const s = createBattleState({
      leaderHp: 10,
      leaderMaxHp: 20,
      efectosUltimoTurnoEnemigo: registro,
    })
    const s1 = aplicarEfecto(s,  CANCELAR_SOLO_DAÑO, ctxJugador(1))  // primera: restaura 5
    const s2 = aplicarEfecto(s1, CANCELAR_SOLO_DAÑO, ctxJugador(1))  // segunda: no hace nada

    expect(s1.leaderHp).toBe(15)  // primera ok
    expect(s2.leaderHp).toBe(15)  // segunda: sin cambio (registro limpio)
    expect(s2.efectosUltimoTurnoEnemigo).toHaveLength(0)
  })
})

describe('cancelar — el pool de Núcleos no se toca', () => {
  it('el pool es idéntico antes y después', () => {
    const registro: EfectoAplicado[] = [
      { tipo: 'daño-lider', cantidad: 3, absorbidoPorEscudo: 0, origen: 'habilidad' },
    ]
    const s = createBattleState({
      leaderHp: 15,
      pool: { rojo: 4, azul: 2, verde: 3 },
      efectosUltimoTurnoEnemigo: registro,
    })
    const s2 = aplicarEfecto(s, CANCELAR_SOLO_DAÑO, ctxJugador(1))

    expect(s2.pool).toEqual({ rojo: 4, azul: 2, verde: 3 })
  })
})

describe('cancelar — orden inverso de aplicación', () => {
  it('dos entradas daño-lider: recupera el total correcto (10 HP)', () => {
    // Primera entrada: 4 daño; segunda: 6 daño — deben revertirse en orden inverso
    const registro: EfectoAplicado[] = [
      entradaDaño(4),  // ocurrió primero
      entradaDaño(6),  // ocurrió después
    ]
    const s = createBattleState({
      leaderHp: 10,
      leaderMaxHp: 20,
      efectosUltimoTurnoEnemigo: registro,
    })
    const s2 = aplicarEfecto(s, CANCELAR_SOLO_DAÑO, ctxJugador(1))

    expect(s2.leaderHp).toBe(20)   // 10 + 6 + 4 = 20 (cap en leaderMaxHp)
    expect(s2.efectosUltimoTurnoEnemigo).toHaveLength(0)
  })
})

describe('cancelar — registro vacío', () => {
  it('no rompe nada y el estado queda igual', () => {
    const s = createBattleState({
      leaderHp: 18,
      trama:    2,
      efectosUltimoTurnoEnemigo: [],
    })
    const s2 = aplicarEfecto(s, CANCELAR_SOLO_DAÑO, ctxJugador(1))

    expect(s2.leaderHp).toBe(18)
    expect(s2.trama).toBe(2)
    expect(s2.efectosUltimoTurnoEnemigo).toHaveLength(0)
  })
})
