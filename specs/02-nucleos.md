# Spec 02 — Núcleos y dados virtuales

> Especificación implementable. Fuente: GDD §2.3, Sistema y Balanceo §2, §5.
> Pertenece al `engine` (código puro, sin UI). Toda la aleatoriedad pasa por el
> generador con semilla inyectado: **misma semilla = mismo pool**.

## Resumen

Los Núcleos son el recurso azaroso **compartido** entre jugador y enemigo. Hay
**5 colores**, cada uno con un **valor 1-4**. Activar una habilidad gasta 1
Núcleo del color y valor mínimo requeridos.

## Los 5 colores

| Color | Identidad |
|-------|-----------|
| 🔴 Rojo | Agresión |
| 🔵 Azul | Control (color de la Trama) |
| 🟢 Verde | Defensa |
| 🟡 Amarillo | Recurso |
| 🟣 Morado | Caos |

## El pool

- Al lanzar el pool, cada color recibe un valor aleatorio **1-4** (distribución
  uniforme: 25% cada valor).
- El pool es **compartido**: lo que uno gasta, el otro ya no lo tiene.
- **El pool se relanza SOLO cuando está completamente vacío.** Un único Núcleo
  restante = no se relanza.
- Tras un relanzado, **quien actúa primero elige primero** del nuevo pool.
- **No se puede pasar** si hay un Núcleo válido para la habilidad que se quiere
  usar (la limitación es de recurso, no voluntaria).

## Notación de costes

| Notación | Significado |
|----------|-------------|
| ⚫ | Un Núcleo de **cualquier** color, cualquier valor |
| 🔴 | Un Núcleo rojo, cualquier valor |
| ⚫3 | Cualquier color, **valor mínimo 3** |
| 🔴3 | Rojo, valor mínimo 3 |
| 🔴🟡🟢 | Uno de **esos** colores, cualquier valor |

El número siempre significa "valor mínimo".

## Umbral ≥3

Algunas habilidades tienen un efecto extra si el Núcleo gastado vale **≥3**. En
rango 1-4 eso ocurre el **50%** de las veces. (No aplica en CD1 del Líder, que es
puro.)

## Dados virtuales (mecánica digital exclusiva)

El rango base 1-4 puede modificarse **temporalmente** por cartas, habilidades,
pasivos o escenarios. El engine debe soportar estas operaciones sobre el rango:

- **Truncar por abajo:** "mínimo 2 este turno" → posibles 2/3/4.
- **Truncar por arriba:** "máximo 2 este turno" → posibles 1/2.
- **Fijar:** "el siguiente Núcleo vale 4" → exactamente 4.
- **Filtrar:** "todos impares" → 1/3.
- **Expandir:** "se relanza con dados de 6" → posibles 1-6.

## Determinismo

- El engine recibe un generador pseudoaleatorio con **semilla**. Nunca usa
  `Math.random()` directamente.
- Dada la misma semilla y la misma secuencia de acciones, el resultado es
  idéntico (reproducible para depurar y para el validador).

## Criterios de aceptación (tests)

- [ ] Un pool recién lanzado tiene 5 Núcleos, uno por color, con valores 1-4.
- [ ] Gastar un Núcleo lo retira del pool compartido.
- [ ] El pool NO se relanza mientras quede ≥1 Núcleo.
- [ ] El pool se relanza cuando llega a 0 Núcleos.
- [ ] Una habilidad ⚫3 solo puede pagarse con un Núcleo de valor ≥3.
- [ ] Con la misma semilla, dos partidas generan exactamente los mismos pools.
- [ ] Cada operación de dado virtual (truncar/fijar/filtrar/expandir) restringe
      o expande correctamente los valores posibles.
