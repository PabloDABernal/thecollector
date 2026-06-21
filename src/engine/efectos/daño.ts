import type {
  BattleState,
  EfectoAplicado,
  OrigenEfectoAplicado,
  PoliticaRedireccion,
} from '../turno/types'

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
 *   0. Flag `siguienteDañoInabsorbible` → inabsorbible y se consume.
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

  // ── Flag de un solo uso ───────────────────────────────────────────────────
  if (state.siguienteDañoInabsorbible) {
    return {
      ...state,
      siguienteDañoInabsorbible: false,
      leaderHp: Math.max(0, state.leaderHp - cantidad),
    }
  }

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

// ─── Resolución de daño entrante con política de redirección ─────────────────

export interface DañoEntrante {
  cantidad: number
  inabsorbible: boolean
  /** Con Arrollar, el exceso sobre el Aliado pasa al Líder. */
  tieneArrollar?: boolean
}

/**
 * Aplica el daño de un atacante (esbirro, habilidad) al destino correcto:
 *   1. Inabsorbible o flag activo → siempre al Líder, ignora política y escudos.
 *   2. Berserker en mesa → fuerza destino a ese Aliado, ignora la política.
 *   3. En otro caso → usa la política para elegir destino (lider | aliado).
 *   4. Sin Arrollar, el exceso sobre el Aliado se pierde (no pasa al Líder).
 * Solo registra en efectosUltimoTurnoEnemigo cuando el daño llega al Líder.
 */
export function resolverDañoEntrante(
  state: BattleState,
  daño: DañoEntrante,
  politica: PoliticaRedireccion,
  origen: OrigenEfectoAplicado,
): BattleState {
  const { cantidad, inabsorbible, tieneArrollar = false } = daño
  if (cantidad <= 0) return state

  // ── Inabsorbible o flag activo ────────────────────────────────────────────
  if (inabsorbible || state.siguienteDañoInabsorbible) {
    const before = state
    // aplicarDañoALider consume el flag si estaba activo, o aplica la opción
    const s = aplicarDañoALider(state, cantidad, { inabsorbible })
    const hpDelta = before.leaderHp - s.leaderHp
    if (hpDelta > 0) {
      return {
        ...s,
        efectosUltimoTurnoEnemigo: [
          ...s.efectosUltimoTurnoEnemigo,
          { tipo: 'daño-lider' as const, cantidad: hpDelta, absorbidoPorEscudo: 0, origen },
        ],
      }
    }
    return s
  }

  // ── Berserker fuerza la redirección ──────────────────────────────────────
  const berserker = state.aliados.find((a) => (a.keywords ?? []).includes('Berserker'))
  const destino = berserker
    ? ({ destino: 'aliado' as const, instanceId: berserker.id })
    : politica(state, { cantidad, inabsorbible })

  // ── Destino: Aliado ───────────────────────────────────────────────────────
  if (destino.destino === 'aliado') {
    const aliado = state.aliados.find((a) => a.id === destino.instanceId)
    if (!aliado) {
      // Aliado no encontrado: fallback defensivo al Líder
      const before = state
      const s = aplicarDañoALider(state, cantidad)
      const hpDelta = before.leaderHp - s.leaderHp
      const escudosDelta = before.escudos - s.escudos
      if (hpDelta > 0 || escudosDelta > 0) {
        return {
          ...s,
          efectosUltimoTurnoEnemigo: [
            ...s.efectosUltimoTurnoEnemigo,
            { tipo: 'daño-lider' as const, cantidad: hpDelta, absorbidoPorEscudo: escudosDelta, origen },
          ],
        }
      }
      return s
    }

    const dañoAbsorbido = Math.min(aliado.hp, cantidad)
    const exceso = cantidad - dañoAbsorbido
    let s: BattleState = {
      ...state,
      aliados: state.aliados.map((a) =>
        a.id === aliado.id ? { ...a, hp: Math.max(0, a.hp - dañoAbsorbido) } : a,
      ),
    }
    // Aliado absorbe: no hay tipo 'daño-aliado' en EfectoAplicado → sin registro

    if (exceso > 0 && tieneArrollar) {
      const before = s
      s = aplicarDañoALider(s, exceso)
      const hpDelta = before.leaderHp - s.leaderHp
      const escudosDelta = before.escudos - s.escudos
      if (hpDelta > 0 || escudosDelta > 0) {
        s = {
          ...s,
          efectosUltimoTurnoEnemigo: [
            ...s.efectosUltimoTurnoEnemigo,
            { tipo: 'daño-lider' as const, cantidad: hpDelta, absorbidoPorEscudo: escudosDelta, origen },
          ],
        }
      }
    }
    return s
  }

  // ── Destino: Líder (ruta normal) ──────────────────────────────────────────
  const before = state
  const s = aplicarDañoALider(state, cantidad)
  const hpDelta = before.leaderHp - s.leaderHp
  const escudosDelta = before.escudos - s.escudos
  if (hpDelta > 0 || escudosDelta > 0) {
    return {
      ...s,
      efectosUltimoTurnoEnemigo: [
        ...s.efectosUltimoTurnoEnemigo,
        { tipo: 'daño-lider' as const, cantidad: hpDelta, absorbidoPorEscudo: escudosDelta, origen },
      ],
    }
  }
  return s
}

// ─── Daño al Enemigo ─────────────────────────────────────────────────────────

/**
 * Aplica daño al enemigo.
 * Los escudos del enemigo absorben 1:1, sin tope de acumulación.
 */
export function aplicarDañoAEnemigo(state: BattleState, cantidad: number): BattleState {
  if (cantidad <= 0) return state
  const dañoResidual = Math.max(0, cantidad - state.escudosEnemigo)
  const escudosRestantes = Math.max(0, state.escudosEnemigo - cantidad)
  return {
    ...state,
    escudosEnemigo: escudosRestantes,
    enemyHp: Math.max(0, state.enemyHp - dañoResidual),
  }
}
