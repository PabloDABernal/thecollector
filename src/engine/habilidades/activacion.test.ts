import { describe, it, expect } from 'vitest'
import { createBattleState } from '../turno/estado'
import { bajarCooldowns } from '../turno/inicio-turno'
import { calentarHabilidades, activarHabilidad } from './activacion'
import type { Habilidad } from '../../content/types'

// ─── Habilidades de prueba ────────────────────────────────────────────────────

/** cd1, ⚫, Ataque {nucleo} */
const hAtaqueSimple: Habilidad = {
  id: 'ataque-simple',
  nombre: 'Golpe',
  efectos: [{ tipo: 'ataque', formula: { tipo: 'nucleo' } }],
  coste: { cd: 1, color: null, valorMinimo: 1 },
  keywords: [],
}

/** cd2, 🔴, Ataque {suma 3} sin umbral */
const hAtaqueSuma: Habilidad = {
  id: 'ataque-suma',
  nombre: 'Golpe rojo',
  efectos: [{ tipo: 'ataque', formula: { tipo: 'suma', x: 3 } }],
  coste: { cd: 2, color: ['rojo'], valorMinimo: 1 },
  keywords: [],
}

/**
 * Coladura ardiente (cd2, ⚫):
 *   base: Ataque {suma 3}  → valorNucleo + 3
 *   umbral: Ataque {multiplica 2} → valorNucleo × 2
 */
const hColadura: Habilidad = {
  id: 'coladura',
  nombre: 'Coladura ardiente',
  efectos: [{ tipo: 'ataque', formula: { tipo: 'suma', x: 3 } }],
  efectosUmbral: [{ tipo: 'ataque', formula: { tipo: 'multiplica', x: 2 } }],
  coste: { cd: 2, color: null, valorMinimo: 1 },
  keywords: [],
}

/**
 * Temple de acero (cd3, 🔵):
 *   base: [Trama 2, Defensa 3]
 *   umbral: [Trama 3, Defensa 3]
 */
const hTemple: Habilidad = {
  id: 'temple',
  nombre: 'Temple de acero',
  efectos: [
    { tipo: 'trama', valor: 2 },
    { tipo: 'defensa', valor: 3 },
  ],
  efectosUmbral: [
    { tipo: 'trama', valor: 3 },
    { tipo: 'defensa', valor: 3 },
  ],
  coste: { cd: 3, color: ['azul'], valorMinimo: 1 },
  keywords: [],
}

/** cd1, 🟣 (Caos), Ataque {nucleo} */
const hCaos: Habilidad = {
  id: 'caos-golpe',
  nombre: 'Golpe caótico',
  efectos: [{ tipo: 'ataque', formula: { tipo: 'nucleo' } }],
  coste: { cd: 1, color: ['morado'], valorMinimo: 1 },
  keywords: [],
}

// ─── Criterio 1: activar pone cooldown = cd ───────────────────────────────────

describe('cooldown tras activación', () => {
  it('activar habilidad pone cooldown = cd', () => {
    const s = createBattleState({
      pool: { rojo: 2 },
      accionesRestantes: 2,
    })
    const r = activarHabilidad(s, hAtaqueSimple, 'rojo', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.cooldowns['ataque-simple']).toBe(1)
  })

  it('activar cd2 pone cooldown = 2', () => {
    const s = createBattleState({
      pool: { rojo: 3 },
      accionesRestantes: 2,
    })
    const r = activarHabilidad(s, hAtaqueSuma, 'rojo', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.cooldowns['ataque-suma']).toBe(2)
  })
})

// ─── Criterio 2: cooldown > 0 = no activable ─────────────────────────────────

describe('habilidad bloqueada por cooldown', () => {
  it('cooldown > 0 → razon: cooldown-activo', () => {
    const s = createBattleState({
      pool: { rojo: 2 },
      cooldowns: { 'ataque-simple': 1 },
      accionesRestantes: 2,
    })
    const r = activarHabilidad(s, hAtaqueSimple, 'rojo', 'jugador')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.razon).toBe('cooldown-activo')
  })
})

// ─── Criterio 3: escalera de calentamiento ────────────────────────────────────

describe('escalera de calentamiento', () => {
  /** Simula N bajadas de cooldown a partir del calentamiento. */
  function escaleraParaCd(cd: number, bajadas: number): number {
    const habilidades = [{ ...hAtaqueSimple, id: `h-cd${cd}`, coste: { ...hAtaqueSimple.coste, cd } }]
    let s = createBattleState({ cooldowns: calentarHabilidades(habilidades) })
    for (let i = 0; i < bajadas; i++) s = bajarCooldowns(s)
    return s.cooldowns[`h-cd${cd}`] ?? 0
  }

  it('cd1: usable desde el turno 1 (1 bajada)', () => {
    expect(escaleraParaCd(1, 1)).toBe(0)
  })

  it('cd2: NO usable en T1, usable en T2', () => {
    expect(escaleraParaCd(2, 1)).toBe(1) // T1: no usable
    expect(escaleraParaCd(2, 2)).toBe(0) // T2: usable
  })

  it('cd3: usable solo desde T3', () => {
    expect(escaleraParaCd(3, 2)).toBe(1) // T2: no usable
    expect(escaleraParaCd(3, 3)).toBe(0) // T3: usable
  })

  it('cd4: usable solo desde T4', () => {
    expect(escaleraParaCd(4, 3)).toBe(1) // T3: no usable
    expect(escaleraParaCd(4, 4)).toBe(0) // T4: usable
  })
})

// ─── Criterio 4: cd1 vuelve a estar lista al turno siguiente ─────────────────

describe('cd1 listo en cada turno', () => {
  it('cd1 usada → tras 1 bajada está lista de nuevo', () => {
    // Estado inicial: cd1 en calentamiento (cooldown=1)
    const hab: Habilidad = { ...hAtaqueSimple, id: 'cd1-test' }
    let s = createBattleState({
      pool: { rojo: 2 },
      cooldowns: calentarHabilidades([hab]),
      accionesRestantes: 2,
    })

    // Turno 1: bajar cooldown (0) → usar habilidad → cooldown vuelve a 1
    s = bajarCooldowns(s)
    expect(s.cooldowns['cd1-test']).toBe(0)

    const r = activarHabilidad(s, hab, 'rojo', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    s = r.state
    expect(s.cooldowns['cd1-test']).toBe(1)

    // Reponer pool y simular siguiente turno
    s = { ...s, pool: { rojo: 2 }, accionesRestantes: 2 }
    s = bajarCooldowns(s)
    expect(s.cooldowns['cd1-test']).toBe(0) // lista de nuevo

    const r2 = activarHabilidad(s, hab, 'rojo', 'jugador')
    expect(r2.ok).toBe(true)
  })
})

// ─── Criterio 5: color y valorMinimo ─────────────────────────────────────────

describe('validación de Núcleo', () => {
  it('color incorrecto → nucleo-invalido', () => {
    const s = createBattleState({ pool: { verde: 3 }, accionesRestantes: 2 })
    // hAtaqueSuma requiere rojo
    const r = activarHabilidad(s, hAtaqueSuma, 'verde', 'jugador')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.razon).toBe('nucleo-invalido')
  })

  it('valor inferior a valorMinimo → nucleo-invalido', () => {
    const habMin3: Habilidad = {
      ...hAtaqueSimple,
      id: 'h-min3',
      coste: { ...hAtaqueSimple.coste, valorMinimo: 3 },
    }
    const s = createBattleState({ pool: { rojo: 2 }, accionesRestantes: 2 })
    const r = activarHabilidad(s, habMin3, 'rojo', 'jugador')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.razon).toBe('nucleo-invalido')
  })

  it('Núcleo ausente del pool → nucleo-invalido', () => {
    const s = createBattleState({ pool: { azul: 2 }, accionesRestantes: 2 })
    const r = activarHabilidad(s, hAtaqueSimple, 'rojo', 'jugador')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.razon).toBe('nucleo-invalido')
  })

  it('⚫ (color null): cualquier color es válido', () => {
    const s = createBattleState({ pool: { verde: 2 }, accionesRestantes: 2 })
    const r = activarHabilidad(s, hAtaqueSimple, 'verde', 'jugador') // coste null
    expect(r.ok).toBe(true)
  })
})

// ─── Criterio 6: gasta Núcleo del pool y descuenta acción ────────────────────

describe('efectos sobre pool y acciones', () => {
  it('gasta el Núcleo elegido del pool', () => {
    const s = createBattleState({
      pool: { rojo: 2, azul: 3 },
      accionesRestantes: 2,
    })
    const r = activarHabilidad(s, hAtaqueSimple, 'rojo', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.pool['rojo']).toBeUndefined()
    expect(r.state.pool['azul']).toBe(3) // no tocado
  })

  it('descuenta 1 acción al jugador', () => {
    const s = createBattleState({ pool: { rojo: 2 }, accionesRestantes: 2 })
    const r = activarHabilidad(s, hAtaqueSimple, 'rojo', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.accionesRestantes).toBe(1)
  })

  it('enemigo no descuenta accionesRestantes del jugador', () => {
    const s = createBattleState({
      pool: { rojo: 2 },
      cooldownsEnemigo: {},
      accionesRestantes: 2,
    })
    const r = activarHabilidad(s, hAtaqueSimple, 'rojo', 'enemigo')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.accionesRestantes).toBe(2) // sin cambio
  })
})

// ─── Criterio 7: umbral a nivel de habilidad ─────────────────────────────────

describe('umbral — efectosUmbral', () => {
  // Coladura ardiente: Núcleo 2 → base; Núcleo 4 → umbral
  describe('Coladura ardiente (ataque)', () => {
    it('Núcleo 2 (<3) → base: daño = 2+3 = 5', () => {
      const s = createBattleState({ enemyHp: 20, pool: { rojo: 2 }, accionesRestantes: 2 })
      const r = activarHabilidad(s, hColadura, 'rojo', 'jugador')
      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.state.enemyHp).toBe(15) // 20 − 5
    })

    it('Núcleo 4 (≥3) → umbral: daño = 4×2 = 8', () => {
      const s = createBattleState({ enemyHp: 20, pool: { rojo: 4 }, accionesRestantes: 2 })
      const r = activarHabilidad(s, hColadura, 'rojo', 'jugador')
      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.state.enemyHp).toBe(12) // 20 − 8
    })

    it('Núcleo 3 exacto activa umbral', () => {
      const s = createBattleState({ enemyHp: 20, pool: { azul: 3 }, accionesRestantes: 2 })
      const r = activarHabilidad(s, hColadura, 'azul', 'jugador')
      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.state.enemyHp).toBe(14) // 3×2 = 6
    })
  })

  // Temple de acero: Trama + Defensa, umbral = más Trama
  describe('Temple de acero (Trama + Defensa)', () => {
    it('Núcleo 2 → base: Trama −2, Defensa +3', () => {
      const s = createBattleState({
        trama: 5,
        escudos: 0,
        pool: { azul: 2 },
        accionesRestantes: 2,
      })
      const r = activarHabilidad(s, hTemple, 'azul', 'jugador')
      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.state.trama).toBe(3)    // 5 − 2
      expect(r.state.escudos).toBe(3)
    })

    it('Núcleo 4 → umbral: Trama −3, Defensa +3', () => {
      const s = createBattleState({
        trama: 5,
        escudos: 0,
        pool: { azul: 4 },
        accionesRestantes: 2,
      })
      const r = activarHabilidad(s, hTemple, 'azul', 'jugador')
      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.state.trama).toBe(2)    // 5 − 3
      expect(r.state.escudos).toBe(3)
    })
  })
})

// ─── Criterio 8: regla Caos ───────────────────────────────────────────────────

describe('Caos (coste 🟣)', () => {
  it('habilidad 🟣 con Núcleo 4: efecto + auto-daño 4 al Líder', () => {
    const s = createBattleState({
      leaderHp: 20,
      enemyHp: 20,
      pool: { morado: 4 },
      accionesRestantes: 2,
    })
    const r = activarHabilidad(s, hCaos, 'morado', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.enemyHp).toBe(16)  // ataque: daño 4
    expect(r.state.leaderHp).toBe(16) // auto-daño Caos: 4
  })

  it('Caos auto-daño es inabsorbible (ignora escudos)', () => {
    const s = createBattleState({
      leaderHp: 20,
      escudos: 5,
      enemyHp: 20,
      pool: { morado: 3 },
      accionesRestantes: 2,
    })
    const r = activarHabilidad(s, hCaos, 'morado', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.leaderHp).toBe(17) // auto-daño 3 directo, no absorbido
    expect(r.state.escudos).toBe(5)   // escudos intactos (el ataque va al enemigo)
  })

  it('habilidad NO Caos no aplica auto-daño', () => {
    const s = createBattleState({
      leaderHp: 20,
      pool: { rojo: 3 },
      accionesRestantes: 2,
    })
    const r = activarHabilidad(s, hAtaqueSimple, 'rojo', 'jugador')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.leaderHp).toBe(20) // sin cambio
  })
})

// ─── calentarHabilidades ──────────────────────────────────────────────────────

describe('calentarHabilidades', () => {
  it('inicializa cooldowns = cd de cada habilidad', () => {
    const cds = calentarHabilidades([hAtaqueSimple, hAtaqueSuma, hTemple])
    expect(cds['ataque-simple']).toBe(1)
    expect(cds['ataque-suma']).toBe(2)
    expect(cds['temple']).toBe(3)
  })

  it('sin habilidades → objeto vacío', () => {
    expect(calentarHabilidades([])).toEqual({})
  })
})
