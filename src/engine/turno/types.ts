import type { NucleoPool } from '../nucleos'
import type { CartaDramaturgia } from '../../content/types'

// ─── Registro de efectos del último turno enemigo (para Contratiempo) ─────────

export type OrigenEfectoAplicado = 'carta-dramaturgia' | 'habilidad' | 'esbirro'

/**
 * Captura un efecto concreto que el enemigo aplicó, junto con la información
 * necesaria para revertirlo. Se usa exclusivamente por el efecto `cancelar`.
 *
 * Nota: `descarte-jugador` usa `cantidad: number` (no `cartaId`) porque
 * BattleState.mano es un contador; se actualizará cuando la mano sea una lista.
 */
export type EfectoAplicado =
  | { tipo: 'daño-lider';      cantidad: number; absorbidoPorEscudo: number; origen: OrigenEfectoAplicado }
  | { tipo: 'trama';           cantidad: number;                              origen: OrigenEfectoAplicado }
  | { tipo: 'invocar-esbirro'; instanceId: string;                            origen: OrigenEfectoAplicado }
  | { tipo: 'escudo-enemigo';  cantidad: number;                              origen: OrigenEfectoAplicado }
  | { tipo: 'curar-enemigo';   cantidad: number;                              origen: OrigenEfectoAplicado }
  | { tipo: 'energia-jugador'; cantidad: number;                              origen: OrigenEfectoAplicado }
  | { tipo: 'descarte-jugador'; cantidad: number;                             origen: OrigenEfectoAplicado }

export const ENERGIA_INICIAL = 2
export const ENERGIA_MAX = 5
export const MANO_MAX = 10
export const ACCIONES_POR_TURNO = 2
export const ESCUDO_MAX = 5

/**
 * Estado completo de una batalla en un instante dado.
 * Tipo central del engine: todas las funciones reciben y devuelven esto.
 * Diseñado para crecer: añadir campos nuevos no rompe los existentes.
 */
export interface BattleState {
  // ── Vida ─────────────────────────────────────────────────────────────────
  leaderHp: number
  leaderMaxHp: number
  enemyHp: number
  enemyMaxHp: number

  // ── Defensa del Líder ─────────────────────────────────────────────────────
  /** Fichas de escudo del Líder. Absorben daño 1:1. Tope: ESCUDO_MAX (5). */
  escudos: number
  /** Fichas de escudo del Enemigo. Sin tope. */
  escudosEnemigo: number

  // ── Estados temporales de combate ─────────────────────────────────────────
  /** +X al daño de los Ataques del enemigo este turno. Se limpia al inicio del turno del jugador. */
  buffAtaqueTemporal: number
  /** Si true, el próximo daño al Líder ignora escudo y Aliados (se consume al aplicar). */
  siguienteDañoInabsorbible: boolean

  // ── Aliados en mesa ───────────────────────────────────────────────────────
  aliados: AliAdoEnMesa[]

  // ── Esbirros del enemigo en mesa ─────────────────────────────────────────
  esbirros: EsbirroEnMesa[]
  /** Contador para IDs únicos de instancias de esbirros. */
  nextEsbirroId: number

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
  /** Mazo activo. Carta [0] = cima. */
  dramaturgia: CartaDramaturgia[]
  /** Pila de descarte. Las cartas robadas van aquí tras resolverse. */
  dramaturgiaDescarte: CartaDramaturgia[]

  // ── Cooldowns del jugador ─────────────────────────────────────────────────
  /**
   * idHabilidad → turnos restantes. 0 = disponible.
   * Cooldowns del Líder y sus Aliados.
   */
  cooldowns: Record<string, number>
  /** Cooldowns de las habilidades del Enemigo. Misma semántica. */
  cooldownsEnemigo: Record<string, number>

  // ── Registro Contratiempo ─────────────────────────────────────────────────
  /**
   * Efectos que aplicó el enemigo en su turno más reciente, en orden cronológico.
   * Se vacía al inicio de cada turno enemigo y se puebla durante él.
   * El efecto `cancelar` lee este campo para aplicar las inversas.
   */
  efectosUltimoTurnoEnemigo: EfectoAplicado[]
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

/**
 * Función que decide a dónde va el daño entrante de un ataque de esbirro.
 * Recibe el estado actual y los atributos del daño; devuelve el destino.
 * El default (siempre 'lider') se usa cuando config.politicaRedireccion es undefined.
 * La IA del Líder implementará una política más sofisticada en Fase 2+.
 */
export type PoliticaRedireccion = (
  state: BattleState,
  daño: { cantidad: number; inabsorbible: boolean },
) => { destino: 'lider' } | { destino: 'aliado'; instanceId: string }

/** Aliado del jugador en mesa. Absorbe daño redirigido. */
export interface AliAdoEnMesa {
  id: string
  hp: number
  maxHp: number
  /** 'Berserker', etc. Opcional para no romper tests existentes. */
  keywords?: string[]
  // CD, habilidades y efectos propios: Fase 2+
}

/**
 * Esbirro del enemigo en mesa.
 * keywords como string[] para evitar importar EsbirroKeyword desde content.
 */
export interface EsbirroEnMesa {
  /** ID único de esta instancia en la partida. */
  instanceId: string
  /** ID del tipo base (EsbirroTemplate.id). */
  templateId: string
  nombre: string
  vidaActual: number
  /** Daño plano por activación (no usa Núcleo). */
  ataque: number
  /** 'Defensor', etc. */
  keywords: string[]
  /** true el turno en que entra: no actúa hasta el siguiente turno enemigo. */
  recienInvocado: boolean
}
