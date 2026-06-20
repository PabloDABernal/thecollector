import type { BattleState } from './types'
import { ENERGIA_INICIAL, ACCIONES_POR_TURNO } from './types'

/** Devuelve un BattleState inicial para tests o nueva partida. */
export function createBattleState(overrides?: Partial<BattleState>): BattleState {
  return {
    leaderHp: 20,
    leaderMaxHp: 20,
    enemyHp: 20,
    enemyMaxHp: 20,
    escudos: 0,
    aliados: [],
    energia: ENERGIA_INICIAL,
    mano: 0,
    pool: {},
    turno: 1,
    fase: 'jugador',
    accionesRestantes: ACCIONES_POR_TURNO,
    comboActivo: false,
    trama: 0,
    dramaturgia: [],
    cooldowns: {},
    ...overrides,
  }
}
