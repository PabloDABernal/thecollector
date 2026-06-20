# PLAN.md — Hoja de ruta de "The Collector"

> Construimos por fases. El orden importa: **primero el motor, después los
> gráficos.** Es el equivalente en código del principio de diseño
> "simulaciones antes que documentos".

---

## Fase 0 · Montaje  ⬅️ EMPEZAMOS AQUÍ

Dejar el proyecto arrancando.

- [ ] Node.js (LTS) instalado.
- [ ] Carpeta del proyecto abierta en VSCode.
- [ ] Documentos de diseño en `/docs` y archivos base en su sitio.
- [ ] Proyecto Vite + React + TypeScript + Tailwind creado y corriendo en el
      navegador.
- [ ] Repositorio git inicializado y subido a GitHub.

**Hito:** ves una página en `localhost` desde el navegador del PC.

---

## Fase 1 · El motor (sin gráficos)

Las reglas, jugables por consola y con tests. Es el corazón del juego.

- [ ] Tipos del Content Schema (efectos atómicos) en `src/content`.
- [ ] Estructura de turno (spec 01) en `src/engine`, con tests.
- [ ] Pool de Núcleos + dados virtuales (spec 02), con tests.
- [ ] Cooldowns y calentamiento, con tests.
- [ ] Trama y Dramaturgia.
- [ ] IA del Enemigo (prioridades + selección de Núcleo).
- [ ] IA del Líder (heurística básica, ver Devkit §4).
- [ ] El prototipo (Forjador / Verdugo / Bastión) como datos.

**Hito (cerrar el bucle jugable):** el motor juega una batalla del prototipo de
principio a fin de forma automática, dada una semilla.

---

## Fase 2 · La interfaz

El juego sobre el motor ya funcionando. Que se vea bien en PC.

- [ ] Tablero, mano, pool de Núcleos, track de Trama.
- [ ] Cartas con estética "habitación de coleccionista".
- [ ] Conectar la UI al engine (renderiza estado, envía acciones).
- [ ] Una batalla jugable de verdad por una persona.

**Hito:** se puede jugar el prototipo con el ratón en el navegador.

---

## Fase 3 · Validador + Devkit

- [ ] Validador: corre N batallas y agrega las métricas del Devkit §5.
- [ ] Editor de contenido (formularios → Content Schema).
- [ ] Calculadora de presupuesto en vivo.

**Hito:** puedo crear/ajustar una carta y simular 1000 batallas para validarla.

---

## Fase 4 · Móvil

- [ ] Layout adaptable y táctil.
- [ ] Empaquetado con Capacitor (iOS/Android).

**Hito:** corre como app en el móvil.

---

## Estado actual

**Fase 0, paso 1.** Montando el entorno.