import { describe, it, expect } from 'vitest'
import { FASES_VERDUGO, TAJO, GRITO_DE_GUERRA, EJECUCION, DECAPITACION, PROCLAMA } from '../../content/verdugo'
import { faseActiva } from './fases'
import { elegirHabilidad, elegirNucleo, COLORES_JUGADOR_PROTOTIPO } from './ia'

// ─── faseActiva ───────────────────────────────────────────────────────────────

describe('faseActiva — Verdugo (activaA: 80 / 40)', () => {
  it('HP=80 → Fase 1 (contiene Ejecución)', () => {
    const fase = faseActiva(80, FASES_VERDUGO)
    const ids = fase.habilidades.map((h) => h.id)
    expect(ids).toContain('verdugo-ejecucion')
    expect(ids).not.toContain('verdugo-decapitacion')
  })

  it('HP=41 → Fase 1 (justo por encima del umbral)', () => {
    const fase = faseActiva(41, FASES_VERDUGO)
    expect(fase.activaA).toBe(80)
  })

  it('HP=40 → Fase 2 (contiene Decapitación)', () => {
    const fase = faseActiva(40, FASES_VERDUGO)
    const ids = fase.habilidades.map((h) => h.id)
    expect(ids).toContain('verdugo-decapitacion')
    expect(ids).not.toContain('verdugo-ejecucion')
  })

  it('HP=10 → Fase 2 (muy poca vida)', () => {
    const fase = faseActiva(10, FASES_VERDUGO)
    expect(fase.activaA).toBe(40)
  })

  it('HP=0 → Fase 2 (enemigo derrotado, borde)', () => {
    const fase = faseActiva(0, FASES_VERDUGO)
    expect(fase.activaA).toBe(40)
  })

  it('lanza si ninguna fase cubre el HP', () => {
    // Fase única con activaA=50; si hp=80 no está cubierta
    const faRara = [{ activaA: 50, habilidades: [] }]
    expect(() => faseActiva(80, faRara)).toThrow('ninguna fase cubre')
  })
})

// ─── elegirHabilidad ─────────────────────────────────────────────────────────

const HABILIDADES_FASE1 = FASES_VERDUGO[0]!.habilidades
const HABILIDADES_FASE2 = FASES_VERDUGO[1]!.habilidades

describe('elegirHabilidad — ⚔️ (icono ataque)', () => {
  it('con Núcleo 4 en pool y Ejecución lista (CD=0) → Ejecución', () => {
    const h = elegirHabilidad(
      'ataque',
      {},                     // cooldowns vacíos → Ejecución disponible
      { rojo: 4 },
      HABILIDADES_FASE1,
    )
    expect(h.id).toBe('verdugo-ejecucion')
  })

  it('sin Núcleo de valor 4 → Tajo (aunque Ejecución sin cooldown)', () => {
    const h = elegirHabilidad(
      'ataque',
      {},
      { rojo: 3 },            // valor 3 < valorMinimo 4
      HABILIDADES_FASE1,
    )
    expect(h.id).toBe('verdugo-tajo')
  })

  it('Ejecución en cooldown → Tajo (aunque hay Núcleo 4)', () => {
    const h = elegirHabilidad(
      'ataque',
      { 'verdugo-ejecucion': 1 },  // CD activo
      { rojo: 4 },
      HABILIDADES_FASE1,
    )
    expect(h.id).toBe('verdugo-tajo')
  })

  it('Fase 2 con Decapitación disponible y Núcleo 4 → Decapitación', () => {
    const h = elegirHabilidad(
      'ataque',
      {},
      { azul: 4 },
      HABILIDADES_FASE2,
    )
    expect(h.id).toBe('verdugo-decapitacion')
  })

  it('Fase 2 con Decapitación en cooldown → Tajo', () => {
    const h = elegirHabilidad(
      'ataque',
      { 'verdugo-decapitacion': 2 },
      { azul: 4 },
      HABILIDADES_FASE2,
    )
    expect(h.id).toBe('verdugo-tajo')
  })

  it('pool vacío → Tajo (ninguna habilidad pagable excepto la básica)', () => {
    // Tajo tiene valorMinimo=1 pero pool vacío... wait: Tajo necesita al menos 1 Núcleo.
    // Pero elegirHabilidad no rechaza la básica: la devuelve siempre como fallback.
    // El rechazo de CD ocurre en activarHabilidad.
    const h = elegirHabilidad('ataque', {}, {}, HABILIDADES_FASE1)
    expect(h.id).toBe('verdugo-tajo')
  })
})

describe('elegirHabilidad — 📜 (icono trama)', () => {
  it('Proclama sin cooldown y pagable → Proclama', () => {
    const h = elegirHabilidad(
      'trama',
      {},           // cooldowns vacíos → Proclama disponible
      { verde: 1 },
      HABILIDADES_FASE1,
    )
    expect(h.id).toBe('verdugo-proclama')
  })

  it('Proclama en calentamiento → Grito de guerra', () => {
    const h = elegirHabilidad(
      'trama',
      { 'verdugo-proclama': 2 },
      { verde: 1 },
      HABILIDADES_FASE1,
    )
    expect(h.id).toBe('verdugo-grito')
  })

  it('Proclama disponible pero sin Núcleo válido → Grito de guerra', () => {
    // Proclama tiene valorMinimo=1 y color=null, siempre pagable si hay algún Núcleo.
    // Si el pool está vacío, no puede pagarse.
    const h = elegirHabilidad('trama', {}, {}, HABILIDADES_FASE1)
    expect(h.id).toBe('verdugo-grito')
  })
})

// ─── elegirNucleo ─────────────────────────────────────────────────────────────

const COSTE_LIBRE = { cd: 1, color: null, valorMinimo: 1 }   // ⚫
const COSTE_4    = { cd: 2, color: null, valorMinimo: 4 }    // ⚫4

describe('elegirNucleo — denegación (color del jugador ≥3)', () => {
  it('pool {🔴4, 🟢4} → elige 🔴 (color del jugador, denegación)', () => {
    const c = elegirNucleo(COSTE_LIBRE, { rojo: 4, verde: 4 }, COLORES_JUGADOR_PROTOTIPO)
    expect(c).toBe('rojo')
  })

  it('pool {🔵3, 🟢4} → elige 🔵 (jugador ≥3 tiene prioridad sobre verde 4)', () => {
    const c = elegirNucleo(COSTE_LIBRE, { azul: 3, verde: 4 }, COLORES_JUGADOR_PROTOTIPO)
    expect(c).toBe('azul')
  })

  it('entre jugadores ≥3: elige el de mayor valor', () => {
    const c = elegirNucleo(COSTE_LIBRE, { rojo: 3, azul: 4 }, COLORES_JUGADOR_PROTOTIPO)
    expect(c).toBe('azul')
  })

  it('ningún color del jugador ≥3 → mayor valor disponible', () => {
    // pool: morado=2 (jugador pero <3), verde=4 (no jugador)
    const c = elegirNucleo(COSTE_LIBRE, { morado: 2, verde: 4 }, COLORES_JUGADOR_PROTOTIPO)
    expect(c).toBe('verde')
  })
})

describe('elegirNucleo — sin denegación', () => {
  it('sin colores del jugador: elige el de mayor valor', () => {
    const c = elegirNucleo(COSTE_LIBRE, { verde: 4, amarillo: 3 }, COLORES_JUGADOR_PROTOTIPO)
    expect(c).toBe('verde')
  })

  it('empate de valor: criterio determinista (orden de color fijo)', () => {
    // verde=3, amarillo=3 → ORDEN_COLOR: rojo<azul<verde<amarillo<morado → verde primero
    const c = elegirNucleo(COSTE_LIBRE, { verde: 3, amarillo: 3 }, COLORES_JUGADOR_PROTOTIPO)
    expect(c).toBe('verde')
  })
})

describe('elegirNucleo — coste valorMinimo 4 (⚫4)', () => {
  it('solo Núcleos de valor 4 son candidatos', () => {
    // pool: rojo=4, verde=3 → solo rojo califica
    const c = elegirNucleo(COSTE_4, { rojo: 4, verde: 3 }, COLORES_JUGADOR_PROTOTIPO)
    expect(c).toBe('rojo')
  })

  it('entre valor=4: aplica denegación (color del jugador)', () => {
    // rojo=4 (jugador), verde=4 (no jugador) → denegación → rojo
    const c = elegirNucleo(COSTE_4, { rojo: 4, verde: 4 }, COLORES_JUGADOR_PROTOTIPO)
    expect(c).toBe('rojo')
  })

  it('sin valor=4 en pool → null', () => {
    const c = elegirNucleo(COSTE_4, { rojo: 3, verde: 2 }, COLORES_JUGADOR_PROTOTIPO)
    expect(c).toBeNull()
  })

  it('pool vacío → null', () => {
    const c = elegirNucleo(COSTE_4, {}, COLORES_JUGADOR_PROTOTIPO)
    expect(c).toBeNull()
  })
})

describe('elegirNucleo — coste de color específico', () => {
  it('coste 🔴 con pool {rojo:2, azul:4} → solo rojo (color incorrecto excluido)', () => {
    const costeRojo = { cd: 1, color: ['rojo'] as const, valorMinimo: 1 }
    const c = elegirNucleo(costeRojo, { rojo: 2, azul: 4 }, COLORES_JUGADOR_PROTOTIPO)
    expect(c).toBe('rojo')
  })
})
