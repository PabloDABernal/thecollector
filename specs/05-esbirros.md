# Spec 05 — Sistema de esbirros

> Especificación implementable. Fuente: GDD §3.8, Sistema y Balanceo §6.5,
> Simulación §0 (#6) y §4.4. Pertenece al `engine` (efecto `invocar`, reglas de
> tablero) + `content` (datos de los esbirros).

## Resumen

Los esbirros son unidades del enemigo con vida e iniciativa propia y daño bajo.
Sin límite de presencia, pero **solo 1 actúa por turno enemigo**. Su valor real
es la **presencia pasiva**: mientras están en mesa aportan efectos definidos por
el enemigo y/o el escenario.

## Esbirro como datos

Un esbirro tiene: `vida`, `ataque` (plano, no por Núcleo) y, opcionalmente,
una `keyword` (Defensor). La vida es un **parámetro** de la invocación, no un
tipo nuevo por cada valor.

Tipos del prototipo:
- **Esbirro refuerzo:** vida 4, ataque 1.
- **Esbirro Defensor:** vida 6, ataque 1, keyword Defensor.
- (Una carta de Dramaturgia invoca un refuerzo de vida 3: mismo tipo, vida
  distinta.)

## Efecto `invocar`

Implementa el efecto atómico `invocar` (estaba en stub): añade un esbirro a la
mesa del enemigo con los stats indicados. El esbirro entra **en calentamiento**:
NO actúa el turno en que es invocado; podrá actuar a partir del turno enemigo
siguiente.

## Reglas de tablero

**Ahora (este paso):**
- El `BattleState` representa la lista de esbirros del enemigo en mesa.
- Cada esbirro lleva su vida actual y una marca de "recién invocado".
- Un esbirro a 0 de vida se elimina de la mesa.

**Más adelante (paso del turno del enemigo) — NO implementar ahora:**
- Selección: 1 esbirro actúa por turno, aleatorio **con filtro de validez**.
- Presencia pasiva, acumulable, definida por enemigo y escenario:
  - Verdugo: +1 al daño de Trama de Proclama por cada esbirro en mesa.
  - Bastión: +1 escudo persistente al Verdugo al inicio del turno enemigo por
    cada esbirro.

## Criterios de aceptación (tests)

- [ ] El efecto `invocar` añade un esbirro a la mesa del enemigo con la
      vida/ataque dados.
- [ ] Un esbirro recién invocado queda marcado como "no actúa este turno".
- [ ] El `BattleState` refleja correctamente la lista tras varias invocaciones.
- [ ] Un esbirro a 0 de vida se elimina de la mesa.
