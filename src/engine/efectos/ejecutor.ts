import type { NucleoColor } from '../nucleos'
import type { EfectoAtomico, FormulaAtaque, Keyword } from '../../content/types'
// Nota: la selección de efectosUmbral vs efectos base ocurre en engine/habilidades/activacion.ts
import type { BattleState, EsbirroEnMesa, EfectoAplicado } from '../turno/types'
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

/**
 * Aplica la inversa de una entrada del registro de Contratiempo.
 * Cada inversa devuelve el estado más próximo al anterior al efecto original.
 * Se aplican en orden inverso al de aplicación (último-primero).
 */
function aplicarInversa(state: BattleState, entrada: EfectoAplicado): BattleState {
  switch (entrada.tipo) {
    case 'daño-lider':
      return {
        ...state,
        leaderHp: Math.min(state.leaderMaxHp, state.leaderHp + entrada.cantidad),
        escudos:  Math.min(ESCUDO_MAX, state.escudos + entrada.absorbidoPorEscudo),
      }
    case 'trama':
      return { ...state, trama: Math.max(0, state.trama - entrada.cantidad) }
    case 'invocar-esbirro':
      return {
        ...state,
        esbirros: state.esbirros.filter((e) => e.instanceId !== entrada.instanceId),
      }
    case 'escudo-enemigo':
      return { ...state, escudosEnemigo: Math.max(0, state.escudosEnemigo - entrada.cantidad) }
    case 'curar-enemigo':
      return { ...state, enemyHp: Math.max(0, state.enemyHp - entrada.cantidad) }
    case 'energia-jugador':
      return { ...state, energia: Math.min(ENERGIA_MAX, state.energia + entrada.cantidad) }
    case 'descarte-jugador':
      return { ...state, mano: Math.min(MANO_MAX, state.mano + entrada.cantidad) }
  }
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
      const dano = calcularDaño(efecto.formula, ctx.valorNucleo)

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
    // Líder: tope ESCUDO_MAX (5). Enemigo: sin tope.
    case 'defensa':
      if (ctx.fuente === 'enemigo') {
        return { ...state, escudosEnemigo: state.escudosEnemigo + efecto.valor }
      }
      return { ...state, escudos: Math.min(ESCUDO_MAX, state.escudos + efecto.valor) }

    // ── Curar ──────────────────────────────────────────────────────────────
    // Cura a la fuente: jugador → Líder; enemigo → Enemigo.
    case 'curar':
      if (ctx.fuente === 'enemigo') {
        return {
          ...state,
          enemyHp: Math.min(state.enemyMaxHp, state.enemyHp + efecto.valor),
        }
      }
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

    // ── Invocar ────────────────────────────────────────────────────────────
    case 'invocar': {
      const id = state.nextEsbirroId
      const esbirro: EsbirroEnMesa = {
        instanceId: `esbirro-${id}`,
        templateId: efecto.esbirro.id,
        nombre: efecto.esbirro.nombre,
        vidaActual: efecto.esbirro.vida,
        ataque: efecto.esbirro.ataque,
        keywords: [...efecto.esbirro.keywords],
        recienInvocado: true,
      }
      return {
        ...state,
        esbirros: [...state.esbirros, esbirro],
        nextEsbirroId: id + 1,
      }
    }

    // ── Daño fijo ──────────────────────────────────────────────────────────
    // Enemigo → daña al Líder (con opción inabsorbible).
    // Jugador → daña al Enemigo.
    case 'dañoFijo': {
      if (ctx.fuente === 'enemigo') {
        return aplicarDañoALider(state, efecto.valor, {
          inabsorbible: efecto.inabsorbible,
        })
      }
      return aplicarDañoAEnemigo(state, efecto.valor)
    }

    // ── Descartar ──────────────────────────────────────────────────────────
    case 'descartar':
      return { ...state, mano: Math.max(0, state.mano - efecto.cantidad) }

    // ── Buff de ataque temporal ────────────────────────────────────────────
    // Acumula. Se limpia al inicio del turno del jugador (iniciarTurnoJugador).
    case 'buffAtaqueTemporal':
      return { ...state, buffAtaqueTemporal: state.buffAtaqueTemporal + efecto.valor }

    // ── Siguiente daño inabsorbible ────────────────────────────────────────
    // Flag de un solo uso; lo consume aplicarDañoALider.
    case 'siguienteDañoInabsorbible':
      return { ...state, siguienteDañoInabsorbible: true }

    // ── Daño a todos los Aliados ───────────────────────────────────────────
    case 'dañoATodosAliados': {
      if (state.aliados.length === 0) return state
      const nuevosAliados = state.aliados.map((a) => ({
        ...a,
        hp: Math.max(0, a.hp - efecto.valor),
      }))
      return { ...state, aliados: nuevosAliados }
    }

    // ── Cancelar (Contratiempo) ────────────────────────────────────────────
    // Revierte efectos del último turno del enemigo según el alcance.
    // 'solo-daño': deshace entradas tipo daño-lider (cualquier origen).
    // 'carta-dramaturgia-entera': deshace todas las entradas con origen 'carta-dramaturgia'.
    // Las inversas se aplican en orden inverso al de aplicación.
    // Las entradas revertidas se eliminan del registro para evitar doble reversión.
    case 'cancelar': {
      const { alcance } = efecto
      const todosEfectos = state.efectosUltimoTurnoEnemigo

      const aRevertir =
        alcance === 'solo-daño'
          ? todosEfectos.filter((e) => e.tipo === 'daño-lider')
          : todosEfectos.filter((e) => e.origen === 'carta-dramaturgia')

      let s = state
      for (const entrada of [...aRevertir].reverse()) {
        s = aplicarInversa(s, entrada)
      }

      const revertidosSet = new Set<EfectoAplicado>(aRevertir)
      return {
        ...s,
        efectosUltimoTurnoEnemigo: todosEfectos.filter((e) => !revertidosSet.has(e)),
      }
    }

    // ── Pendientes ─────────────────────────────────────────────────────────
    case 'aplicar-estado':
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
