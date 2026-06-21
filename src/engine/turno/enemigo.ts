import type { BattleState } from './types'
import type { FaseEnemigo } from '../../content/types'
import type { NucleoColor } from '../nucleos'
import type { Rng } from '../rng'
import { faseActiva } from '../enemigo/fases'
import { elegirHabilidad, elegirNucleo, COLORES_JUGADOR_PROTOTIPO } from '../enemigo/ia'
import { activarHabilidad } from '../habilidades/activacion'
import { aplicarDañoALider } from '../efectos/daño'
import { robarCarta } from '../dramaturgia/mazo'
import { aplicarEfecto } from '../efectos/ejecutor'

// ─── Configuración del turno del enemigo ─────────────────────────────────────

export interface ConfigTurnoEnemigo {
  fases: FaseEnemigo[]
  coloresJugador?: NucleoColor[]
  /**
   * ID de la habilidad de Trama cuya pasiva activa +1 Trama por esbirro en mesa.
   * Solo el Verdugo tiene esta regla (Proclama). Generalizar presencias pasivas:
   * tarea futura.
   */
  idHabilidadPasivaEsbirros?: string
}

// ─── Turno completo del enemigo ───────────────────────────────────────────────

/**
 * Ejecuta un turno completo del enemigo en 6 pasos (spec 09).
 * Todas las decisiones son deterministas dados el estado + RNG con semilla.
 */
export function ejecutarTurnoEnemigo(
  state: BattleState,
  rng: Rng,
  config: ConfigTurnoEnemigo,
): BattleState {
  let s = state
  const coloresJugador = config.coloresJugador ?? COLORES_JUGADOR_PROTOTIPO

  // ── Paso 1: Inicio ──────────────────────────────────────────────────────────

  // 1a. Bajar cooldowns del enemigo (simétrico al jugador)
  const cooldownsEnemigo: Record<string, number> = {}
  for (const [id, cd] of Object.entries(s.cooldownsEnemigo)) {
    cooldownsEnemigo[id] = cd > 0 ? cd - 1 : 0
  }
  s = { ...s, cooldownsEnemigo }

  // 1b. Apagar recienInvocado: los esbirros invocados el turno anterior ya pueden actuar
  if (s.esbirros.some((e) => e.recienInvocado)) {
    s = {
      ...s,
      esbirros: s.esbirros.map((e) =>
        e.recienInvocado ? { ...e, recienInvocado: false } : e,
      ),
    }
  }

  // TODO (Bastión pasiva): +1 escudo al Verdugo por esbirro en mesa
  // Se activa cuando el escenario es Bastión; no implementar hasta la spec del escenario.

  // ── Paso 2: Robar carta de Dramaturgia ──────────────────────────────────────
  const { carta, state: sConDescarte } = robarCarta(s, rng)
  s = sConDescarte

  // ── Paso 3: Resolver el efecto propio de la carta (fuente = enemigo) ────────
  const ctxCarta = {
    valorNucleo: 1,             // los efectos de carta no usan Núcleo
    fuente: 'enemigo' as const,
    colorCoste: null,
    keywords: [] as const,
  }
  for (const efecto of carta.efectos) {
    s = aplicarEfecto(s, efecto, ctxCarta)
  }

  // ── Paso 4: Ejecutar habilidad según el icono ───────────────────────────────

  const fase = faseActiva(s.enemyHp, config.fases)
  const habilidad = elegirHabilidad(carta.icono, s.cooldownsEnemigo, s.pool, fase.habilidades)
  const nucleoElegido = elegirNucleo(habilidad.coste, s.pool, coloresJugador)

  if (nucleoElegido !== null) {
    const buffAntes = s.buffAtaqueTemporal
    const resultActivacion = activarHabilidad(s, habilidad, nucleoElegido, 'enemigo')

    if (resultActivacion.ok) {
      s = resultActivacion.state

      // buffAtaqueTemporal: si la habilidad tiene efecto de Ataque, daño extra al Líder
      const tieneAtaque = habilidad.efectos.some((e) => e.tipo === 'ataque')
      if (tieneAtaque && buffAntes > 0) {
        // Daño absorbible (shields), mismas reglas que el ataque principal
        // TODO: respetar Defensor/Aliados cuando se implementen
        s = aplicarDañoALider(s, buffAntes)
      }

      // Pasiva del Verdugo: Proclama (+1 Trama por esbirro en mesa)
      // TODO: generalizar el sistema de presencias pasivas cuando se añadan más enemigos
      if (
        config.idHabilidadPasivaEsbirros !== undefined &&
        habilidad.id === config.idHabilidadPasivaEsbirros &&
        s.esbirros.length > 0
      ) {
        s = { ...s, trama: s.trama + s.esbirros.length }
      }
    }
    // Si activarHabilidad falla (nucleo-invalido inesperado), continúa sin habilidad.
  }

  // ── Paso 5: Actúa un esbirro ────────────────────────────────────────────────

  // Candidatos: esbirros que NO son recienInvocado (los invocados en paso 3 no actúan)
  // TODO (Defensor): los Defensores tienen prioridad de ataque
  // TODO (Aliados jugador): el daño del esbirro se redirige al Aliado más frágil
  const candidatos = s.esbirros.filter((e) => !e.recienInvocado)
  if (candidatos.length > 0) {
    const idx = Math.floor(rng() * candidatos.length)
    const esbirro = candidatos[idx]!
    s = aplicarDañoALider(s, esbirro.ataque)
  }

  // ── Paso 6: Fin — pasa el turno al jugador ──────────────────────────────────
  return { ...s, fase: 'jugador' }
}
