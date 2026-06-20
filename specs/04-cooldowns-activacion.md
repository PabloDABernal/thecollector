# Spec 04 — Cooldowns, calentamiento y activación de habilidades

> Especificación implementable. Fuente: Sistema y Balanceo §4, GDD §2.5.
> Pertenece al `engine`. Usa el pool (spec 02), el turno (spec 01) y el ejecutor
> de efectos (spec 03).

## Resumen

Activar una habilidad es la **acción central** del juego: conecta el pool de
Núcleos + el coste + los efectos + el cooldown. El **calentamiento** hace que
todo arranque "como recién usado", creando la escalera de apertura.

## Cooldowns

- Cada habilidad tiene `cd` ≥ 1.
- Activar una habilidad pone su cooldown = `cd`.
- Al inicio de cada turno del jugador, todos sus cooldowns bajan 1 (si > 0).
  (Ya implementado en `inicio-turno`.)
- Una habilidad es activable solo si su cooldown = 0.

> **El CD baja por TURNO, no por acción.** Es lo que produce la escalera de
> calentamiento (una habilidad de `cd` N es usable desde el turno N) y es lo que
> el código ya hace. (Resuelve una imprecisión de GDD §2.5, que dice "por
> acción"; conviene corregir esa redacción más adelante.)

## Calentamiento

- Al empezar la batalla, cada habilidad arranca con cooldown = su `cd`.
- Lo mismo al entrar un Aliado/permanente con habilidades.
- El enemigo también arranca en calentamiento.

Escalera resultante:

| | T1 | T2 | T3 | T4 |
|--|--|--|--|--|
| cd1 | ✅ | ✅ | ✅ | ✅ |
| cd2 | — | ✅ | ✅ | ✅ |
| cd3 | — | — | ✅ | ✅ |
| cd4 | — | — | — | ✅ |

## Activación de una habilidad (consume 1 acción)

Al activar una habilidad del Líder o de un Aliado, con un Núcleo elegido:

1. Comprobar cooldown = 0.
2. Comprobar que el Núcleo elegido satisface el coste (color y `valorMinimo`).
3. Gastar ese Núcleo del pool compartido.
4. Poner el cooldown de la habilidad = su `cd`.
5. **Decidir efectos:** si el valor del Núcleo gastado ≥ 3 y la habilidad tiene
   `efectosUmbral`, ejecutar esos; si no, los `efectos` base.
6. Ejecutar los efectos (vía el ejecutor de la spec 03).
7. Si el coste es de color 🟣, aplicar la regla Caos (auto-daño = valor del
   Núcleo).
8. Descontar 1 acción.

> Qué Núcleo gastar lo decide quien actúa (la UI o la IA). El motor recibe el
> Núcleo elegido y valida que cumple el coste.

## Umbral — corrección sobre la spec 03

El Umbral ≥3 **no vive dentro del efecto de Ataque**, sino a **nivel de
habilidad**: la habilidad tiene `efectos` (base) y opcionalmente `efectosUmbral`.
Si el Núcleo gastado vale ≥3, se ejecutan los `efectosUmbral`; si no, los base.
Esto permite umbrales que cambian cualquier conjunto de efectos, no solo
fórmulas de ataque.

Ejemplos del Forjador:
- **Coladura ardiente:** base `[Ataque+3]`; umbral `[Ataque×2]`.
- **Temple de acero:** base `[Trama2, Defensa3]`; umbral `[Trama3, Defensa3]`.

Hay que **mover el campo umbral** del efecto Ataque a la habilidad y ajustar el
ejecutor: el ejecutor ya no decide el umbral; lo decide la activación.

## Criterios de aceptación (tests)

- [ ] Activar una habilidad pone su cooldown = `cd`.
- [ ] Una habilidad con cooldown > 0 no es activable.
- [ ] Escalera de calentamiento: con warmup = `cd` y decremento por turno, una
      habilidad de `cd` N es usable desde el turno N (probar cd 1-4 en T1-T4).
- [ ] Una habilidad cd1 usada en un turno vuelve a estar lista al turno
      siguiente.
- [ ] No se puede activar si el Núcleo elegido no cumple color/`valorMinimo`.
- [ ] Activar gasta el Núcleo del pool y descuenta 1 acción.
- [ ] Umbral a nivel de habilidad: Núcleo ≥3 ejecuta `efectosUmbral`; <3 ejecuta
      los base. Probar un caso tipo Coladura (ataque) y uno tipo Temple
      (Trama+Defensa).
- [ ] Coste 🟣 aplica auto-daño = valor del Núcleo además del efecto.
