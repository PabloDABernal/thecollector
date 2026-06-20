import type { Habilidad, Enemigo } from './types'

// ─── Habilidades del Verdugo ──────────────────────────────────────────────────

/**
 * CD1 · ⚫ · Ataque puro. Básica de Ataque: siempre disponible.
 * CD1 sin modificador — regla general del sistema.
 */
export const TAJO: Habilidad = {
  id: 'verdugo-tajo',
  nombre: 'Tajo',
  efectos: [{ tipo: 'ataque', formula: { tipo: 'nucleo' } }],
  coste: { cd: 1, color: null, valorMinimo: 1 },
  keywords: [],
}

/**
 * CD1 · ⚫ · Trama 1. Básica de Trama: siempre disponible.
 * El motor suma Trama cuando fuente = 'enemigo'.
 */
export const GRITO_DE_GUERRA: Habilidad = {
  id: 'verdugo-grito',
  nombre: 'Grito de guerra',
  efectos: [{ tipo: 'trama', valor: 1 }],
  coste: { cd: 1, color: null, valorMinimo: 1 },
  keywords: [],
}

/**
 * CD2 · ⚫4 (valorMinimo 4) · Ataque+2.
 * Solo activable cuando hay un Núcleo de valor 4 en el pool (~25% de veces).
 * Fase 1.
 */
export const EJECUCION: Habilidad = {
  id: 'verdugo-ejecucion',
  nombre: 'Ejecución',
  efectos: [{ tipo: 'ataque', formula: { tipo: 'suma', x: 2 } }],
  coste: { cd: 2, color: null, valorMinimo: 4 },
  keywords: [],
}

/**
 * CD3 · ⚫ · Trama 3.
 * Disponible desde el turno 3 (calentamiento).
 */
export const PROCLAMA: Habilidad = {
  id: 'verdugo-proclama',
  nombre: 'Proclama',
  efectos: [{ tipo: 'trama', valor: 3 }],
  coste: { cd: 3, color: null, valorMinimo: 1 },
  keywords: [],
}

/**
 * CD2 · ⚫4 · Ataque+3. Reemplaza a Ejecución en Fase 2 (≤40HP).
 */
export const DECAPITACION: Habilidad = {
  id: 'verdugo-decapitacion',
  nombre: 'Decapitación',
  efectos: [{ tipo: 'ataque', formula: { tipo: 'suma', x: 3 } }],
  coste: { cd: 2, color: null, valorMinimo: 4 },
  keywords: [],
}

// ─── El Verdugo (Enemigo) ─────────────────────────────────────────────────────

export const VERDUGO: Enemigo = {
  id: 'verdugo',
  nombre: 'El Verdugo',
  hpTotal: 80,

  /** Fase 1 (80 → 40 HP): habilidades base. */
  habilidades: [TAJO, GRITO_DE_GUERRA, EJECUCION, PROCLAMA],

  /** Fase 2 (≤40 HP): Ejecución → Decapitación. El resto no cambia. */
  fases: [
    {
      umbral: 40,
      habilidades: [TAJO, GRITO_DE_GUERRA, DECAPITACION, PROCLAMA],
    },
  ],
}
