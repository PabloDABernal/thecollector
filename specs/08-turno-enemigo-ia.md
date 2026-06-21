# Spec 08 — Turno del enemigo (1): fases e IA de decisión

> Especificación implementable. Fuente: Sistema y Balanceo §6.3/§6.4/§12,
> Simulación §4. Pertenece al `engine` (lógica pura de decisión). Sin
> orquestación todavía: aquí solo se DECIDE, no se EJECUTA el turno.

## Resumen

La "cabeza" del enemigo: qué habilidades tiene activas según su fase, y —dado el
icono de la carta— qué habilidad ejecuta y qué Núcleo gasta. Todo funciones
puras.

## A. Sistema de fases (refactor + lógica)

**Refactor:** unifica la estructura de fases del Verdugo. Todas las fases en una
sola lista, cada una con el HP al que se activa. Desaparece el campo top-level
`habilidades`; la fase 1 es la primera de la lista.

```
fases: [
  { activaA: 80, habilidades: [Tajo, Grito, Ejecución,   Proclama] },
  { activaA: 40, habilidades: [Tajo, Grito, Decapitación, Proclama] },
]
```

`faseActiva(hpActual, fases)` → la fase activa, **derivada del HP** (no un flag
guardado): la última fase de la lista (ordenada de mayor a menor `activaA`) cuyo
`activaA` ≥ `hpActual`. El cambio de fase es automático al bajar la vida; no hay
evento de "cambiar de fase" que se pueda olvidar. Escala a 2-3 fases sin casos
especiales.

## B. IA de prioridades — elegir habilidad

`elegirHabilidad(icono, estado, habilidadesActivas)`:

**Carta ⚔️:**
1. Habilidad firma de ataque (Ejecución/Decapitación) **si** está fuera de
   cooldown **Y** existe en el pool un Núcleo que cumpla su coste (⚫4).
2. Si no → básica de ataque (Tajo): siempre (⚫, CD1).

**Carta 📜:**
1. Habilidad de Trama de mayor CD (Proclama) **si** está fuera de cooldown
   (desbloqueada, desde T3) **Y** es pagable (⚫, siempre lo es).
2. Si no → básica de Trama (Grito de guerra): siempre (⚫, CD1).

## C. IA — elegir Núcleo (capa 2)

`elegirNucleo(coste, pool, coloresJugador)` → el Núcleo a gastar, **entre los que
cumplen el coste** (color y `valorMinimo`):
1. Si hay un Núcleo válido de **color del jugador** (🔴🔵🟣) con **valor ≥3** →
   ese, el mayor de ellos. [denegación]
2. Si no → el de mayor valor disponible entre los válidos.
3. Empate → criterio fijo y determinista (p. ej. orden de color), para
   reproducibilidad.

Colores del jugador en el prototipo: 🔴🔵🟣.

## Criterios de aceptación (tests)

**Fases:**
- [ ] `faseActiva(80)` y `faseActiva(41)` → fase 1 (Ejecución).
- [ ] `faseActiva(40)` y `faseActiva(10)` → fase 2 (Decapitación).

**Elegir habilidad:**
- [ ] ⚔️ con un Núcleo de valor 4 en pool y Ejecución lista → Ejecución.
- [ ] ⚔️ sin Núcleo de valor 4 → Tajo.
- [ ] ⚔️ con Ejecución en cooldown → Tajo, aunque haya un 4.
- [ ] 📜 con Proclama desbloqueada → Proclama.
- [ ] 📜 con Proclama en calentamiento → Grito de guerra.

**Elegir Núcleo:**
- [ ] Coste ⚫ con pool {🔴4, 🟢4} → elige 🔴4 (color del jugador, denegación).
- [ ] Coste ⚫ sin colores del jugador ≥3 → el de mayor valor.
- [ ] Coste ⚫4 → solo entre Núcleos de valor 4, aplicando la denegación entre
      ellos.
