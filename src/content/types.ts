/**
 * Content Schema — la fuente de datos del juego.
 * Habilidades, cartas y efectos se describen AQUÍ como datos tipados.
 * El engine (ejecutor) los interpreta; nunca hay código por carta.
 */

import type { NucleoColor } from '../engine/nucleos'

// ─── Esbirros ─────────────────────────────────────────────────────────────────

/** Keywords propias de los esbirros (distintas de las habilidades del Líder). */
export type EsbirroKeyword = 'Defensor'

/**
 * Plantilla de un tipo de esbirro.
 * La vida es un parámetro de la invocación, no hay un tipo por cada valor.
 */
export interface EsbirroTemplate {
  id: string
  nombre: string
  /** Vida base. La invocación puede sobrescribirla (p. ej. refuerzo de vida 3). */
  vida: number
  /** Daño plano por activación (no usa Núcleo). */
  ataque: number
  keywords: EsbirroKeyword[]
}

// ─── Fórmulas de Ataque ───────────────────────────────────────────────────────

export type FormulaAtaque =
  | { tipo: 'nucleo' }               // daño = valorNucleo
  | { tipo: 'suma'; x: number }      // daño = valorNucleo + x
  | { tipo: 'multiplica'; x: number } // daño = valorNucleo × x

// ─── Efectos atómicos ─────────────────────────────────────────────────────────

export type EfectoAtomico =
  // ── Núcleo combativo — implementados ────────────────────────────────────────
  | {
      tipo: 'ataque'
      formula: FormulaAtaque
    }
  | { tipo: 'defensa'; valor: number }   // +X escudos al Líder (tope 5)
  | { tipo: 'curar'; valor: number }     // +X HP al Líder (sin pasar del máximo)
  | { tipo: 'trama'; valor: number }     // mueve el contador de Trama
  | { tipo: 'energia'; valor: number }   // +/- Energía (clamp 0-5)
  | { tipo: 'robar'; cantidad: number }  // roba cartas (tope mano 10)
  | { tipo: 'invocar'; esbirro: EsbirroTemplate }  // añade esbirro al tablero enemigo
  // ── Pendientes (tipo definido, ejecutor lanza error claro) ──────────────────
  | { tipo: 'cancelar'; alcance: string }
  | { tipo: 'aplicar-estado'; estado: string; duracion: number }
  | { tipo: 'modificar-dado'; datos: Record<string, unknown> }

// ─── Keywords ─────────────────────────────────────────────────────────────────

export type Keyword =
  | 'Arrollar'      // exceso de daño al Líder al derrotar Aliado
  | 'Combo'         // concede 3ª acción si se usa esta habilidad
  | 'Inabsorbible'  // el daño ignora escudos y Aliados
  // más keywords en Fases siguientes

// ─── Coste de habilidad / carta ───────────────────────────────────────────────

export interface CosteHabilidad {
  /** Cooldown: turnos que tarda en volver a estar disponible. Mínimo 1. */
  cd: number
  /** null = ⚫ (cualquier color). Lista = uno de esos colores. */
  color: NucleoColor[] | null
  /** Valor mínimo del Núcleo requerido. Por defecto 1. */
  valorMinimo: number
  /** Solo cartas: coste adicional en Energía. */
  energia?: number
}

// ─── Habilidad / Carta ────────────────────────────────────────────────────────

export interface Habilidad {
  id: string
  nombre: string
  efectos: EfectoAtomico[]
  /**
   * Lista alternativa de efectos que se ejecuta cuando valorNucleo ≥ 3.
   * Si está ausente, siempre se usan los `efectos` base.
   */
  efectosUmbral?: EfectoAtomico[]
  coste: CosteHabilidad
  keywords: Keyword[]
}

/** Carta de mano: habilidad con coste de Energía obligatorio. */
export interface Carta extends Habilidad {
  coste: CosteHabilidad & { energia: number }
}

// ─── Líder ────────────────────────────────────────────────────────────────────

export interface Lider {
  id: string
  nombre: string
  hp: number
  /** Las 4 habilidades del Líder (CD 1/2/3/4). */
  habilidades: [Habilidad, Habilidad, Habilidad, Habilidad]
  // Niveles 2 y 3 de cada habilidad: Fase 2+
}

// ─── Enemigo ─────────────────────────────────────────────────────────────────

/**
 * Fase adicional de un Enemigo.
 * Se activa cuando su HP cae a `umbral` o por debajo.
 * `habilidades` reemplaza por completo el set de la fase anterior.
 */
export interface FaseEnemigo {
  umbral: number
  habilidades: Habilidad[]
}

export interface Enemigo {
  id: string
  nombre: string
  hpTotal: number
  /** Habilidades de la primera fase (estado inicial). */
  habilidades: Habilidad[]
  /**
   * Fases adicionales ordenadas por umbral descendente.
   * La lógica de cambio de fase se implementa en el engine (Fase 1 cont.).
   */
  fases: FaseEnemigo[]
}
