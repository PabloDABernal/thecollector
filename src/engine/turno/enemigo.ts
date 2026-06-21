import type { BattleState, EfectoAplicado, OrigenEfectoAplicado } from './types'
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

// ─── Helper: diferencia → entradas de registro ───────────────────────────────

/**
 * Compara dos estados y genera las entradas de registro que explican el cambio.
 * Solo mira los campos relevantes para Contratiempo; ignora pool y mazo.
 */
function diffToRegistro(
  before: BattleState,
  after: BattleState,
  origen: OrigenEfectoAplicado,
): EfectoAplicado[] {
  const entries: EfectoAplicado[] = []

  // Daño al Líder: HP perdida y escudos consumidos
  const hpDelta = before.leaderHp - after.leaderHp
  const escudosDelta = before.escudos - after.escudos
  if (hpDelta > 0 || escudosDelta > 0) {
    entries.push({ tipo: 'daño-lider', cantidad: hpDelta, absorbidoPorEscudo: escudosDelta, origen })
  }

  // Trama ganada por el enemigo
  const tramaDelta = after.trama - before.trama
  if (tramaDelta > 0) {
    entries.push({ tipo: 'trama', cantidad: tramaDelta, origen })
  }

  // Esbirros nuevos invocados
  const nuevosEsbirros = after.esbirros.filter(
    (e) => !before.esbirros.some((b) => b.instanceId === e.instanceId),
  )
  for (const e of nuevosEsbirros) {
    entries.push({ tipo: 'invocar-esbirro', instanceId: e.instanceId, origen })
  }

  // Escudo ganado por el enemigo
  const escudoEnemigoGanado = after.escudosEnemigo - before.escudosEnemigo
  if (escudoEnemigoGanado > 0) {
    entries.push({ tipo: 'escudo-enemigo', cantidad: escudoEnemigoGanado, origen })
  }

  // HP ganada por el enemigo (curación)
  const hpEnemigoGanado = after.enemyHp - before.enemyHp
  if (hpEnemigoGanado > 0) {
    entries.push({ tipo: 'curar-enemigo', cantidad: hpEnemigoGanado, origen })
  }

  // Energía perdida por el jugador
  const energiaPerdida = before.energia - after.energia
  if (energiaPerdida > 0) {
    entries.push({ tipo: 'energia-jugador', cantidad: energiaPerdida, origen })
  }

  // Cartas descartadas de la mano del jugador
  const descartados = before.mano - after.mano
  if (descartados > 0) {
    entries.push({ tipo: 'descarte-jugador', cantidad: descartados, origen })
  }

  return entries
}

// ─── Turno completo del enemigo ───────────────────────────────────────────────

/**
 * Ejecuta un turno completo del enemigo en 6 pasos (spec 09).
 * Todas las decisiones son deterministas dados el estado + RNG con semilla.
 * Pobla `efectosUltimoTurnoEnemigo` para que el efecto `cancelar` pueda revertirlos.
 */
export function ejecutarTurnoEnemigo(
  state: BattleState,
  rng: Rng,
  config: ConfigTurnoEnemigo,
): BattleState {
  // Vaciar el registro del turno anterior al inicio de este turno
  let s: BattleState = { ...state, efectosUltimoTurnoEnemigo: [] }
  const coloresJugador = config.coloresJugador ?? COLORES_JUGADOR_PROTOTIPO
  const registro: EfectoAplicado[] = []

  // ── Paso 1: Inicio ──────────────────────────────────────────────────────────

  // 1a. Bajar cooldowns del enemigo (no se registra: no es efecto sobre el jugador)
  const cooldownsEnemigo: Record<string, number> = {}
  for (const [id, cd] of Object.entries(s.cooldownsEnemigo)) {
    cooldownsEnemigo[id] = cd > 0 ? cd - 1 : 0
  }
  s = { ...s, cooldownsEnemigo }

  // 1b. Apagar recienInvocado (transición de estado, no efecto registrable)
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
    valorNucleo: 1,
    fuente: 'enemigo' as const,
    colorCoste: null,
    keywords: [] as const,
  }
  for (const efecto of carta.efectos) {
    const before = s
    s = aplicarEfecto(s, efecto, ctxCarta)
    registro.push(...diffToRegistro(before, s, 'carta-dramaturgia'))
  }

  // ── Paso 4: Ejecutar habilidad según el icono ───────────────────────────────

  const fase = faseActiva(s.enemyHp, config.fases)
  const habilidad = elegirHabilidad(carta.icono, s.cooldownsEnemigo, s.pool, fase.habilidades)
  const nucleoElegido = elegirNucleo(habilidad.coste, s.pool, coloresJugador)

  if (nucleoElegido !== null) {
    const buffAntes = s.buffAtaqueTemporal
    const before4 = s
    const resultActivacion = activarHabilidad(s, habilidad, nucleoElegido, 'enemigo')

    if (resultActivacion.ok) {
      s = resultActivacion.state
      registro.push(...diffToRegistro(before4, s, 'habilidad'))

      // buffAtaqueTemporal: daño adicional si la habilidad es de Ataque
      const tieneAtaque = habilidad.efectos.some((e) => e.tipo === 'ataque')
      if (tieneAtaque && buffAntes > 0) {
        const before4b = s
        s = aplicarDañoALider(s, buffAntes)
        registro.push(...diffToRegistro(before4b, s, 'habilidad'))
      }

      // Pasiva del Verdugo: Proclama (+1 Trama por esbirro en mesa)
      // TODO: generalizar el sistema de presencias pasivas cuando se añadan más enemigos
      if (
        config.idHabilidadPasivaEsbirros !== undefined &&
        habilidad.id === config.idHabilidadPasivaEsbirros &&
        s.esbirros.length > 0
      ) {
        const before4c = s
        s = { ...s, trama: s.trama + s.esbirros.length }
        registro.push(...diffToRegistro(before4c, s, 'habilidad'))
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
    const before5 = s
    s = aplicarDañoALider(s, esbirro.ataque)
    registro.push(...diffToRegistro(before5, s, 'esbirro'))
  }

  // ── Paso 6: Fin — pasa el turno al jugador e inyecta el registro ────────────
  return { ...s, fase: 'jugador', efectosUltimoTurnoEnemigo: registro }
}
