import type { NucleoPool } from '../nucleos'

// Placeholder: se reemplazará con el tipo completo en la spec de Dramaturgia.
export interface DramaturgiaCard {
  id: string
}

export const ENERGIA_INICIAL = 2
export const ENERGIA_MAX = 5
export const MANO_MAX = 10
export const ACCIONES_POR_TURNO = 2

/**
 * Estado completo de una batalla en un instante dado.
 * Tipo central del engine: todas las funciones reciben y devuelven esto.
 * Diseñado para crecer: añadir campos nuevos no rompe los existentes.
 */
export interface BattleState {
  // ── Vida ─────────────────────────────────────────────────────────────────
  leaderHp: number
  enemyHp: number

  // ── Recursos del jugador ─────────────────────────────────────────────────
  /** 0-5. Empieza en ENERGIA_INICIAL (2). */
  energia: number
  /** Número de cartas en mano. 0-10. Sin tipos de carta por ahora. */
  mano: number

  // ── Pool compartido ───────────────────────────────────────────────────────
  pool: NucleoPool

  // ── Control de turno ─────────────────────────────────────────────────────
  /** Número de turno (empieza en 1, sube cada turno del jugador). */
  turno: number
  fase: 'jugador' | 'enemigo'
  /** Acciones que quedan en este turno del jugador. */
  accionesRestantes: number
  /** true cuando se activó Combo este turno (solo 1 Combo por turno). */
  comboActivo: boolean

  // ── Trama ─────────────────────────────────────────────────────────────────
  trama: number

  // ── Dramaturgia (mazo del enemigo) ────────────────────────────────────────
  /** Stub: se llenará cuando implementemos la spec de Dramaturgia. */
  dramaturgia: DramaturgiaCard[]

  // ── Cooldowns del jugador ─────────────────────────────────────────────────
  /**
   * idHabilidad → turnos restantes. 0 = disponible.
   * Solo cooldowns del Líder/Aliados. Enemigo tendrá los suyos aparte.
   */
  cooldowns: Record<string, number>
}

/** Tipos de acción disponibles durante el turno del jugador. */
export type TipoAccion =
  | 'canalizar'           // siempre disponible; +1 carta (máx 10)
  | 'generar-energia'     // siempre disponible; +1 Energía (máx 5)
  // ── Pendientes (requieren contenido del juego) ────────────────────────────
  | 'activar-habilidad-lider'   // necesita habilidades del Líder (Fase 1 cont.)
  | 'activar-habilidad-aliado'  // necesita aliados en mesa (Fase 2+)
  | 'bajar-carta'               // necesita carta en mano con coste pagable (Fase 2+)

export type EleccionInicio = 'generar-energia' | 'canalizar'
