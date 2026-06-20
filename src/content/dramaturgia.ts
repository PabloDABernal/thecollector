import type { CartaDramaturgia, EfectoAtomico } from './types'
import { ESBIRRO_REFUERZO, ESBIRRO_DEFENSOR } from './esbirros'

// ─── Tipo interno: definición con copias ─────────────────────────────────────

interface Definicion extends CartaDramaturgia {
  copias: number
}

// ─── Definiciones (17 cartas únicas → 30 copias) ─────────────────────────────

// Helpers de efectos para legibilidad
const invocarRefuerzo4: EfectoAtomico = { tipo: 'invocar', esbirro: ESBIRRO_REFUERZO }
const invocarRefuerzo3: EfectoAtomico = { tipo: 'invocar', esbirro: { ...ESBIRRO_REFUERZO, vida: 3 } }
const invocarDefensor: EfectoAtomico  = { tipo: 'invocar', esbirro: ESBIRRO_DEFENSOR }

const DEFS: Definicion[] = [
  // ── Verdugo ⚔️ ──────────────────────────────────────────────────────────────
  {
    id: 'llamada-a-filas',
    nombre: 'Llamada a filas',
    origen: 'Verdugo',
    icono: 'ataque',
    efectos: [invocarRefuerzo4],
    copias: 2,
  },
  {
    id: 'golpe-de-apertura',
    nombre: 'Golpe de apertura',
    origen: 'Verdugo',
    icono: 'ataque',
    efectos: [{ tipo: 'buffAtaqueTemporal', valor: 1 }],
    copias: 2,
  },
  {
    id: 'barrido-brutal',
    nombre: 'Barrido brutal',
    origen: 'Verdugo',
    icono: 'ataque',
    efectos: [{ tipo: 'dañoATodosAliados', valor: 2 }],
    copias: 2,
  },
  {
    id: 'invocacion-defensor',
    nombre: 'Invocación Defensor',
    origen: 'Verdugo',
    icono: 'ataque',
    efectos: [invocarDefensor],
    copias: 2,
  },
  // ── Verdugo 📜 ──────────────────────────────────────────────────────────────
  {
    id: 'ultimatum',
    nombre: 'Ultimátum',
    origen: 'Verdugo',
    icono: 'trama',
    efectos: [{ tipo: 'dañoFijo', valor: 3, inabsorbible: true }],
    copias: 1,
  },
  {
    id: 'el-verdugo-despierta',
    nombre: 'El Verdugo Despierta',
    origen: 'Verdugo',
    icono: 'trama',
    efectos: [{ tipo: 'curar', valor: 3 }],
    copias: 1,
  },
  // ── Bastión 📜 ───────────────────────────────────────────────────────────────
  {
    id: 'las-murallas-ceden',
    nombre: 'Las murallas ceden',
    origen: 'Bastión',
    icono: 'trama',
    efectos: [{ tipo: 'trama', valor: 2 }],
    copias: 2,
  },
  {
    id: 'terreno-hostil',
    nombre: 'Terreno hostil',
    origen: 'Bastión',
    icono: 'trama',
    efectos: [{ tipo: 'energia', valor: -1 }],
    copias: 2,
  },
  {
    id: 'grietas-en-la-defensa',
    nombre: 'Grietas en la defensa',
    origen: 'Bastión',
    icono: 'trama',
    efectos: [{ tipo: 'siguienteDañoInabsorbible' }],
    copias: 1,
  },
  {
    id: 'barricada-derrumbada',
    nombre: 'Barricada derrumbada',
    origen: 'Bastión',
    icono: 'trama',
    efectos: [{ tipo: 'trama', valor: 3 }],
    copias: 1,
  },
  // ── Bastión ⚔️ ────────────────────────────────────────────────────────────
  {
    id: 'refuerzo-inesperado',
    nombre: 'Refuerzo inesperado',
    origen: 'Bastión',
    icono: 'ataque',
    efectos: [invocarRefuerzo4],
    copias: 2,
  },
  {
    id: 'posicion-defensiva',
    nombre: 'Posición defensiva',
    origen: 'Bastión',
    icono: 'ataque',
    efectos: [{ tipo: 'defensa', valor: 2 }],
    copias: 2,
  },
  // ── Común ⚔️ ────────────────────────────────────────────────────────────────
  {
    id: 'presion-constante',
    nombre: 'Presión constante',
    origen: 'Común',
    icono: 'ataque',
    efectos: [{ tipo: 'buffAtaqueTemporal', valor: 1 }],
    copias: 2,
  },
  {
    id: 'flanqueo',
    nombre: 'Flanqueo',
    origen: 'Común',
    icono: 'ataque',
    efectos: [{ tipo: 'dañoFijo', valor: 2, inabsorbible: true }],
    copias: 2,
  },
  {
    id: 'emboscada',
    nombre: 'Emboscada',
    origen: 'Común',
    icono: 'ataque',
    efectos: [invocarRefuerzo3],
    copias: 2,
  },
  // ── Común 📜 ────────────────────────────────────────────────────────────────
  {
    id: 'momento-de-duda',
    nombre: 'Momento de duda',
    origen: 'Común',
    icono: 'trama',
    efectos: [{ tipo: 'descartar', cantidad: 1 }],
    copias: 2,
  },
  {
    id: 'intimidacion',
    nombre: 'Intimidación',
    origen: 'Común',
    icono: 'trama',
    efectos: [{ tipo: 'energia', valor: -1 }],
    copias: 2,
  },
]

// ─── Exportaciones ───────────────────────────────────────────────────────────

/** 17 definiciones únicas con campo `copias`. */
export const DEFINICIONES_DRAMATURGIA = DEFS

/**
 * Mazo base de 30 cartas (expandido, IDs únicos como 'flanqueo-0', 'flanqueo-1').
 * Usar `barajar(MAZO_BASE_DRAMATURGIA, rng)` para obtener el mazo inicial de partida.
 */
export const MAZO_BASE_DRAMATURGIA: CartaDramaturgia[] = DEFS.flatMap(
  ({ copias, ...carta }) =>
    Array.from({ length: copias }, (_, i) => ({
      ...carta,
      id: `${carta.id}-${i}`,
    })),
)
