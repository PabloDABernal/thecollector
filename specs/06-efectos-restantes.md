# Spec 06 — Efectos restantes (para la Dramaturgia)

> Especificación implementable. Fuente: Simulación §6, Sistema y Balanceo §8.
> Pertenece al `engine` (ejecutor) + algún estado nuevo en `BattleState`.

## Resumen

El mazo de Dramaturgia (próximo paso) usa varios efectos que aún no existen.
Aquí los implementamos todos, con tests directos sobre el ejecutor, antes de
montar las cartas. Son piezas pequeñas e independientes.

## Efectos a implementar

1. **dañoFijo** `{ valor, inabsorbible }` — daño de valor fijo (no por Núcleo) a
   un objetivo (por defecto el Líder cuando la fuente es el enemigo). Si
   `inabsorbible`, ignora escudo y Aliados; si no, pasa por el flujo normal de
   daño. (Lo usan Ultimátum 3, Flanqueo 2, y más tarde Coladura imprevista 6 del
   jugador.)

2. **curar** (generalizar) — que pueda curar a la **fuente**, no solo al Líder.
   Si la fuente es el enemigo, cura al enemigo (El Verdugo Despierta: 3HP). Sin
   pasar del máximo.

3. **escudo del enemigo** + **defensa** (generalizar) — el enemigo puede tener
   fichas de escudo (Posición defensiva: +2 al Verdugo). El `BattleState`
   representa el escudo del enemigo. El **tope 5 es SOLO del Líder**; el enemigo
   no tiene tope. El daño al enemigo consume su escudo por absorción, igual que
   el del Líder.

4. **descartar** `{ cantidad }` — el jugador descarta N cartas de la mano (Momento
   de duda: 1). Con la mano como está modelada ahora basta con reducirla (mínimo
   0). Si la mano es una lista, elegir la carta con el RNG con semilla.

5. **buffAtaqueTemporal** `{ valor }` — modificador temporal que suma X al daño de
   los Ataques del **enemigo** durante este turno (Golpe de apertura / Presión
   constante: Ataque+1). El efecto SOLO fija el estado; el consumo (sumarlo al
   Ataque) lo hará la resolución de la habilidad del enemigo en el paso del turno
   enemigo. Se limpia al final del turno.

6. **siguienteDañoInabsorbible** — estado de un solo uso: el próximo daño al
   Líder ignora escudo y Aliados (Grietas en la defensa). El efecto fija el flag;
   el flujo de daño al Líder lo consume en el siguiente impacto y lo limpia.

7. **dañoATodosAliados** `{ valor }` — daño fijo a cada Aliado del jugador en mesa
   (Barrido brutal: 2). Añade al `BattleState` una lista mínima de Aliados del
   jugador (vacía por ahora; se poblará cuando existan las cartas de Aliado).
   Alinéala con la lógica de redirección que ya existe en `daño.ts`. Con la lista
   vacía, el efecto no hace nada — comportamiento correcto.

## Criterios de aceptación (tests)

- [ ] dañoFijo 3 inabsorbible al Líder con 2 de escudo → vida −3, escudo intacto.
- [ ] dañoFijo 2 absorbible al Líder con 2 de escudo → escudo a 0, vida intacta.
- [ ] curar 3 al enemigo a 77/80 → 80 (no pasa del máximo).
- [ ] defensa 2 al enemigo → +2 escudo; Ataque de 5 al enemigo con 2 de escudo →
      escudo 0, vida −3.
- [ ] el enemigo puede acumular más de 5 de escudo (sin tope).
- [ ] descartar 1 reduce la mano en 1 (mínimo 0).
- [ ] buffAtaqueTemporal 1 fija el estado; tras fin de turno se limpia.
- [ ] siguienteDañoInabsorbible: el próximo daño al Líder ignora escudo y se
      limpia; el daño siguiente vuelve a ser normal.
- [ ] dañoATodosAliados 2 con lista vacía → no pasa nada; con 2 Aliados → cada
      uno −2.
