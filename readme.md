# The Collector

Juego de cartas PVE para un jugador. Eres un coleccionista de TCGs que adapta
sus cartas a un sistema de combate solitario, por turnos, con azar compartido
(los "Núcleos") y gestión de recursos.

Proyecto personal en desarrollo. Web primero (PC), móvil después.

## Cómo arrancar

Requisitos: [Node.js](https://nodejs.org) (versión LTS).

```bash
npm install      # instala las dependencias (solo la primera vez)
npm run dev      # arranca el servidor de desarrollo
npm test         # ejecuta los tests del motor
```

Tras `npm run dev`, abre la URL que aparece en la terminal (algo como
`http://localhost:5173`).

## Estructura

- `docs/` — documentos de diseño (la fuente de verdad).
- `specs/` — especificaciones implementables, una por sistema.
- `src/engine/` — motor de reglas puro (sin interfaz).
- `src/content/` — datos del juego (cartas, líderes, enemigos…).
- `src/validator/` — simula muchas batallas y da métricas de balance.
- `src/ui/` — la aplicación React (el juego).

Ver `PLAN.md` para la hoja de ruta y `CLAUDE.md` para las reglas de arquitectura.