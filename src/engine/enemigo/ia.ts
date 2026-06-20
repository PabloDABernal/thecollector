import type { NucleoColor, NucleoPool } from '../nucleos'
import type { Habilidad, CosteHabilidad, IconoDramaturgia } from '../../content/types'
import { NUCLEO_COLORS } from '../nucleos'

// ─── Colores del jugador en el prototipo ─────────────────────────────────────

/** Colores del Líder en el prototipo: 🔴🔵🟣. El Forjador usa rojo, azul y morado. */
export const COLORES_JUGADOR_PROTOTIPO: NucleoColor[] = ['rojo', 'azul', 'morado']

// ─── Orden determinista de colores (para desempates) ─────────────────────────

const ORDEN_COLOR = NUCLEO_COLORS  // ['rojo','azul','verde','amarillo','morado']

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** true si la habilidad tiene como primer efecto el tipo indicado. */
function tipoEfectoPrimario(h: Habilidad, tipo: 'ataque' | 'trama'): boolean {
  return h.efectos[0]?.tipo === tipo
}

/** true si existe en el pool un Núcleo que satisfaga el coste (color + valorMinimo). */
function esPagable(coste: CosteHabilidad, pool: NucleoPool): boolean {
  const coloresValidos = coste.color ?? [...NUCLEO_COLORS]
  return coloresValidos.some((c) => {
    const v = pool[c]
    return v !== undefined && v >= coste.valorMinimo
  })
}

// ─── Elegir habilidad ─────────────────────────────────────────────────────────

/**
 * Dada la carta de Dramaturgia (icono), el estado de cooldowns y el pool,
 * devuelve la habilidad que ejecutará el enemigo.
 *
 * ⚔️: firma (mayor CD, valorMinimo>1) si disponible + pagable; si no, básica CD1.
 * 📜: especial (mayor CD de trama) si disponible + pagable; si no, básica CD1.
 */
export function elegirHabilidad(
  icono: IconoDramaturgia,
  cooldownsEnemigo: Record<string, number>,
  pool: NucleoPool,
  habilidades: Habilidad[],
): Habilidad {
  const tipo = icono  // 'ataque' | 'trama' — coincide con el tipo de efecto primario

  // Separar por tipo de efecto primario
  const matching = habilidades.filter((h) => tipoEfectoPrimario(h, tipo))

  // Firma = la de mayor CD (no la básica CD1)
  const firma = matching
    .filter((h) => h.coste.cd > 1)
    .sort((a, b) => b.coste.cd - a.coste.cd)[0]

  if (firma) {
    const cdActual = cooldownsEnemigo[firma.id] ?? 0
    const disponible = cdActual === 0
    if (disponible && esPagable(firma.coste, pool)) {
      return firma
    }
  }

  // Básica = CD1 del tipo
  const basica = matching.find((h) => h.coste.cd === 1)
  if (!basica) throw new Error(`elegirHabilidad: no hay habilidad básica de tipo '${tipo}'`)
  return basica
}

// ─── Elegir Núcleo ────────────────────────────────────────────────────────────

/**
 * Elige el Núcleo a gastar entre los válidos según el coste.
 * Prioridades:
 *   1. Color del jugador + valor ≥3 (denegación: priva al jugador de Núcleos útiles).
 *      Entre los candidatos → el de mayor valor; empate → orden fijo de color.
 *   2. Si no → mayor valor entre todos los válidos; empate → orden fijo de color.
 *
 * Devuelve null si no hay ningún Núcleo válido (coste no pagable).
 */
export function elegirNucleo(
  coste: CosteHabilidad,
  pool: NucleoPool,
  coloresJugador: NucleoColor[] = COLORES_JUGADOR_PROTOTIPO,
): NucleoColor | null {
  const coloresValidos = coste.color ?? [...NUCLEO_COLORS]

  // Todos los Núcleos que satisfacen el coste
  const candidatos = coloresValidos.flatMap((c) => {
    const v = pool[c]
    if (v === undefined || v < coste.valorMinimo) return []
    return [{ color: c, valor: v }] as { color: NucleoColor; valor: number }[]
  })

  if (candidatos.length === 0) return null

  // Comparador: mayor valor, empate → posición en ORDEN_COLOR (el primero gana)
  const comparar = (
    a: { color: NucleoColor; valor: number },
    b: { color: NucleoColor; valor: number },
  ) => {
    if (b.valor !== a.valor) return b.valor - a.valor
    return ORDEN_COLOR.indexOf(a.color) - ORDEN_COLOR.indexOf(b.color)
  }

  // Prioridad 1: denegación — color del jugador + valor ≥3
  const negacion = candidatos
    .filter((c) => coloresJugador.includes(c.color) && c.valor >= 3)
    .sort(comparar)

  if (negacion.length > 0) return negacion[0]!.color

  // Prioridad 2: mayor valor disponible
  return [...candidatos].sort(comparar)[0]!.color
}
