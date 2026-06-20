import type { EsbirroTemplate } from './types'

/**
 * Esbirro genérico de refuerzo.
 * vida 4, ataque 1, sin keywords.
 * Una carta de Dramaturgia lo invoca con vida 3 en su lugar: mismo tipo, vida distinta.
 */
export const ESBIRRO_REFUERZO: EsbirroTemplate = {
  id: 'esbirro-refuerzo',
  nombre: 'Esbirro refuerzo',
  vida: 4,
  ataque: 1,
  keywords: [],
}

/**
 * Esbirro con keyword Defensor.
 * vida 6, ataque 1. Tiene prioridad de bloqueo (implementado en turno enemigo, Fase 1 cont.).
 */
export const ESBIRRO_DEFENSOR: EsbirroTemplate = {
  id: 'esbirro-defensor',
  nombre: 'Esbirro Defensor',
  vida: 6,
  ataque: 1,
  keywords: ['Defensor'],
}
