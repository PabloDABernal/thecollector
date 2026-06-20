# CLAUDE.md — Contexto del proyecto "The Collector"

> Este archivo lo lees TÚ (el agente) al empezar cualquier tarea. Define la
> arquitectura, las reglas y las convenciones. Si algo aquí choca con una
> petición, avísame antes de continuar; no improvises sobre el diseño.

---

## Qué es esto

**The Collector** es un juego de cartas PVE para un jugador (solitario). El
jugador es un coleccionista de TCGs que adapta sus cartas a un sistema propio.
Combate por turnos, asimétrico (jugador vs. enemigo + escenario), con azar
compartido (los "Núcleos") y gestión de recursos.

El diseño completo ya existe y es la **fuente de verdad**:
- `/docs` — documentos de diseño (GDD, Sistema y Balanceo, Devkit, etc.).
- `/specs` — especificaciones implementables, una por sistema.

Si hay conflicto entre una petición y estos documentos, **pregunta**, no inventes.

---

## Stack técnico

- **Lenguaje:** TypeScript (estricto).
- **UI:** React + Vite.
- **Estilos:** Tailwind CSS.
- **Tests:** Vitest.
- **Móvil (fase futura):** Capacitor sobre el mismo código web.
- **Control de versiones:** git + GitHub.

PC/web primero. Móvil después, envolviendo la misma app.

---

## Arquitectura — las reglas de oro (NO romper)

La pieza central es el **motor de reglas**. De él beben dos consumidores: el
juego y el validador. Las reglas viven en UN solo sitio.

1. **`engine/` es código puro.** Sin React, sin DOM, sin red, sin
   `Math.random()` suelto. Recibe un estado y devuelve el estado siguiente
   (funciones puras siempre que se pueda). No sabe nada de pantallas.
2. **Toda la aleatoriedad pasa por un generador con semilla** inyectado en el
   engine. Misma semilla = misma partida reproducible. Esto es obligatorio para
   que el validador funcione y para depurar.
3. **La UI y el validador importan el MISMO engine.** Nunca se duplica lógica de
   reglas. Si una regla cambia, cambia en el engine, y ambos lo heredan.
4. **`content/` son datos, no lógica.** Líderes, enemigos, escenarios y cartas
   se describen como datos tipados ("efectos atómicos", ver Devkit). El engine
   los interpreta; no hay código a medida por carta.
5. **La UI solo renderiza el estado del engine y le envía acciones.** No calcula
   daño, ni Trama, ni cooldowns por su cuenta.

---

## Estructura de carpetas

```
the-collector/
├── CLAUDE.md            # este archivo
├── PLAN.md              # hoja de ruta por fases
├── README.md
├── docs/                # diseño (fuente de verdad). NO se edita desde código.
├── specs/               # especificaciones implementables (una por sistema)
└── src/
    ├── engine/          # motor de reglas PURO (sin UI)
    ├── content/         # datos del juego (efectos atómicos tipados)
    ├── validator/       # corre N batallas y agrega métricas (Node, sin UI)
    └── ui/              # la app React (lo que ve el jugador)
```

(El árbol exacto dentro de `src/` puede ajustarse, pero la separación
engine / content / validator / ui es innegociable.)

---

## Convenciones

- **Idioma:** explicaciones, comentarios y mensajes de commit **en español**.
- **Identificadores de código** en inglés genérico (`getCurrentTurn`,
  `applyDamage`), PERO se conservan los **términos del dominio en español**
  cuando son nombres propios del sistema: `Nucleo`, `Trama`, `Esbirro`, `Lider`,
  `Coladura`, `Dramaturgia`, etc. Son vocabulario del juego, no traducir.
- **Tests primero para el engine:** cada regla del engine debe tener tests
  Vitest que la verifiquen. El engine sin tests no se da por terminado.
- **Antes de programar una feature**, lee la spec correspondiente en `/specs` y,
  si hace falta, el doc en `/docs`. No programes de memoria.
- **Cambios pequeños y verificables.** Mejor varios pasos pequeños con tests que
  un salto grande sin verificar.
- Explícame en español, de forma sencilla, qué has hecho al terminar cada tarea
  (asume que dirijo el diseño pero no soy programador experto).

---

## Reglas del juego que NO debes olvidar (resumen; el detalle está en /specs y /docs)

- **Núcleos:** 5 colores, valores base **1-4**. Pool compartido jugador/enemigo.
  Se relanza solo cuando está **completamente vacío**. Umbral **≥3** (50%).
- **2 acciones por turno.** Canalizar y +Energía siempre disponibles como plan B
  → **nunca hay "acción muerta"**.
- **CD1 del Líder: siempre ⚫ y puro** (sin +X/×X/Umbral). Los modificadores
  empiezan en CD2.
- **CD1 del Enemigo: doble básica** (una de Ataque, una de Trama, ambas ⚫).
- **Trama** no sube automáticamente: solo por habilidades 📜 y efectos de carta.
- **Sin Arrollar, el daño excedente se pierde** (no pasa al Líder).
- **Caos (🟣):** toda habilidad de ese color inflige auto-daño = valor del
  Núcleo gastado.
- **Ningún enemigo supera 100HP.** El ritmo lento se arregla ajustando
  habilidades, nunca inflando vida.

El prototipo de prueba es **El Forjador vs El Verdugo en El Bastión**
(ver `docs/Simulacion_Prototipo...` y `docs/Sistema_y_Balanceo...`).