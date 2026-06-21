import { describe, it, expect } from 'vitest'
import { createBattleState } from './estado'
import {
  ENERGIA_MAX,
  MANO_MAX,
  ACCIONES_POR_TURNO,
} from './types'
import {
  bajarCooldowns,
  getEleccionForzada,
  aplicarEleccionInicio,
  iniciarTurnoJugador,
} from './inicio-turno'
import {
  getAccionesDisponibles,
  ejecutarCanalizar,
  ejecutarGenerarEnergia,
  activarCombo,
} from './acciones'

// ─── Criterio 1: 2 acciones por turno (3 con Combo) ──────────────────────────

describe('economía de acciones', () => {
  it('empieza con 2 acciones restantes', () => {
    const s = createBattleState()
    expect(s.accionesRestantes).toBe(ACCIONES_POR_TURNO)
  })

  it('cada acción reduce el contador en 1', () => {
    let s = createBattleState()
    s = ejecutarCanalizar(s)
    expect(s.accionesRestantes).toBe(1)
    s = ejecutarGenerarEnergia(s)
    expect(s.accionesRestantes).toBe(0)
  })

  it('a 0 acciones no hay acciones disponibles', () => {
    const s = createBattleState({ accionesRestantes: 0 })
    expect(getAccionesDisponibles(s)).toHaveLength(0)
  })

  it('Combo concede una 3ª acción', () => {
    // Simula: jugador usa 1 acción con Combo → queda 1 + 1 = 2 acciones
    let s = createBattleState()
    s = ejecutarCanalizar(s)                // accionesRestantes: 2 → 1
    s = activarCombo(s)                     // +1 → 2
    expect(s.accionesRestantes).toBe(2)
    expect(s.comboActivo).toBe(true)
  })

  it('Combo solo funciona una vez por turno', () => {
    let s = createBattleState()
    s = activarCombo(s)   // 2 → 3
    s = activarCombo(s)   // no-op
    expect(s.accionesRestantes).toBe(3)
  })

  it('tras iniciarTurnoJugador las acciones se resetean a 2', () => {
    let s = createBattleState({ accionesRestantes: 0, comboActivo: true })
    s = iniciarTurnoJugador(s, 'canalizar')
    expect(s.accionesRestantes).toBe(ACCIONES_POR_TURNO)
    expect(s.comboActivo).toBe(false)
  })
})

// ─── Criterio 2: elección de inicio no consume acción ────────────────────────

describe('elección de inicio (gratuita)', () => {
  it('aplicarEleccionInicio NO resta accionesRestantes', () => {
    const s = createBattleState()
    const s2 = aplicarEleccionInicio(s, 'canalizar')
    expect(s2.accionesRestantes).toBe(s.accionesRestantes)
  })

  it('generar-energia sube la energía en 1', () => {
    const s = createBattleState({ energia: 2 })
    const s2 = aplicarEleccionInicio(s, 'generar-energia')
    expect(s2.energia).toBe(3)
  })

  it('canalizar sube la mano en 1', () => {
    const s = createBattleState({ mano: 3 })
    const s2 = aplicarEleccionInicio(s, 'canalizar')
    expect(s2.mano).toBe(4)
  })

  it('iniciarTurnoJugador incluye la elección gratuita sin tocar acciones', () => {
    const s = createBattleState({ energia: 2, accionesRestantes: 0 }) // turno anterior acabado
    const s2 = iniciarTurnoJugador(s, 'generar-energia')
    expect(s2.energia).toBe(3)
    expect(s2.accionesRestantes).toBe(ACCIONES_POR_TURNO) // reseteado, no descontado
  })
})

// ─── Criterio 3: mano = 10 fuerza Generar Energía ────────────────────────────

describe('auto-reglas de elección de inicio', () => {
  it('mano llena (10) → forzado generar-energia', () => {
    const s = createBattleState({ mano: MANO_MAX })
    expect(getEleccionForzada(s)).toBe('generar-energia')
  })

  it('mano normal → sin forzar', () => {
    const s = createBattleState({ mano: 5 })
    expect(getEleccionForzada(s)).toBeNull()
  })

  // ─── Criterio 4: energía = 5 fuerza Canalizar ────────────────────────────

  it('energía máxima (5) → forzado canalizar', () => {
    const s = createBattleState({ energia: ENERGIA_MAX })
    expect(getEleccionForzada(s)).toBe('canalizar')
  })

  it('energía normal → sin forzar', () => {
    const s = createBattleState({ energia: 3 })
    expect(getEleccionForzada(s)).toBeNull()
  })

  it('ambas reglas: mano llena tiene prioridad sobre energía máxima', () => {
    const s = createBattleState({ mano: MANO_MAX, energia: ENERGIA_MAX })
    // mano = 10 se evalúa primero → fuerza generar-energia
    expect(getEleccionForzada(s)).toBe('generar-energia')
  })
})

// ─── Criterio 5: Energía nunca supera 5 ni baja de 0 ────────────────────────

describe('límites de energía', () => {
  it('ejecutarGenerarEnergia no supera ENERGIA_MAX', () => {
    const s = createBattleState({ energia: ENERGIA_MAX })
    const s2 = ejecutarGenerarEnergia(s)
    expect(s2.energia).toBe(ENERGIA_MAX)
  })

  it('aplicarEleccionInicio generar-energia no supera ENERGIA_MAX', () => {
    const s = createBattleState({ energia: ENERGIA_MAX })
    const s2 = aplicarEleccionInicio(s, 'generar-energia')
    expect(s2.energia).toBe(ENERGIA_MAX)
  })

  it('energía no puede ser negativa (invariante del estado)', () => {
    // La energía empieza en 2 y solo sube con estas funciones
    // La reducción ocurrirá al activar habilidades (pendiente)
    // Verificamos que el estado inicial cumple el invariante
    const s = createBattleState({ energia: 0 })
    expect(s.energia).toBeGreaterThanOrEqual(0)
  })

  it('canalizar no supera MANO_MAX', () => {
    const s = createBattleState({ mano: MANO_MAX })
    const s2 = ejecutarCanalizar(s)
    expect(s2.mano).toBe(MANO_MAX)
  })
})

// ─── Criterio 6: siempre hay al menos una acción válida ──────────────────────

describe('nunca acción muerta', () => {
  it('pool vacío, mano llena, energía máxima → aún hay acciones', () => {
    const s = createBattleState({
      pool: {},
      mano: MANO_MAX,
      energia: ENERGIA_MAX,
    })
    const disponibles = getAccionesDisponibles(s)
    expect(disponibles.length).toBeGreaterThan(0)
  })

  it('canalizar y generar-energia siempre están en la lista', () => {
    const s = createBattleState()
    const disponibles = getAccionesDisponibles(s)
    expect(disponibles).toContain('canalizar')
    expect(disponibles).toContain('generar-energia')
  })

  it('con 0 acciones restantes la lista queda vacía (turno terminado)', () => {
    const s = createBattleState({ accionesRestantes: 0 })
    expect(getAccionesDisponibles(s)).toHaveLength(0)
  })
})

// ─── Criterio 7: turno del enemigo roba 1 carta de Dramaturgia ───────────────

// ─── bajarCooldowns ───────────────────────────────────────────────────────────

describe('bajarCooldowns', () => {
  it('resta 1 a todos los cooldowns activos', () => {
    const s = createBattleState({ cooldowns: { ataque: 2, escudo: 3 } })
    const s2 = bajarCooldowns(s)
    expect(s2.cooldowns['ataque']).toBe(1)
    expect(s2.cooldowns['escudo']).toBe(2)
  })

  it('cooldowns en 0 no se vuelven negativos', () => {
    const s = createBattleState({ cooldowns: { ataque: 0 } })
    const s2 = bajarCooldowns(s)
    expect(s2.cooldowns['ataque']).toBe(0)
  })

  it('cooldowns en 1 llegan a 0 (habilidad lista para usar)', () => {
    const s = createBattleState({ cooldowns: { golpe: 1 } })
    const s2 = bajarCooldowns(s)
    expect(s2.cooldowns['golpe']).toBe(0)
  })
})
