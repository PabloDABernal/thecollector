# Spec 07 — Mazo de Dramaturgia

> Especificación implementable. Fuente: Simulación §6, Sistema y Balanceo §8,
> GDD §3.2 (deck-out). Las cartas son `content`; la mecánica del mazo, `engine`.

## Resumen

El mazo de Dramaturgia tiene **30 cartas**. Cada carta tiene un **icono**
(⚔️ o 📜) y un **efecto propio** que siempre resuelve. El icono determina qué
habilidad ejecutará el enemigo (eso se usa en el paso del turno enemigo); el
efecto se aplica con el ejecutor que ya existe. Las cartas no llevan lógica
nueva: son datos.

## Las 30 cartas (mapeo a efectos atómicos)

| Carta | Origen | Icono | Efecto atómico | Copias |
|-------|--------|-------|----------------|--------|
| Llamada a filas | Verdugo | ⚔️ | invocar(refuerzo, vida 4) | ×2 |
| Golpe de apertura | Verdugo | ⚔️ | buffAtaqueTemporal 1 | ×2 |
| Barrido brutal | Verdugo | ⚔️ | dañoATodosAliados 2 | ×2 |
| Invocación Defensor | Verdugo | ⚔️ | invocar(Defensor, vida 6) | ×2 |
| Ultimátum | Verdugo | 📜 | dañoFijo 3 inabsorbible | ×1 |
| El Verdugo Despierta | Verdugo | 📜 | curar 3 (fuente enemigo) | ×1 |
| Las murallas ceden | Bastión | 📜 | trama 2 | ×2 |
| Refuerzo inesperado | Bastión | ⚔️ | invocar(refuerzo, vida 4) | ×2 |
| Terreno hostil | Bastión | 📜 | energia −1 | ×2 |
| Posición defensiva | Bastión | ⚔️ | defensa 2 (fuente enemigo) | ×2 |
| Grietas en la defensa | Bastión | 📜 | siguienteDañoInabsorbible | ×1 |
| Barricada derrumbada | Bastión | 📜 | trama 3 | ×1 |
| Presión constante | Común | ⚔️ | buffAtaqueTemporal 1 | ×2 |
| Momento de duda | Común | 📜 | descartar 1 | ×2 |
| Flanqueo | Común | ⚔️ | dañoFijo 2 inabsorbible | ×2 |
| Intimidación | Común | 📜 | energia −1 | ×2 |
| Emboscada | Común | ⚔️ | invocar(refuerzo, vida 3) | ×2 |

**Total: 30 cartas — 18 ⚔️ / 12 📜.**

## Mecánica del mazo

- **Construcción:** expandir las copias hasta las 30 cartas.
- **Barajado:** con el RNG con semilla (determinista). Misma semilla = mismo
  orden.
- **Robar:** se roba la carta superior; tras resolverse, va al descarte.
- **Deck-out (GDD §3.2):** cuando el mazo se vacía, se **rebaraja el descarte** y
  se sigue (mazo infinito). El mill solo sería amenaza si un escenario lo
  convierte en condición — no es el caso aquí.

> La orquestación (robar → resolver efecto → ejecutar habilidad por icono →
> actuar esbirro) es del paso del turno enemigo. Aquí solo se construye el mazo y
> se implementan barajar / robar / rebarajar.

## Criterios de aceptación (tests)

- [ ] El mazo construido tiene 30 cartas con la composición correcta (copias y
      18 ⚔️ / 12 📜).
- [ ] Robar devuelve la carta superior y reduce el mazo; la carta robada acaba en
      el descarte.
- [ ] Con la misma semilla, el barajado produce el mismo orden.
- [ ] Al vaciarse el mazo, se rebaraja el descarte y se puede seguir robando.
- [ ] Resolver el efecto de una carta representativa da el estado correcto:
      Ultimátum → −3 de vida inabsorbible al Líder; Las murallas ceden → Trama
      +2; Posición defensiva → +2 escudo del Verdugo.
