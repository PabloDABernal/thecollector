import { describe, it, expect } from 'vitest'
import { createBattleState } from '../engine/turno/estado'
import { aplicarEfecto } from '../engine/efectos/ejecutor'
import { limpiarEsbirrosMuertos } from '../engine/esbirros'
import { ESBIRRO_REFUERZO, ESBIRRO_DEFENSOR } from './esbirros'
import type { EfectoAtomico } from './types'
import type { ContextoEjecucion } from '../engine/efectos/ejecutor'

// ─── Datos de plantillas ──────────────────────────────────────────────────────

describe('ESBIRRO_REFUERZO — datos', () => {
  it('vida 4, ataque 1, sin keywords', () => {
    expect(ESBIRRO_REFUERZO.vida).toBe(4)
    expect(ESBIRRO_REFUERZO.ataque).toBe(1)
    expect(ESBIRRO_REFUERZO.keywords).toHaveLength(0)
  })
})

describe('ESBIRRO_DEFENSOR — datos', () => {
  it('vida 6, ataque 1, keyword Defensor', () => {
    expect(ESBIRRO_DEFENSOR.vida).toBe(6)
    expect(ESBIRRO_DEFENSOR.ataque).toBe(1)
    expect(ESBIRRO_DEFENSOR.keywords).toContain('Defensor')
  })
})

// ─── Helper ───────────────────────────────────────────────────────────────────

const CTX: ContextoEjecucion = {
  valorNucleo: 1,
  fuente: 'enemigo',
  colorCoste: null,
  keywords: [],
}

function invocarEfecto(plantilla: typeof ESBIRRO_REFUERZO): EfectoAtomico {
  return { tipo: 'invocar', esbirro: plantilla }
}

// ─── Efecto invocar ───────────────────────────────────────────────────────────

describe('efecto invocar', () => {
  it('añade un esbirro con la vida/ataque del template', () => {
    const s = createBattleState()
    const s2 = aplicarEfecto(s, invocarEfecto(ESBIRRO_REFUERZO), CTX)
    expect(s2.esbirros).toHaveLength(1)
    expect(s2.esbirros[0]!.vidaActual).toBe(4)
    expect(s2.esbirros[0]!.ataque).toBe(1)
    expect(s2.esbirros[0]!.templateId).toBe('esbirro-refuerzo')
  })

  it('esbirro recién invocado queda marcado como recienInvocado', () => {
    const s = createBattleState()
    const s2 = aplicarEfecto(s, invocarEfecto(ESBIRRO_REFUERZO), CTX)
    expect(s2.esbirros[0]!.recienInvocado).toBe(true)
  })

  it('copia keywords del template (Defensor)', () => {
    const s = createBattleState()
    const s2 = aplicarEfecto(s, invocarEfecto(ESBIRRO_DEFENSOR), CTX)
    expect(s2.esbirros[0]!.keywords).toContain('Defensor')
  })

  it('la invocación de vida diferente usa los stats dados (refuerzo vida 3)', () => {
    // Misma plantilla pero con vida sobrescrita en el efecto
    const efecto: EfectoAtomico = {
      tipo: 'invocar',
      esbirro: { ...ESBIRRO_REFUERZO, vida: 3 },
    }
    const s = createBattleState()
    const s2 = aplicarEfecto(s, efecto, CTX)
    expect(s2.esbirros[0]!.vidaActual).toBe(3)
  })

  it('varias invocaciones acumulan esbirros en mesa', () => {
    const s0 = createBattleState()
    const s1 = aplicarEfecto(s0, invocarEfecto(ESBIRRO_REFUERZO), CTX)
    const s2 = aplicarEfecto(s1, invocarEfecto(ESBIRRO_DEFENSOR), CTX)
    const s3 = aplicarEfecto(s2, invocarEfecto(ESBIRRO_REFUERZO), CTX)
    expect(s3.esbirros).toHaveLength(3)
  })

  it('IDs de instancia son únicos', () => {
    const s0 = createBattleState()
    const s1 = aplicarEfecto(s0, invocarEfecto(ESBIRRO_REFUERZO), CTX)
    const s2 = aplicarEfecto(s1, invocarEfecto(ESBIRRO_REFUERZO), CTX)
    const ids = s2.esbirros.map((e) => e.instanceId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('nextEsbirroId sube con cada invocación', () => {
    const s0 = createBattleState()
    expect(s0.nextEsbirroId).toBe(0)
    const s1 = aplicarEfecto(s0, invocarEfecto(ESBIRRO_REFUERZO), CTX)
    expect(s1.nextEsbirroId).toBe(1)
    const s2 = aplicarEfecto(s1, invocarEfecto(ESBIRRO_REFUERZO), CTX)
    expect(s2.nextEsbirroId).toBe(2)
  })

  it('no modifica el estado original (inmutabilidad)', () => {
    const s = createBattleState()
    aplicarEfecto(s, invocarEfecto(ESBIRRO_REFUERZO), CTX)
    expect(s.esbirros).toHaveLength(0)
  })
})

// ─── limpiarEsbirrosMuertos ───────────────────────────────────────────────────

describe('limpiarEsbirrosMuertos', () => {
  it('esbirro a 0 de vida se elimina de la mesa', () => {
    const s = createBattleState({
      esbirros: [
        {
          instanceId: 'esbirro-0',
          templateId: 'esbirro-refuerzo',
          nombre: 'Esbirro refuerzo',
          vidaActual: 0,
          ataque: 1,
          keywords: [],
          recienInvocado: false,
        },
      ],
    })
    const s2 = limpiarEsbirrosMuertos(s)
    expect(s2.esbirros).toHaveLength(0)
  })

  it('esbirro con vida > 0 no se elimina', () => {
    const s = createBattleState({
      esbirros: [
        {
          instanceId: 'esbirro-0',
          templateId: 'esbirro-refuerzo',
          nombre: 'Esbirro refuerzo',
          vidaActual: 1,
          ataque: 1,
          keywords: [],
          recienInvocado: false,
        },
      ],
    })
    const s2 = limpiarEsbirrosMuertos(s)
    expect(s2.esbirros).toHaveLength(1)
  })

  it('limpia solo los muertos y conserva los vivos', () => {
    const s = createBattleState({
      esbirros: [
        {
          instanceId: 'esbirro-0',
          templateId: 'esbirro-refuerzo',
          nombre: 'Esbirro refuerzo',
          vidaActual: 4,
          ataque: 1,
          keywords: [],
          recienInvocado: false,
        },
        {
          instanceId: 'esbirro-1',
          templateId: 'esbirro-defensor',
          nombre: 'Esbirro Defensor',
          vidaActual: 0,
          ataque: 1,
          keywords: ['Defensor'],
          recienInvocado: false,
        },
        {
          instanceId: 'esbirro-2',
          templateId: 'esbirro-refuerzo',
          nombre: 'Esbirro refuerzo',
          vidaActual: 2,
          ataque: 1,
          keywords: [],
          recienInvocado: false,
        },
      ],
    })
    const s2 = limpiarEsbirrosMuertos(s)
    expect(s2.esbirros).toHaveLength(2)
    expect(s2.esbirros.map((e) => e.instanceId)).toEqual(['esbirro-0', 'esbirro-2'])
  })

  it('sin muertos: devuelve la misma referencia (sin copiar)', () => {
    const s = createBattleState()
    const s2 = limpiarEsbirrosMuertos(s)
    expect(s2).toBe(s)
  })

  it('vida negativa también cuenta como muerto', () => {
    const s = createBattleState({
      esbirros: [
        {
          instanceId: 'esbirro-0',
          templateId: 'esbirro-refuerzo',
          nombre: 'Esbirro refuerzo',
          vidaActual: -1,
          ataque: 1,
          keywords: [],
          recienInvocado: false,
        },
      ],
    })
    const s2 = limpiarEsbirrosMuertos(s)
    expect(s2.esbirros).toHaveLength(0)
  })
})
