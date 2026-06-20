# DEVKIT / VALIDADOR — THE COLLECTOR
## Documento de Diseño v1

> **Cómo leer este documento:**
> - 🟢 **FIRME** — decisión estructural cerrada.
> - 🟡 **BORRADOR** — propuesta por validar.
> - ⬜ **ABIERTO** — planteado, sin decidir.
>
> *Creado el 20 de junio de 2026. Complementa el GDD v4, Sistema y Balanceo v5 (en proceso de v6), Simulación Prototipo v1.1.*

---

## 0. QUÉ ES ESTO

El Devkit es la herramienta interna con la que se crea **todo el contenido del juego** (Líderes, Enemigos, Escenarios, cartas, Dramaturgia) sin tocar el código del juego, y con la que se **valida automáticamente** ese contenido jugando partidas simuladas en bucle antes de darlo por bueno.

**No es una feature de jugador en esta fase.** Es devkit interno para el equipo (Pau + "el code"). Si en el futuro se decide exponer una versión simplificada a jugadores como editor de contenido propio, esa capa de UX se construye encima del motor que ya funcione — no condiciona el diseño técnico de ahora.

**Relación con el resto de documentos:** el Devkit consume las reglas y fórmulas ya cerradas en Sistema y Balanceo (presupuesto de cartas/habilidades, gramática del Núcleo, tasaciones especiales) y las convierte en un sistema ejecutable. No redefine el sistema de juego — lo implementa.

---

## 1. LOS DOS MOTORES 🟢

El Devkit no es una sola pieza. Son dos motores que trabajan juntos:

### 1.1 Motor de Datos (Content Schema)
La definición formal de qué es una carta, una habilidad, un Líder, un Enemigo, un Escenario — como estructura de datos, no como texto descriptivo. Es el contrato entre diseño y desarrollo: todo lo que hoy vive en tablas Markdown se traduce a un esquema reutilizable que el motor de simulación puede leer y ejecutar sin intervención humana.

### 1.2 Motor de Simulación (Battle Engine)
Una implementación jugable de las reglas del sistema (turnos, Núcleos, CDs, calentamiento, Trama, Dramaturgia, IA de prioridades del enemigo) capaz de jugar una batalla completa de principio a fin de forma automática, usando IA tanto para el Enemigo (ya semi-definida en el sistema) como para el Líder (a definir, ver §4).

**El validador no es una tercera pieza independiente.** Es el Motor de Simulación corriendo en bucle N veces, agregando resultados estadísticos.

---

## 2. EFECTOS ATÓMICOS — LA PIEZA CLAVE 🟢

Para que el motor pueda "jugar" una carta sin que nadie la programe a mano, cada habilidad/carta no puede quedarse en texto descriptivo. Se descompone en **efectos atómicos**: bloques de comportamiento predefinidos y combinables que el motor entiende y ejecuta.

**Ejemplo — "Coladura ardiente: Ataque+3. Umbral≥3: Ataque×2"** se traduce a algo como:

```json
{
  "tipo": "ataque",
  "formula_base": { "operacion": "suma", "valor": 3 },
  "condicion_umbral": {
    "min_nucleo": 3,
    "formula_alt": { "operacion": "multiplica", "valor": 2 }
  }
}
```

El dato describe el comportamiento; el motor lo ejecuta sin lógica específica de esa carta escrita a mano. Esto es lo que permite escalar a cientos de cartas sin que cada una requiera código nuevo.

### 2.1 Catálogo de efectos atómicos (punto de partida) 🟡
Lista preliminar de bloques que el editor debe poder componer — se ampliará con el uso real:

| Bloque | Parámetros |
|--------|-----------|
| Ataque | fórmula (=Núcleo / +X / ×X), condición de umbral |
| Trama | dirección (contexto), valor, modificadores por presencia (ej. +1/esbirro) |
| Defensa/Escudo | valor, persistente (sí/no) |
| Curar | valor |
| Robar carta | cantidad |
| Energía | +/- cantidad |
| Auto-daño | fórmula (ligado a regla de color Caos) |
| Cancelar | alcance (daño turno anterior / última carta Dramaturgia) |
| Aplicar estado | tipo (aturdir, etc.), duración |
| Invocar | tipo de esbirro/Aliado, stats |
| Modificar dado virtual | rango, truncar, fijar, filtrar, expandir |

### 2.2 Coste y condiciones, como capa separada
Cada efecto atómico se combina con su capa de coste (CD, color de Núcleo requerido, mínimo de valor, coste en Energía si es carta) y, si aplica, sus keywords (Arrollar, Combo, Berserker, Defensor...). Esto es lo que permite que la Calculadora de Presupuesto (§3.2) compare automáticamente "lo que cuesta" contra "lo que el sistema dice que debería costar".

---

## 3. PIEZAS DEL DEVKIT

### 3.1 Editor de Habilidades/Cartas 🟡
Formulario de composición (no texto libre) para construir un efecto a partir de los bloques del §2.1. El diseñador elige tipo de efecto, fórmula, condiciones, coste y keywords desde menús/campos estructurados. La salida es directamente un objeto del Content Schema.

### 3.2 Calculadora de Presupuesto en vivo 🟡
Mientras se edita una habilidad o carta, calcula en tiempo real su coste según las fórmulas ya cerradas en Sistema y Balanceo §10 (presupuesto de habilidades en Núcleo, presupuesto de cartas en Energía, tasación especial para cancelación/permanentes) y compara contra el coste que el diseñador le ha puesto, señalando la diferencia (sobrevalorada / infravalorada / cuadra).

No sustituye al validador — es feedback instantáneo basado en fórmula, sin necesidad de simular partidas todavía.

### 3.3 Simulador de Combates / Validador 🟢
Selecciona Líder + Enemigo + Escenario + número de partidas (ej. 100, 1000) y ejecuta el Motor de Simulación en bucle, devolviendo métricas agregadas (ver §5).

### 3.4 Editor de Líderes/Enemigos/Escenarios 🟡
Capa superior que agrupa habilidades/cartas ya creadas en una entidad completa (4 habilidades del Líder + pool de 10 cartas; o Enemigo con sus fases, secuaces y mazo de Dramaturgia asociado).

### 3.5 Sistema de estado de validación 🟡
Cada pieza de contenido (carta individual, habilidad, Líder completo, Enemigo completo) lleva un estado:
- 🔴 **Sin probar** — recién creada, sin simular.
- 🟡 **Probado con desviaciones** — simulado, pero fuera de los rangos objetivo.
- 🟢 **Validado** — dentro de los criterios de aprobación (ver §6), listo para exportar.

### 3.6 Exportación 🟡
El contenido en estado 🟢 se serializa al formato final que consume el juego real. La salida del Devkit **es** el dato de producción — no una maqueta que alguien deba traducir a mano después.

```
┌─────────────────────────────────────────┐
│  EDITOR DE CONTENIDO (formularios)       │
│  Líderes / Enemigos / Escenarios / Cartas│
└──────────────────┬────────────────────────┘
                    │ genera
                    ▼
┌─────────────────────────────────────────┐
│  CONTENT SCHEMA (datos estructurados)    │
│  efectos atómicos, costes, condiciones   │
└──────────────────┬────────────────────────┘
                    │ consume
                    ▼
┌─────────────────────────────────────────┐
│  BATTLE ENGINE (motor de reglas)         │
│  ejecuta turnos, IA enemigo, IA líder    │
└──────────────────┬────────────────────────┘
                    │ corre N veces
                    ▼
┌─────────────────────────────────────────┐
│  VALIDADOR (agregación de resultados)    │
│  métricas, comparación vs referencia     │
└──────────────────┬────────────────────────┘
                    │ si OK
                    ▼
┌─────────────────────────────────────────┐
│  EXPORT (dato final para el juego)       │
└─────────────────────────────────────────┘
```

---

## 4. LA IA DEL LÍDER (bot competente) 🟡

La IA del Enemigo ya está semi-definida en el sistema (prioridad de habilidad firma/relleno + capa de selección de Núcleo). El Líder no tenía IA — en las simulaciones manuales lo jugaba un humano, lo cual introduce variabilidad de criterio (incluyendo errores, como ignorar la keyword Defensor en la sesión de simulación previa). Para que el validador sea fiable, hace falta una heurística de decisión para el Líder.

### 4.1 Heurística propuesta (punto de partida, ajustable)

Orden de prioridad evaluado cada turno:

1. **¿Amenaza de muerte este turno o el siguiente?** → priorizar supervivencia (Contratiempo si aplica, curación, escudo) sobre daño.
2. **¿Hay un secuaz con keyword Defensor vivo y es eficiente eliminarlo?** (ej. muere en 1-2 golpes con habilidades en CD0) → priorizarlo.
3. **¿Trama cerca de un umbral peligroso?** → priorizar control de Trama.
4. **Si nada de lo anterior aplica** → maximizar daño esperado con las acciones disponibles, prefiriendo habilidades de mayor CD (más payoff) sobre relleno cuando estén disponibles.
5. **Combo** → siempre se aprovecha si está disponible (regla ya cerrada: Canalizar/+Energía garantizan que siempre hay algo que hacer).
6. **Gestión de Energía** (Canalizar vs +Energía) → según estado de mano: priorizar Energía si hay cartas caras sin poder pagar, priorizar Canalizar si la mano está vacía de opciones jugables.

### 4.2 Perfiles de bot 🟡
El Devkit debería permitir simular contra **varios perfiles de comportamiento**, no solo uno "equilibrado":

| Perfil | Tendencia |
|--------|-----------|
| Equilibrado | Heurística de §4.1 tal cual |
| Agresivo | Prioriza daño sobre gestión de mesa/Trama, salvo amenaza de muerte inminente |
| Defensivo | Prioriza supervivencia/control de Trama incluso sin amenaza inmediata |
| Pasivo/subóptimo | Ignora keywords de prioridad (Defensor, etc.) — simula a un jugador novato |

**Razón de ser:** un Líder/Enemigo puede parecer balanceado contra un bot equilibrado y romperse contra un perfil distinto. Validar contra varios perfiles da una foto más honesta que un solo número de victorias. El perfil "Pasivo/subóptimo" es particularmente valioso porque reproduce el tipo de error que un jugador real puede cometer (como ocurrió en la simulación previa con el Esbirro Defensor) y permite verificar que el sistema castiga ese error de forma justa, no desproporcionada.

---

## 5. MÉTRICAS DEL VALIDADOR 🟢

El validador no debe limitarse a "% victorias" — eso es insuficiente para diagnosticar problemas de balance. Métricas a devolver tras N simulaciones:

| Métrica | Qué revela |
|---------|-----------|
| % victorias / derrotas / empates por límite de turnos | Resultado global |
| Turnos medios hasta fin de Fase 1 | Contraste contra objetivo de tiempo/turnos (§6.bis del Sistema y Balanceo) |
| Turnos medios hasta resolución total | Ritmo completo de la batalla |
| HP medio restante del Líder al ganar | ¿Gana raspado o sobrado? |
| HP medio restante del Enemigo cuando el Líder pierde | ¿Qué tan cerca estuvo el jugador? |
| Trama media al final | ¿Se gestiona activamente o se ignora? |
| Distribución de causas de derrota | HP a 0 / Trama a tope / otra |
| Uso medio de cada habilidad/carta | Detecta piezas que el bot nunca usa → señal de carta muerta o mal diseñada |
| Daño medio por turno y por habilidad | Detecta outliers de poder |
| Frecuencia real de activación de Umbral/condicionales | Contraste contra la frecuencia teórica (ej. 50% para Umbral≥3 en rango 1-4) |

---

## 6. CRITERIO DE "OK" / APROBACIÓN ⬜

**Decisión de diseño pendiente, no técnica.** El Devkit puede calcular cualquier métrica, pero el umbral de "esto ya está listo para el juego" lo define el diseño, no la herramienta.

Punto de partida a discutir:
- Un Enemigo de dificultad "Normal" podría aprobarse con % victorias del jugador en un rango objetivo (ej. 40-60% contra el bot Equilibrado).
- Dificultades distintas (Fácil/Difícil/Reto) tendrían rangos objetivo distintos.
- Posible criterio adicional: ninguna carta/habilidad con uso medio por debajo de un mínimo (evitar piezas muertas).
- Posible criterio adicional: ningún perfil de bot debería arrojar 0% o 100% de victorias (señal de combinación rota en algún extremo).

**Pendiente de decidir:** los rangos exactos por dificultad, y si el criterio de aprobación es automático (el sistema marca 🟢 solo) o siempre requiere revisión humana antes de pasar a 🟢.

---

## 7. ALCANCE INICIAL ⬜

**Pendiente de decidir:** si el Devkit cubre desde el principio la creación de todo el contenido (Líderes, Enemigos, Escenarios, cartas, Dramaturgia) o se construye por fases empezando por una parte. No se ha cerrado explícitamente en esta sesión — a definir antes de empezar construcción.

---

## 8. PENDIENTES (orden sugerido)

1. ⬜ Cerrar alcance inicial (§7): ¿todo el contenido desde el día 1, o por fases?
2. ⬜ Cerrar criterio de aprobación / rangos objetivo por dificultad (§6).
3. 🟡 Ampliar catálogo de efectos atómicos (§2.1) según necesidades reales al implementar el Forjador/Verdugo/Bastión como primer caso de prueba del Devkit.
4. 🟡 Afinar heurística de la IA del Líder (§4.1) y decidir si los perfiles de bot (§4.2) se implementan todos desde el inicio o se empieza solo con Equilibrado.
5. ⬜ Decidir stack técnico de construcción (no decidido en esta sesión — este documento es de diseño, no de implementación).
6. ⬜ Definir formato exacto de exportación (§3.6) — qué consume realmente "el juego" en su primera versión jugable.

---

*Devkit v1 — documento vivo. Generado el 20 de junio de 2026, sesión de diseño post Sistema y Balanceo v5.*
