# Spec 03 — Efectos atómicos (Content Schema)

> Especificación implementable. Fuente: Devkit §2, Sistema y Balanceo §5/§9/§10,
> GDD §10. Pertenece a `content/` (tipos de datos) + `engine/` (ejecutor).

## Resumen

Una habilidad o carta **no se programa a mano**. Se describe como **datos**: uno
o más **efectos atómicos** + una **capa de coste** + **keywords**. El motor
interpreta esos datos. Así se escala a cientos de cartas sin código nuevo por
carta.

## Forma de una habilidad / carta

- `efectos`: lista de efectos atómicos (normalmente 1, a veces varios).
- `coste`: `{ cd, color, valorMinimo, energia? }`.
- `keywords`: lista (`Arrollar`, `Combo`, …).

## Capa de coste

- `cd`: entero ≥ 1.
- `color`: ⚫ (cualquiera) | un color | lista de colores (notación de la spec 02).
- `valorMinimo`: para ⚫3, 🔴3, etc. (por defecto 1).
- `energia`: solo cartas.

## Catálogo de efectos atómicos

**A implementar ahora (núcleo combativo):**

- **Ataque** `{ formula, umbral? }` — daño según la fórmula con el valor del
  Núcleo gastado. Objetivo por defecto: el rival.
  - `formula`: `{ tipo: 'nucleo' }` → daño = valorNucleo
  - `{ tipo: 'suma', x }` → daño = valorNucleo + x
  - `{ tipo: 'multiplica', x }` → daño = valorNucleo × x
  - `umbral?`: `{ formulaAlt }` → si valorNucleo ≥ 3, usa `formulaAlt` en vez de
    la base.
- **Defensa** `{ valor }` — crea X fichas de escudo persistentes en el Líder.
  Tope global **5**. Solo el Líder.
- **Curar** `{ valor }` — recupera HP, sin pasar del máximo.
- **Trama** `{ valor }` — mueve el contador. Dirección por contexto (jugador
  resta, enemigo suma). Clamp a 0.
- **Energia** `{ valor }` — +/- energía (clamp 0-5).
- **Robar** `{ cantidad }` — roba cartas (tope de mano 10).

**A definir como tipo pero SIN implementar todavía (stub que lanza error claro):**

- `Cancelar { alcance }`, `AplicarEstado { tipo, duracion }`, `Invocar { … }`,
  `ModificarDado { … }`.

## Regla de color — Caos (🟣)

Toda habilidad cuyo **coste sea de color 🟣** inflige, **además** de su efecto
principal, auto-daño = **valor del Núcleo gastado**, a la vida del Líder. No es
un efecto que se escriba en la carta: es una regla que el ejecutor aplica
automáticamente al detectar coste 🟣.

## Umbral ≥3

Si el Núcleo gastado vale ≥3, se aplica la variante de umbral del efecto (si la
tiene). 50% en rango 1-4. No aplica en CD1.

## Aplicación de daño (escudos, Aliados, Arrollar)

> **Decisión de diseño** — resuelve una inconsistencia entre GDD §2.8 y
> Simulación §1, a favor de la **absorción** (lo que usaban las simulaciones).

- **Escudos del Líder = absorción.** El daño consume fichas 1 a 1; lo que sobra
  pasa a la vida. Ej.: 5 de daño con 2 de escudo → escudo a 0 y 3 a la vida.
- **Aliados = bloqueo con exceso perdido.** El daño redirigido a un Aliado
  consume su vida; **sin Arrollar, el exceso se pierde** (no llega al Líder).
  **Con Arrollar, el exceso pasa al Líder.**
- **Daño inabsorbible:** ignora escudos y Aliados, va directo a la vida del
  Líder.

La keyword Arrollar y el "exceso perdido" aplican al bloqueo por un **Aliado**,
no a la absorción por escudos del Líder.

## Criterios de aceptación (tests)

- [ ] Ataque `{nucleo}` con Núcleo 3 → 3 de daño al rival.
- [ ] Ataque `{suma 3}` con Núcleo 2 → 5.
- [ ] Ataque `{multiplica 2}` con Núcleo 4 → 8.
- [ ] Ataque `{suma 3, umbral: multiplica 2}`: Núcleo 2 → 5; Núcleo 4 → 8
      (modela Coladura ardiente).
- [ ] Caos: habilidad 🟣 con Núcleo 4 aplica su efecto Y resta 4 a la vida del
      Líder.
- [ ] Defensa `{3}` sobre Líder con 4 de escudo → escudo queda en 5 (tope).
- [ ] Curar no supera la vida máxima.
- [ ] Daño 5 a objetivo con 2 de escudo (absorción) → escudo 0, vida −3.
- [ ] Daño 5 redirigido a Aliado de 3 de vida, sin Arrollar → Aliado a 0, Líder
      intacto.
- [ ] Daño 5 redirigido a Aliado de 3 de vida, con Arrollar → Aliado a 0,
      Líder −2.
- [ ] Daño inabsorbible ignora escudo y Aliados.
- [ ] Trama: fuente jugador resta, fuente enemigo suma; clamp a 0.
- [ ] Energía clamp 0-5.
