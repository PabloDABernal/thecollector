export type NucleoColor = 'rojo' | 'azul' | 'verde' | 'amarillo' | 'morado'

export const NUCLEO_COLORS: readonly NucleoColor[] = [
  'rojo',
  'azul',
  'verde',
  'amarillo',
  'morado',
]

/** Pool compartido: color presente = activo, color ausente = gastado. */
export type NucleoPool = Partial<Record<NucleoColor, number>>

/** Coste para activar una habilidad. */
export interface NucleoCost {
  /** null = cualquier color (⚫). Lista = uno de esos colores. */
  colors: NucleoColor[] | null
  /** Valor mínimo requerido. 1 = cualquier valor. */
  minValor: number
}

/** Modificadores de dado virtual (se aplican al relanzar). */
export type DadoVirtualMod =
  | { type: 'truncar-abajo'; min: number }
  | { type: 'truncar-arriba'; max: number }
  | { type: 'fijar'; valor: number }
  | { type: 'filtrar'; valores: number[] }
  | { type: 'expandir'; min: number; max: number }
