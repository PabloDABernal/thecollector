import type { Habilidad, Lider } from './types'

// ─── Habilidades del Forjador — Nivel 1 ──────────────────────────────────────

/**
 * CD1 · ⚫ · Ataque puro.
 * CD1 es siempre puro (sin modificadores), regla general del sistema.
 */
export const MARTILLO_DE_FORJA: Habilidad = {
  id: 'forjador-martillo',
  nombre: 'Martillo de forja',
  efectos: [{ tipo: 'ataque', formula: { tipo: 'nucleo' } }],
  coste: { cd: 1, color: null, valorMinimo: 1 },
  keywords: [],
}

/**
 * CD2 · 🔵 · Trama + Defensa.
 * base:   Trama2 · Defensa3
 * umbral: Trama3 · Defensa3  (Núcleo ≥3)
 * La Trama la maneja el motor: fuente jugador = resta.
 */
export const TEMPLE_DE_ACERO: Habilidad = {
  id: 'forjador-temple',
  nombre: 'Temple de acero',
  efectos: [
    { tipo: 'trama', valor: 2 },
    { tipo: 'defensa', valor: 3 },
  ],
  efectosUmbral: [
    { tipo: 'trama', valor: 3 },
    { tipo: 'defensa', valor: 3 },
  ],
  coste: { cd: 2, color: ['azul'], valorMinimo: 1 },
  keywords: [],
}

/**
 * CD3 · 🔴 · Ataque con umbral.
 * base:   Ataque+3   (valorNucleo + 3)
 * umbral: Ataque×2   (valorNucleo × 2)  — Núcleo ≥3
 * Sin solapamientos: +3 opera con 1-2, ×2 con 3-4.
 */
export const COLADURA_ARDIENTE: Habilidad = {
  id: 'forjador-coladura',
  nombre: 'Coladura ardiente',
  efectos: [{ tipo: 'ataque', formula: { tipo: 'suma', x: 3 } }],
  efectosUmbral: [{ tipo: 'ataque', formula: { tipo: 'multiplica', x: 2 } }],
  coste: { cd: 3, color: ['rojo'], valorMinimo: 1 },
  keywords: [],
}

/**
 * CD4 · 🟣 · Ataque×3 + auto-daño Caos.
 * El auto-daño (= valor del Núcleo gastado) lo añade el motor al detectar coste 🟣.
 * NO se escribe aquí como efecto.
 * Núcleo 4: 12 daño / −4 vida.
 */
export const GRAN_FUNDICION: Habilidad = {
  id: 'forjador-gran-fundicion',
  nombre: 'Gran Fundición',
  efectos: [{ tipo: 'ataque', formula: { tipo: 'multiplica', x: 3 } }],
  coste: { cd: 4, color: ['morado'], valorMinimo: 1 },
  keywords: [],
}

// ─── El Forjador (Líder) ─────────────────────────────────────────────────────

export const FORJADOR: Lider = {
  id: 'forjador',
  nombre: 'El Forjador',
  hp: 32,
  habilidades: [MARTILLO_DE_FORJA, TEMPLE_DE_ACERO, COLADURA_ARDIENTE, GRAN_FUNDICION],
}
