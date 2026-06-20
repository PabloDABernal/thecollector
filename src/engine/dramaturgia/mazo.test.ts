import { describe, it, expect } from 'vitest'
import { createRng } from '../rng'
import { createBattleState } from '../turno/estado'
import { aplicarEfecto } from '../efectos/ejecutor'
import { barajar, robarCarta } from './mazo'
import { MAZO_BASE_DRAMATURGIA, DEFINICIONES_DRAMATURGIA } from '../../content/dramaturgia'
import type { ContextoEjecucion } from '../efectos/ejecutor'

// ─── Composición del mazo ─────────────────────────────────────────────────────

describe('MAZO_BASE_DRAMATURGIA — composición', () => {
  it('tiene 30 cartas exactas', () => {
    expect(MAZO_BASE_DRAMATURGIA).toHaveLength(30)
  })

  it('18 cartas ⚔️ (ataque) y 12 cartas 📜 (trama)', () => {
    const ataque = MAZO_BASE_DRAMATURGIA.filter((c) => c.icono === 'ataque')
    const trama  = MAZO_BASE_DRAMATURGIA.filter((c) => c.icono === 'trama')
    expect(ataque).toHaveLength(18)
    expect(trama).toHaveLength(12)
  })

  it('las copias están expandidas (IDs únicos por instancia)', () => {
    const ids = MAZO_BASE_DRAMATURGIA.map((c) => c.id)
    expect(new Set(ids).size).toBe(30)
  })

  it('17 definiciones únicas', () => {
    expect(DEFINICIONES_DRAMATURGIA).toHaveLength(17)
  })

  it('las copias suman 30', () => {
    const total = DEFINICIONES_DRAMATURGIA.reduce((s, d) => s + d.copias, 0)
    expect(total).toBe(30)
  })

  it('Ultimátum existe 1 vez (×1)', () => {
    const copias = MAZO_BASE_DRAMATURGIA.filter((c) => c.id.startsWith('ultimatum'))
    expect(copias).toHaveLength(1)
  })

  it('Llamada a filas existe 2 veces (×2)', () => {
    const copias = MAZO_BASE_DRAMATURGIA.filter((c) => c.id.startsWith('llamada-a-filas'))
    expect(copias).toHaveLength(2)
  })

  it('los 3 orígenes están presentes', () => {
    const origenes = new Set(MAZO_BASE_DRAMATURGIA.map((c) => c.origen))
    expect(origenes).toContain('Verdugo')
    expect(origenes).toContain('Bastión')
    expect(origenes).toContain('Común')
  })
})

// ─── barajar ─────────────────────────────────────────────────────────────────

describe('barajar', () => {
  it('misma semilla → mismo orden (determinismo)', () => {
    const rng1 = createRng(42)
    const rng2 = createRng(42)
    const ord1 = barajar(MAZO_BASE_DRAMATURGIA, rng1).map((c) => c.id)
    const ord2 = barajar(MAZO_BASE_DRAMATURGIA, rng2).map((c) => c.id)
    expect(ord1).toEqual(ord2)
  })

  it('semillas distintas → órdenes distintos', () => {
    const rng1 = createRng(1)
    const rng2 = createRng(2)
    const ord1 = barajar(MAZO_BASE_DRAMATURGIA, rng1).map((c) => c.id)
    const ord2 = barajar(MAZO_BASE_DRAMATURGIA, rng2).map((c) => c.id)
    expect(ord1).not.toEqual(ord2)
  })

  it('barajar no altera el array original', () => {
    const original = [...MAZO_BASE_DRAMATURGIA]
    const rng = createRng(99)
    barajar(MAZO_BASE_DRAMATURGIA, rng)
    expect(MAZO_BASE_DRAMATURGIA).toEqual(original)
  })

  it('resultado contiene las mismas 30 cartas (solo cambia el orden)', () => {
    const rng = createRng(7)
    const barajado = barajar(MAZO_BASE_DRAMATURGIA, rng)
    expect(barajado).toHaveLength(30)
    const idsOrig    = [...MAZO_BASE_DRAMATURGIA].map((c) => c.id).sort()
    const idsBarajado = barajado.map((c) => c.id).sort()
    expect(idsBarajado).toEqual(idsOrig)
  })
})

// ─── robarCarta ──────────────────────────────────────────────────────────────

describe('robarCarta', () => {
  it('devuelve la carta [0] del mazo', () => {
    const rng = createRng(0)
    const mazo = barajar(MAZO_BASE_DRAMATURGIA, rng)
    const s = createBattleState({ dramaturgia: mazo })
    const { carta } = robarCarta(s, createRng(0))
    expect(carta.id).toBe(mazo[0]!.id)
  })

  it('el mazo queda con 29 cartas tras robar', () => {
    const rng = createRng(0)
    const mazo = barajar(MAZO_BASE_DRAMATURGIA, rng)
    const s = createBattleState({ dramaturgia: mazo })
    const { state: s2 } = robarCarta(s, createRng(0))
    expect(s2.dramaturgia).toHaveLength(29)
  })

  it('la carta robada va al descarte', () => {
    const rng = createRng(0)
    const mazo = barajar(MAZO_BASE_DRAMATURGIA, rng)
    const s = createBattleState({ dramaturgia: mazo })
    const { carta, state: s2 } = robarCarta(s, createRng(0))
    expect(s2.dramaturgiaDescarte).toContainEqual(carta)
  })

  it('robar 3 cartas acumula 3 en el descarte', () => {
    const rng = createRng(1)
    const mazo = barajar(MAZO_BASE_DRAMATURGIA, rng)
    let s = createBattleState({ dramaturgia: mazo })
    const r = createRng(1)
    const { state: s1 } = robarCarta(s, r)
    const { state: s2 } = robarCarta(s1, r)
    const { state: s3 } = robarCarta(s2, r)
    expect(s3.dramaturgia).toHaveLength(27)
    expect(s3.dramaturgiaDescarte).toHaveLength(3)
  })
})

// ─── Deck-out ─────────────────────────────────────────────────────────────────

describe('deck-out — rebarajar al vaciarse el mazo', () => {
  it('mazo vacío + descarte lleno → se rebaraja y se puede robar', () => {
    const rng = createRng(5)
    // Ponemos 3 cartas en el descarte y el mazo vacío
    const descarte = MAZO_BASE_DRAMATURGIA.slice(0, 3)
    const s = createBattleState({ dramaturgia: [], dramaturgiaDescarte: descarte })
    const { carta, state: s2 } = robarCarta(s, rng)
    expect(carta).toBeDefined()
    // Las cartas del descarte se distribuyeron entre mazo (2) y la carta robada (1)
    expect(s2.dramaturgia).toHaveLength(2)
    expect(s2.dramaturgiaDescarte).toHaveLength(1)
  })

  it('mazo vacío + descarte vacío → lanza error', () => {
    const s = createBattleState({ dramaturgia: [], dramaturgiaDescarte: [] })
    expect(() => robarCarta(s, createRng(0))).toThrow('mazo y descarte vacíos')
  })

  it('al rebarajar el descarte, se puede seguir robando todas las cartas', () => {
    const rng = createRng(3)
    const mazo = barajar(MAZO_BASE_DRAMATURGIA, rng)
    let s = createBattleState({ dramaturgia: mazo })
    // Robar todas las 30 cartas
    for (let i = 0; i < 30; i++) {
      const { state } = robarCarta(s, rng)
      s = state
    }
    expect(s.dramaturgia).toHaveLength(0)
    expect(s.dramaturgiaDescarte).toHaveLength(30)

    // Robar una más: debe rebarajar y funcionar
    const { carta, state: sFinal } = robarCarta(s, rng)
    expect(carta).toBeDefined()
    expect(sFinal.dramaturgia).toHaveLength(29)
    expect(sFinal.dramaturgiaDescarte).toHaveLength(1)
  })
})

// ─── Efectos de cartas representativas ───────────────────────────────────────

const ctxEnemigo: ContextoEjecucion = {
  valorNucleo: 1,
  fuente: 'enemigo',
  colorCoste: null,
  keywords: [],
}

describe('resolver efecto de carta representativa', () => {
  it('Ultimátum → −3 vida al Líder inabsorbible (escudo intacto)', () => {
    const ultimatum = MAZO_BASE_DRAMATURGIA.find((c) => c.id.startsWith('ultimatum'))!
    const s = createBattleState({ leaderHp: 20, escudos: 3 })
    let s2 = s
    for (const ef of ultimatum.efectos) {
      s2 = aplicarEfecto(s2, ef, ctxEnemigo)
    }
    expect(s2.leaderHp).toBe(17)  // −3 inabsorbible
    expect(s2.escudos).toBe(3)    // escudo intacto
  })

  it('Las murallas ceden → Trama +2', () => {
    const muro = MAZO_BASE_DRAMATURGIA.find((c) => c.id.startsWith('las-murallas-ceden'))!
    const s = createBattleState({ trama: 0 })
    let s2 = s
    for (const ef of muro.efectos) {
      s2 = aplicarEfecto(s2, ef, ctxEnemigo)
    }
    expect(s2.trama).toBe(2)
  })

  it('Posición defensiva → +2 escudo del Enemigo (sin tope)', () => {
    const pos = MAZO_BASE_DRAMATURGIA.find((c) => c.id.startsWith('posicion-defensiva'))!
    const s = createBattleState({ escudosEnemigo: 0 })
    let s2 = s
    for (const ef of pos.efectos) {
      s2 = aplicarEfecto(s2, ef, ctxEnemigo)
    }
    expect(s2.escudosEnemigo).toBe(2)
  })

  it('El Verdugo Despierta → +3 HP al Enemigo (sin pasar del máximo)', () => {
    const despierta = MAZO_BASE_DRAMATURGIA.find((c) => c.id.startsWith('el-verdugo-despierta'))!
    const s = createBattleState({ enemyHp: 77, enemyMaxHp: 80 })
    let s2 = s
    for (const ef of despierta.efectos) {
      s2 = aplicarEfecto(s2, ef, ctxEnemigo)
    }
    expect(s2.enemyHp).toBe(80)
  })

  it('Momento de duda → jugador descarta 1 carta', () => {
    const duda = MAZO_BASE_DRAMATURGIA.find((c) => c.id.startsWith('momento-de-duda'))!
    const ctxJ: ContextoEjecucion = { ...ctxEnemigo, fuente: 'jugador' }
    const s = createBattleState({ mano: 5 })
    let s2 = s
    for (const ef of duda.efectos) {
      s2 = aplicarEfecto(s2, ef, ctxJ)
    }
    expect(s2.mano).toBe(4)
  })
})
