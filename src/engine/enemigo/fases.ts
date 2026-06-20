import type { FaseEnemigo } from '../../content/types'

/**
 * Devuelve la fase activa del enemigo derivada de su HP actual.
 * No guarda estado: el cambio de fase es automático.
 *
 * Algoritmo: la última fase de la lista (ordenada de mayor a menor activaA)
 * cuyo activaA ≥ hpActual.
 *
 * Ejemplo con fases = [{ activaA:80 }, { activaA:40 }]:
 *   hp=80 → fase 1  (80≥80 ✓, 40≥80 ✗ → last valid = fase 1)
 *   hp=41 → fase 1  (80≥41 ✓, 40≥41 ✗ → last valid = fase 1)
 *   hp=40 → fase 2  (80≥40 ✓, 40≥40 ✓ → last valid = fase 2)
 *   hp=10 → fase 2  (80≥10 ✓, 40≥10 ✓ → last valid = fase 2)
 */
export function faseActiva(hpActual: number, fases: FaseEnemigo[]): FaseEnemigo {
  let activa: FaseEnemigo | undefined
  for (const fase of fases) {
    if (fase.activaA >= hpActual) {
      activa = fase
    }
  }
  if (!activa) throw new Error(`faseActiva: ninguna fase cubre HP=${hpActual}`)
  return activa
}
