import { describe, it, expect } from 'vitest'
import { createBattleState } from './estado'
import { ejecutarTurnoEnemigo } from './enemigo'
import type { CartaDramaturgia, EfectoAtomico } from '../../content/types'
import type { EsbirroEnMesa } from './types'
import { FASES_VERDUGO } from '../../content/verdugo'
import { ESBIRRO_REFUERZO } from '../../content/esbirros'
import { createRng } from '../rng'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CONFIG_VERDUGO = {
  fases: FASES_VERDUGO,
  idHabilidadPasivaEsbirros: 'verdugo-proclama',
}

function cartaTest(
  icono: 'ataque' | 'trama',
  efectos: EfectoAtomico[] = [],
): CartaDramaturgia {
  return { id: 'test-carta', nombre: 'Test', origen: 'Común', icono, efectos }
}

function mkEsbirro(overrides: Partial<EsbirroEnMesa> = {}): EsbirroEnMesa {
  return {
    instanceId: 'e1',
    templateId: 'esbirro-refuerzo',
    nombre: 'Esbirro refuerzo',
    vidaActual: 4,
    ataque: 1,
    keywords: [],
    recienInvocado: false,
    ...overrides,
  }
}

function mkRng() {
  return createRng(12345)
}

// ─── Spec 09 — criterios de aceptación ───────────────────────────────────────

describe('ejecutarTurnoEnemigo — ⚔️ carta con Núcleo 4', () => {
  it('dispara Ejecución y el esbirro elegible ataca al Líder', () => {
    // Ejecución: CD=2, ⚫4, daño=valorNucleo+2=6 con rojo=4
    const s = createBattleState({
      leaderHp: 20,
      enemyHp: 80,   // fase 1: contiene Ejecución
      escudos: 0,
      dramaturgia: [cartaTest('ataque')],
      pool: { rojo: 4 },   // player color valor 4 → denegación + Ejecución elegible
      esbirros: [mkEsbirro()],
      cooldownsEnemigo: {},
    })
    const s2 = ejecutarTurnoEnemigo(s, mkRng(), CONFIG_VERDUGO)

    // Ejecución (rojo=4): 4+2=6; esbirro ataque=1; total=7
    expect(s2.leaderHp).toBe(20 - 6 - 1)
    expect(s2.fase).toBe('jugador')
  })
})

describe('ejecutarTurnoEnemigo — 📜 Proclama + pasiva Verdugo', () => {
  it('Proclama desbloqueada con 2 esbirros: Trama sube 3+2=5', () => {
    const s = createBattleState({
      trama: 0,
      enemyHp: 80,
      dramaturgia: [cartaTest('trama')],
      pool: { verde: 2 },   // pagable para Proclama (valorMinimo=1)
      esbirros: [
        mkEsbirro({ instanceId: 'e1' }),
        mkEsbirro({ instanceId: 'e2' }),
      ],
      cooldownsEnemigo: {},  // Proclama CD=0
    })
    const s2 = ejecutarTurnoEnemigo(s, mkRng(), CONFIG_VERDUGO)

    // Proclama base: +3 Trama; pasiva Verdugo: +1 por esbirro → +2; total: 5
    expect(s2.trama).toBe(5)
  })
})

describe('ejecutarTurnoEnemigo — buffAtaqueTemporal', () => {
  it('con buff +1 activo, el ataque del enemigo hace 1 daño adicional', () => {
    // Tajo (básica) con verde=2 → daño=2; buff=1 → total=3
    const s = createBattleState({
      leaderHp: 20,
      enemyHp: 80,
      escudos: 0,
      dramaturgia: [cartaTest('ataque')],
      pool: { verde: 2 },   // verde < 4 → no Ejecución → Tajo (básica)
      buffAtaqueTemporal: 1,
      esbirros: [],
      cooldownsEnemigo: {},
    })
    const s2 = ejecutarTurnoEnemigo(s, mkRng(), CONFIG_VERDUGO)

    // Tajo verde=2: daño=2; buff +1: daño extra=1; sin esbirros
    expect(s2.leaderHp).toBe(20 - 2 - 1)
  })
})

describe('ejecutarTurnoEnemigo — esbirros y recienInvocado', () => {
  it('esbirro invocado en ESTE turno (por carta) no actúa este turno', () => {
    // Carta que invoca un esbirro en el paso 3
    const cartaInvocar = cartaTest('ataque', [{ tipo: 'invocar', esbirro: ESBIRRO_REFUERZO }])
    const s = createBattleState({
      leaderHp: 20,
      enemyHp: 80,
      escudos: 0,
      dramaturgia: [cartaInvocar],
      pool: { verde: 2 },   // Tajo fires
      esbirros: [],
      cooldownsEnemigo: {},
    })
    const s2 = ejecutarTurnoEnemigo(s, mkRng(), CONFIG_VERDUGO)

    // Solo Tajo (daño=2); esbirro invocado en paso 3 no actúa
    expect(s2.leaderHp).toBe(20 - 2)
    expect(s2.esbirros).toHaveLength(1)
    expect(s2.esbirros[0]!.recienInvocado).toBe(true)
  })

  it('esbirro invocado el turno ANTERIOR sí actúa (recienInvocado apagado en paso 1)', () => {
    // Esbirro marcado como recienInvocado=true (viene del turno anterior)
    // Pool vacío → habilidad no puede pagarse → solo el esbirro daña
    const s = createBattleState({
      leaderHp: 20,
      enemyHp: 80,
      escudos: 0,
      dramaturgia: [cartaTest('ataque')],
      pool: {},   // vacío → elegirNucleo=null → sin habilidad
      esbirros: [mkEsbirro({ recienInvocado: true })],
      cooldownsEnemigo: {},
    })
    const s2 = ejecutarTurnoEnemigo(s, mkRng(), CONFIG_VERDUGO)

    // Paso 1: recienInvocado → false; paso 5: esbirro ataca con ataque=1
    expect(s2.leaderHp).toBe(20 - 1)
    expect(s2.esbirros[0]!.recienInvocado).toBe(false)
  })
})

describe('ejecutarTurnoEnemigo — cooldowns', () => {
  it('los cooldowns del enemigo bajan 1 al inicio del turno', () => {
    const s = createBattleState({
      enemyHp: 80,
      dramaturgia: [cartaTest('ataque')],
      pool: { verde: 2 },
      cooldownsEnemigo: {
        'verdugo-ejecucion': 2,
        'verdugo-proclama': 3,
      },
    })
    const s2 = ejecutarTurnoEnemigo(s, mkRng(), CONFIG_VERDUGO)

    // Paso 1 baja 1 antes de cualquier otra cosa
    expect(s2.cooldownsEnemigo['verdugo-ejecucion']).toBe(1)
    expect(s2.cooldownsEnemigo['verdugo-proclama']).toBe(2)
  })

  it('cooldown en 0 no baja a negativo', () => {
    const s = createBattleState({
      enemyHp: 80,
      dramaturgia: [cartaTest('ataque')],
      pool: { verde: 2 },
      cooldownsEnemigo: { 'verdugo-ejecucion': 0 },
    })
    const s2 = ejecutarTurnoEnemigo(s, mkRng(), CONFIG_VERDUGO)

    expect(s2.cooldownsEnemigo['verdugo-ejecucion']).toBe(0)
  })

  it('cooldown en 1 llega a 0 y habilidad queda disponible el mismo turno', () => {
    // Con ejecucion=1 y rojo=4: paso 1 → ejecucion=0; paso 4 → Ejecución fires
    const s = createBattleState({
      leaderHp: 20,
      enemyHp: 80,
      escudos: 0,
      dramaturgia: [cartaTest('ataque')],
      pool: { rojo: 4 },
      esbirros: [],
      cooldownsEnemigo: { 'verdugo-ejecucion': 1 },
    })
    const s2 = ejecutarTurnoEnemigo(s, mkRng(), CONFIG_VERDUGO)

    // Ejecución disparada: daño = rojo(4)+2 = 6
    expect(s2.leaderHp).toBe(20 - 6)
  })
})

describe('ejecutarTurnoEnemigo — turno pasa al jugador', () => {
  it('al finalizar el turno del enemigo, fase = "jugador"', () => {
    const s = createBattleState({
      enemyHp: 80,
      dramaturgia: [cartaTest('ataque')],
      pool: { verde: 1 },
      fase: 'enemigo',
    })
    const s2 = ejecutarTurnoEnemigo(s, mkRng(), CONFIG_VERDUGO)
    expect(s2.fase).toBe('jugador')
  })
})
