import type { BattleState } from '../turno/types'

// ─── Daño al Líder ────────────────────────────────────────────────────────────

export interface OpcionesDañoLider {
  /** Ignora escudos y Aliados; va directo a la vida del Líder. */
  inabsorbible?: boolean
  /** Si el daño debe redirigirse a este Aliado primero. */
  idAliado?: string
  /** Con Arrollar, el exceso de daño sobre el Aliado pasa al Líder. */
  tieneArrollar?: boolean
}

/**
 * Aplica daño al Líder con todas las reglas de absorción:
 *   1. Inabsorbible → directo a vida, sin escudos ni aliados.
 *   2. Aliado bloqueando → consume HP del aliado; exceso perdido (o al Líder si Arrollar).
 *   3. Normal → escudos absorben 1:1, resto a la vida.
 */
export function aplicarDañoALider(
  state: BattleState,
  cantidad: number,
  opciones?: OpcionesDañoLider,
): BattleState {
  if (cantidad <= 0) return state

  // ── Inabsorbible: ignora escudos y aliados ────────────────────────────────
  if (opciones?.inabsorbible) {
    return { ...state, leaderHp: Math.max(0, state.leaderHp - cantidad) }
  }

  // ── Bloqueo por Aliado ────────────────────────────────────────────────────
  if (opciones?.idAliado) {
    const idx = state.aliados.findIndex((a) => a.id === opciones.idAliado)
    if (idx >= 0) {
      const aliado = state.aliados[idx]!
      const dañoAbsorbido = Math.min(aliado.hp, cantidad)
      const exceso = cantidad - dañoAbsorbido
      const nuevosAliados = state.aliados.map((a, i) =>
        i === idx ? { ...a, hp: a.hp - dañoAbsorbido } : a,
      )
      let s: BattleState = { ...state, aliados: nuevosAliados }

      // Exceso con Arrollar → pasa al Líder (a través de escudos normales)
      if (exceso > 0 && opciones.tieneArrollar) {
        s = aplicarDañoALider(s, exceso) // escudos normales, sin opciones
      }
      return s
    }
  }

  // ── Absorción por escudos ─────────────────────────────────────────────────
  const dañoResidual = Math.max(0, cantidad - state.escudos)
  const escudosRestantes = Math.max(0, state.escudos - cantidad)
  return {
    ...state,
    escudos: escudosRestantes,
    leaderHp: Math.max(0, state.leaderHp - dañoResidual),
  }
}

// ─── Daño al Enemigo ─────────────────────────────────────────────────────────

/** Aplica daño directo al enemigo (sin mecánicas de escudo por ahora). */
export function aplicarDañoAEnemigo(state: BattleState, cantidad: number): BattleState {
  if (cantidad <= 0) return state
  return { ...state, enemyHp: Math.max(0, state.enemyHp - cantidad) }
}
