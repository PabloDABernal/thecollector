import type { NucleoColor } from '../nucleos'
import type { EfectoAtomico, FormulaAtaque, Keyword } from '../../content/types'
import type { BattleState } from '../turno/types'
import { ENERGIA_MAX, MANO_MAX, ESCUDO_MAX } from '../turno/types'
import { aplicarDañoALider, aplicarDañoAEnemigo, type OpcionesDañoLider } from './daño'

// ─── Contexto de ejecución ───────────────────────────────────────────────────

export interface ContextoEjecucion {
  valorNucleo: number
  fuente: 'jugador' | 'enemigo'
  /** null = ⚫. Lista de colores del coste (para detectar Caos 🟣). */
  colorCoste: NucleoColor[] | null
  keywords: Keyword[]
  /** Para bloqueo por Aliado: id del aliado que intercepta el ataque. */
  idAliado?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcularDaño(formula: FormulaAtaque, valorNucleo: number): number {
  switch (formula.tipo) {
    case 'nucleo':     return valorNucleo
    case 'suma':       return valorNucleo + formula.x
    case 'multiplica': return valorNucleo * formula.x
  }
}

function esCostesCaos(color: NucleoColor[] | null): boolean {
  return color !== null && color.length === 1 && color[0] === 'morado'
}

// ─── Ejecutor principal ───────────────────────────────────────────────────────

/**
 * Aplica un efecto atómico al BattleState.
 * No maneja Caos: usa `aplicarEfectoConCaos` para la regla automática de color 🟣.
 */
export function aplicarEfecto(
  state: BattleState,
  efecto: EfectoAtomico,
  ctx: ContextoEjecucion,
): BattleState {
  switch (efecto.tipo) {
    // ── Ataque ─────────────────────────────────────────────────────────────
    case 'ataque': {
      const formula =
        efecto.umbral && ctx.valorNucleo >= 3
          ? efecto.umbral.formulaAlt
          : efecto.formula
      const dano = calcularDaño(formula, ctx.valorNucleo)

      if (ctx.fuente === 'jugador') {
        return aplicarDañoAEnemigo(state, dano)
      }
      // fuente: 'enemigo' → daño al Líder
      const opsDaño: OpcionesDañoLider = {
        inabsorbible: ctx.keywords.includes('Inabsorbible'),
        idAliado:      ctx.idAliado,
        tieneArrollar: ctx.keywords.includes('Arrollar'),
      }
      return aplicarDañoALider(state, dano, opsDaño)
    }

    // ── Defensa ────────────────────────────────────────────────────────────
    case 'defensa':
      return {
        ...state,
        escudos: Math.min(ESCUDO_MAX, state.escudos + efecto.valor),
      }

    // ── Curar ──────────────────────────────────────────────────────────────
    case 'curar':
      return {
        ...state,
        leaderHp: Math.min(state.leaderMaxHp, state.leaderHp + efecto.valor),
      }

    // ── Trama ──────────────────────────────────────────────────────────────
    case 'trama': {
      const delta = ctx.fuente === 'jugador' ? -efecto.valor : efecto.valor
      return { ...state, trama: Math.max(0, state.trama + delta) }
    }

    // ── Energía ────────────────────────────────────────────────────────────
    case 'energia':
      return {
        ...state,
        energia: Math.max(0, Math.min(ENERGIA_MAX, state.energia + efecto.valor)),
      }

    // ── Robar ──────────────────────────────────────────────────────────────
    case 'robar':
      return {
        ...state,
        mano: Math.min(MANO_MAX, state.mano + efecto.cantidad),
      }

    // ── Pendientes ─────────────────────────────────────────────────────────
    case 'cancelar':
    case 'aplicar-estado':
    case 'invocar':
    case 'modificar-dado':
      throw new Error(
        `aplicarEfecto: efecto '${efecto.tipo}' no implementado aún`,
      )
  }
}

/**
 * Aplica un efecto atómico y, si el coste es 🟣 (Caos), inflige además
 * auto-daño inabsorbible al Líder = valorNucleo.
 * Esta es la función que llama el sistema de acciones al ejecutar una habilidad.
 */
export function aplicarEfectoConCaos(
  state: BattleState,
  efecto: EfectoAtomico,
  ctx: ContextoEjecucion,
): BattleState {
  let s = aplicarEfecto(state, efecto, ctx)
  if (esCostesCaos(ctx.colorCoste)) {
    // Auto-daño inabsorbible al Líder
    s = { ...s, leaderHp: Math.max(0, s.leaderHp - ctx.valorNucleo) }
  }
  return s
}
