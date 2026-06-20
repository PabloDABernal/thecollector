# SIMULACIÓN PROTOTIPO — THE COLLECTOR
## Documento de Referencia para Simulaciones v1.2

> Este documento existe para que cualquier instancia de Claude pueda ejecutar simulaciones correctas sin cometer los errores de sesiones anteriores. Leer completo antes de simular.
>
> **Cambios v1.2 (20 jun 2026):** CD1 del Líder ahora puro (Martillo = Ataque sin +1). CD1 del Enemigo con doble básica (Tajo + Grito de guerra). Vida del Verdugo bajada a 80HP (40+40). Coladura imprevista sube a 3⚡. Añadido error común #12 (gestión de mesa / keyword Defensor).

---

## 0. ERRORES COMUNES A EVITAR

1. **El pool NO se relanza hasta que esté COMPLETAMENTE vacío.** Un solo Núcleo restante = no se relanza.
2. **Sin Arrollar, el daño excedente al Aliado o al escudo SE PIERDE.** No pasa al Líder.
3. **Los Aliados bloquean desde que entran.** Solo sus habilidades activas arrancan en CD.
4. **El jugador puede elegir NO redirigir al Aliado.** También puede atacar secuaces activamente con sus acciones. El redirect es una decisión táctica, no obligatoria.
5. **La Trama NO sube automáticamente.** Solo sube cuando carta 📜 activa Proclama (o Grito de guerra) o cuando una carta de Dramaturgia lo indica.
6. **Los Esbirros no actúan en el turno que son invocados** (entran en el turno siguiente). **1 actúa por turno**, elegido al azar entre los que pueden actuar (no en CD, Núcleo disponible). Su **presencia pasiva** (efecto de Verdugo/Bastión) aplica desde que entran, aunque no sean el que ataca.
7. **El enemigo siempre roba Dramaturgia primero.** Luego resuelve el efecto de la carta, luego ejecuta la habilidad según el icono.
8. **Capa 2 de la IA:** el enemigo elige el Núcleo que más daña al jugador (colores del jugador ≥3 primero). No elige solo "el mayor disponible".
9. **Colores del jugador en el prototipo:** 🔴🔵🟣 (los que usa el Forjador). El Verdugo intentará negar estos.
10. **Con 2 acciones**, el jugador puede hacer en un turno: 2 habilidades, 1 habilidad + 1 carta, 2 cartas, o cualquier combinación. CD de una habilidad usada sube al activarla.
11. **Proclama con carta 📜:** la carta y la Proclama (o Grito de guerra, si Proclama sigue en calentamiento) SON dos cosas distintas de la habilidad. La carta resuelve su efecto Y ADEMÁS el enemigo ejecuta su habilidad de Trama correspondiente. Ambas ocurren.
12. **Gestión de mesa NO es opcional.** Ignorar secuaces con keyword Defensor (o cualquier secuaz vivo en general) tiene coste real: cada turno que sigan en mesa, sus pasivas (Verdugo: +1 daño Proclama/esbirro; Bastión: +1 escudo persistente/esbirro) se acumulan sin tope. Un bot/jugador "competente" debe dedicar acciones a eliminarlos cuando sea eficiente hacerlo (ej. Esbirro Defensor Vida6 muere en 2-3 golpes de Martillo), no ignorarlos en favor de daño puro al Líder enemigo. Confirmado en simulación: ignorar esbirros castiga por partida doble, es la mecánica funcionando como debe, no un fallo de balance.

---

## 1. REGLAS CLAVE PARA LA SIMULACIÓN

### Turno del Jugador
1. Efectos de inicio de turno (umbrales de Trama activos).
2. CDs propios bajan 1.
3. Elección de inicio: +1⚡ O Canalizar (gratis, no consume acción).
4. **2 acciones.** Cada acción puede ser: habilidad del Líder (si CD=0), habilidad de Aliado (si CD=0), bajar carta, Canalizar (emergencia), +Energía (emergencia).

### Turno del Enemigo
1. **Roba carta de Dramaturgia** (carta superior del mazo).
2. **Resuelve el efecto de la carta** (secuaz, daño, Trama extra, etc.).
3. **Ejecuta habilidad según icono:**
   - ⚔️ → IA de ataque (ver sección 4.3): firma si disponible, si no, básica de Ataque (Tajo).
   - 📜 → habilidad de Trama de mayor CD si está desbloqueada; si no, básica de Trama (Grito de guerra).
4. **Secuaces activos** (invocados en turnos anteriores): 1 aleatorio actúa. Ataque1 plano al Líder. El jugador puede redirigir a Aliado.

### Pool de Núcleos
- Se relanza cuando está **completamente vacío**.
- Nuevo pool: 5 valores aleatorios (1-4 cada uno, uno por color).
- Para simulación: generar aleatoriamente o usar los del documento de simulación.

### Daño y Escudos
- Daño al Líder: primero consume fichas de escudo, luego va a vida.
- Daño a Aliado: consume vida del Aliado. **Sin Arrollar: exceso se pierde.**
- Daño inabsorbible: va directo al Líder, ignora escudos y Aliados.

---

## 2. ESTADO INICIAL ESTÁNDAR

| Elemento | Valor |
|----------|-------|
| Vida del Forjador | 32 HP |
| Escudo inicial | 0 |
| Energía inicial | **2⚡** |
| Cartas en mano | 5 (robar al inicio) |
| Trama | 0 |
| Vida del Verdugo | 80 HP |
| CDs del Forjador | Todos en calentamiento |
| CDs del Verdugo | Todos en calentamiento |
| Pool de Núcleos | Lanzar al inicio |

**Pool inicial sugerido (o generar aleatorio 1-4):**
🔴X · 🔵X · 🟢X · 🟡X · 🟣X

---

## 3. EL FORJADOR — Líder de Prueba

Colores propios: **🔴🔵🟣** (los que usa en sus habilidades).

### 3.1 Habilidades (Nivel 1)
| CD | Coste | Nombre | Efecto | Media |
|----|-------|--------|--------|-------|
| 1 | ⚫ | Martillo de forja | Ataque (puro) | 2.5 |
| 2 | 🔵 | Temple de acero | Trama2·Defensa3. Umbral(≥3): Trama3·Defensa3 | — |
| 3 | 🔴 | Coladura ardiente | Ataque+3. Umbral(≥3): **Ataque×2** | 4.5 / 7 |
| 4 | 🟣 | Gran Fundición | Ataque×3. **Auto-daño = valor del Núcleo** | 7.5 |

> **CD1 puro (v6):** Martillo no lleva modificador. Es la regla general del sistema — ver Sistema y Balanceo §5.0.
> **Umbral ≥3:** ocurre con valores 3 o 4 (50% de las veces en rango 1-4). No aplica en CD1.
> **Coladura:** sin umbral (Núcleo 1-2) → 4-5 daño. Con umbral (Núcleo 3-4) → **6-8 daño**. El +3 solo opera con Núcleo bajo; el ×2 con Núcleo alto. Sin solapamientos.
> **Gran Fundición auto-daño:** Núcleo 1 → 3 daño / −1 vida. Núcleo 4 → 12 daño / −4 vida. Caos = pierdes ⅓ del daño en vida.

### 3.2 Los 3 Niveles
| Nivel | Trigger | Cambio |
|-------|---------|--------|
| 1 | Inicial | — |
| 2 | 1ª subida (checkpoint de fase) | Martillo: Ataque (puro) → **Ataque+1** (primer modificador del Líder) |
| 3 | 2ª subida | Gran Fundición: Ataque×3 → **Ataque×4** (mantiene auto-daño = Núcleo) |

> Nivel 3, GranF: Núcleo 4 → **16 daño / −4 vida** (techo). Tres condiciones deben alinearse: CD4 + 🟣4 en pool + 4 de vida disponible.

### 3.3 Mazo de Prueba (30 cartas)
| Carta | Tipo | ⚡ | Efecto | Copias |
|-------|------|----|--------|--------|
| Aprendiz de fragua | Aliado | 2 | Vida4. Slot⚫ Ataque. Al entrar: +1⚡ | ×3 |
| Chispa Combustible | Evento | 1 | Roba 2. **Combo** | ×3 |
| Apagar la fragua | Evento | 1 | Trama4 | ×4 |
| Enfriar el metal | Contratiempo | 2 | Cancela el daño del turno enemigo anterior | ×3 |
| Reforjar | Evento | 2 | Cura4·Defensa2 | ×4 |
| Coladura imprevista | Evento | 3 | 6 daño fijo (sin Núcleo) | ×4 |
| Romper el molde | Contratiempo | 3 | Cancela la última carta de Dramaturgia | ×3 |
| Yunque del Maestro | Equipo | 3 | Pasivo: con Trama≥3, 🔴 hacen +1 daño | ×2 |
| Coloso de hierro | Aliado | 5 | Vida10. Slot🟢 Defensa3 | ×2 |
| El Yunque Viviente | Aliado | 4 | Berserker. Vida8. Slot🔴 Ataque+2 | ×2 |
| **Total** | | | | **30** |

> **Nota:** repeticiones permitidas solo para pruebas. En juego real: máx 2 copias por carta.
> **Cambio v1.2:** Coladura imprevista sube de 2⚡ a 3⚡ (recalibrada contra el nuevo benchmark, ver Sistema y Balanceo §10.3).

---

## 4. EL VERDUGO — Enemigo de Prueba

### 4.1 Habilidades Base
| CD | Coste | Nombre | Efecto Fase 1 | Efecto Fase 2 (≤40HP) |
|----|-------|--------|---------------|----------------------|
| 1 | ⚫ | Tajo | Ataque (puro) | Ataque (igual) |
| 1 | ⚫ | Grito de guerra | Trama1 | Trama1 (igual) |
| 2 | ⚫4 | Ejecución | Ataque+2 | → **Decapitación** Ataque+3 |
| 3 | ⚫ | Proclama | Trama3 | Trama3 (igual) |

> **CD1 doble (v6):** Tajo (Ataque) y Grito de guerra (Trama) son las dos básicas siempre disponibles del Verdugo, ambas ⚫ sin modificador. Resuelven el caso de carta 📜 con Proclama aún en calentamiento.
> **⚫4:** cualquier Núcleo con valor exactamente 4 (el máximo en rango 1-4). Se activa el 25% de las veces. Si no hay Núcleo de valor 4 disponible, no puede usar Ejecución/Decapitación.

### 4.1bis Escalera de Calentamiento del Verdugo
| | T1 | T2 | T3 |
|--|--|--|--|
| Tajo (CD1) | ✅ | ✅ | ✅ |
| Grito de guerra (CD1) | ✅ | ✅ | ✅ |
| Ejecución (CD2) | — | ✅ | ✅ |
| Proclama (CD3) | — | — | ✅ |

### 4.2 Vida y Fases
- **Total: 80 HP** (bajado de 90 en v6, ver Sistema y Balanceo §6.bis.1)
- Fase 1: 80 → 40 HP (~8 turnos objetivo, a confirmar con Devkit)
- Fase 2: 40 → 0 HP

### 4.3 IA de Prioridades
```
TURNO DEL VERDUGO:
  1. Robar carta de Dramaturgia → resolver efecto
  2. Según icono:

  Si ⚔️:
    A. ¿Hay Núcleo de valor 4 disponible?
       SÍ → Ejecución/Decapitación (⚫4)
       NO → Tajo (⚫, CD1, siempre disponible)

  Si 📜:
    A. ¿Proclama desbloqueada (fuera de calentamiento, desde T3)?
       SÍ → Proclama (⚫)
       NO → Grito de guerra (⚫, CD1, siempre disponible)

  CAPA 2 — qué Núcleo usar (coste ⚫):
    1. ¿Hay Núcleo de color del jugador (🔴🔵🟣) con valor ≥3?
       SÍ → usar ese (denial táctico, el mayor de ellos)
    2. ¿No? → usar el mayor valor disponible de cualquier color
    3. Empate → cualquiera
```

### 4.4 Secuaces del Verdugo
- **Esbirro refuerzo:** Vida4, Ataque1 plano. Sin Arrollar.
- **Esbirro Defensor:** Vida6, Ataque1, keyword **Defensor** (el jugador debe atacarlo o recibir su daño primero).
- Entran en warmup (no actúan el turno que son invocados).
- **1 esbirro actúa por turno enemigo.** Selección: aleatorio **con filtro de validez** (descarta los que están en CD o sin Núcleo disponible; si ninguno tiene acción especial, uno al azar usa ataque plano).
- **Presencia pasiva (Verdugo):** cada esbirro en mesa → **+1 al daño de cada Proclama**. Acumulable, sin tope.
- **Presencia pasiva (Bastión):** cada esbirro en mesa → el Verdugo gana **+1 escudo persistente** al inicio del turno enemigo. Acumulable con lo anterior. **Observado en simulación: se satura el tope de 5 muy rápido con ≥2 esbirros vivos** (ya en el turno 6 de la primera simulación completa) — a partir de ahí el exceso se desperdicia. No parece alargar la pelea, pero sí reduce el valor de la pasiva pasado ese punto.
- **Gestionar mesa es obligatorio, no opcional.** Ver error común #12 en §0.

---

## 5. EL BASTIÓN — Escenario de Prueba

### 5.1 Trama: "La defensa se resquebraja"
- Sube por Proclama (Trama3) y por efectos de cartas de Dramaturgia.
- NO sube automáticamente.
- **Propiedad de esbirro del Bastión:** cada esbirro en mesa → el Verdugo gana **+1 escudo persistente** al inicio del turno enemigo. Se acumula con la propiedad del Verdugo (+1 daño Proclama/esbirro). Ignorar esbirros castiga por dos vías: Trama más rápida + Verdugo más blindado.

| Umbral | Efecto (activo mientras Trama ≥ umbral) |
|--------|----------------------------------------|
| 5 | Ataques del Verdugo hacen +1 daño |
| 10 | Jugador pierde 1⚡ al inicio de su turno |
| 15 | 2 daño inabsorbible al inicio del turno del jugador |
| 20 | **DERROTA. El Bastión cae** |

> **Los umbrales son acumulativos.** Con Trama=16, los tres primeros están activos.
> **Los efectos se desactivan si la Trama baja del umbral.**

### 5.2 Objetivos
| Objetivo | Estado |
|----------|--------|
| Derrotar al Verdugo | Base |
| Victoria con Trama final ≤5 | Sobre de Oro |
| Derrotar ≥2 secuaces | Sobre de Plata |
| *(Oculto)* Ganar sin recibir el Ultimátum | +25 Créditos |

---

## 6. MAZO DE DRAMATURGIA (30 CARTAS)

**Ratio: 18⚔️ / 12📜 (60% / 40%)**

### Cartas del Verdugo (10)
| Carta | ⚔️/📜 | Efecto de carta | Copias |
|-------|--------|-----------------|--------|
| Llamada a filas | ⚔️ | Invoca Esbirro refuerzo (Vida4) | ×2 |
| Golpe de apertura | ⚔️ | Ataque+1 este turno | ×2 |
| Barrido brutal | ⚔️ | 2 daño a cada Aliado en mesa | ×2 |
| Invocación Defensor | ⚔️ | Invoca Esbirro Defensor (Vida6) | ×2 |
| Ultimátum | 📜 | 3 daño inabsorbible al Líder | ×1 |
| El Verdugo Despierta | 📜 | Verdugo recupera 3HP | ×1 |

### Cartas del Bastión (10)
| Carta | ⚔️/📜 | Efecto de carta | Copias |
|-------|--------|-----------------|--------|
| Las murallas ceden | 📜 | Trama2 adicional | ×2 |
| Refuerzo inesperado | ⚔️ | Invoca Esbirro refuerzo (Vida4) | ×2 |
| Terreno hostil | 📜 | Jugador pierde 1⚡ | ×2 |
| Posición defensiva | ⚔️ | Verdugo gana 2 escudo | ×2 |
| Grietas en la defensa | 📜 | Siguiente daño al Líder es inabsorbible | ×1 |
| Barricada derrumbada | 📜 | Trama3 adicional | ×1 |

### Cartas Comunes (10)
| Carta | ⚔️/📜 | Efecto de carta | Copias |
|-------|--------|-----------------|--------|
| Presión constante | ⚔️ | Ataque+1 este turno | ×2 |
| Momento de duda | 📜 | Jugador descarta 1 carta | ×2 |
| Flanqueo | ⚔️ | 2 daño directo al Líder (inabsorbible) | ×2 |
| Intimidación | 📜 | Jugador pierde 1⚡ | ×2 |
| Emboscada | ⚔️ | Invoca Esbirro refuerzo (Vida3) | ×2 |

> **Nota Flanqueo:** el daño directo al Líder de Flanqueo es inabsorbible (ignora Aliados y escudo) para diferenciarlo del Ataque normal.

---

## 7. ORDEN DE ROBO PARA SIMULACIÓN

Para reproducibilidad, usar este orden de Dramaturgia (barajar aleatoriamente en partidas reales):

**Mazo de prueba (sugerido):**
1. Presión constante ⚔️
2. Las murallas ceden 📜
3. Llamada a filas ⚔️
4. Terreno hostil 📜
5. Barrido brutal ⚔️
6. Momento de duda 📜
7. Golpe de apertura ⚔️
8. Las murallas ceden 📜
9. Emboscada ⚔️
10. Ultimátum 📜
11. Flanqueo ⚔️
12. Intimidación 📜
13. Invocación Defensor ⚔️
14. Refuerzo inesperado ⚔️
15. Intimidación 📜
16. Presión constante ⚔️
17. Barricada derrumbada 📜
18. Refuerzo inesperado ⚔️
19. Terreno hostil 📜
20. Llamada a filas ⚔️
21. Grietas en la defensa 📜
22. Flanqueo ⚔️
23. Golpe de apertura ⚔️
24. Momento de duda 📜
25. Barrido brutal ⚔️
26. El Verdugo Despierta 📜
27. Emboscada ⚔️
28. Posición defensiva ⚔️
29. Posición defensiva ⚔️
30. El Verdugo Despierta 📜

> Al agotarse el mazo: **rebarajar y continuar.**

---

## 8. KEYWORDS DE REFERENCIA RÁPIDA

| Keyword | Significado |
|---------|-------------|
| **Ataque** | Daño = valor del Núcleo |
| **Ataque+X** | Daño = Núcleo + X |
| **Ataque×X** | Daño = Núcleo × X |
| **Trama X** | Mueve Trama X pasos (enemigo sube, jugador baja) |
| **Defensa X** | Crea X fichas de escudo persistentes (tope global 5) |
| **Umbral** | Si Núcleo ≥3, activa efecto extra |
| **Combo** | Permite una acción extra este turno |
| **Arrollar** | Daño excedente al Aliado/escudo pasa al Líder |
| **Defensor** | Jugador debe recibir/atacar a este secuaz primero |
| **Berserker** | Todo el redirect de daño va a este Aliado obligatoriamente |

---

## 9. PLANTILLA DE ESTADO POR TURNO

Usar este formato para trackear el estado en cada turno:

```
--- TXJ (Turno X, Jugador) ---
HP: XX · Escudo: X · ⚡: X · Trama: X · Mano: [cartas]
Mesa: [Aliados activos con HP]
Pool: 🔴X · 🔵X · 🟢X · 🟡X · 🟣X
CDs: Martillo(X) Temple(X) Coladura(X) GranF(X)
Inicio: [elección de Energía o Canalizar]
A1: [acción] → [resultado]
A2: [acción] → [resultado]
Pool tras turno: [restantes]

--- TXV (Turno X, Verdugo) ---
HP Verdugo: XX · Fase: X
Carta Dramaturgia: [nombre] [⚔️/📜]
Efecto carta: [qué hace]
IA: [habilidad elegida] (coste: [Núcleo usado])
Daño/Trama: [resultado]
Esbirros: [quién actúa, resultado]
Trama tras turno: X
Pool tras turno: [restantes]
```

---

## 10. REFERENCIA DE NÚMEROS CLAVE

| Valor | Referencia |
|-------|-----------|
| HP Forjador | 32 |
| HP Verdugo Fase 1 | 40 |
| HP Verdugo Fase 2 | 40 (total 80) |
| Energía inicial | 2 |
| Energía máxima | 5 |
| Escudo máximo | 5 |
| Trama derrota | 20 |
| Umbrales Trama | 5 / 10 / 15 / 20 |
| Núcleos rango | 1-4 |
| Umbral Núcleo | ≥3 (no aplica en CD1) |
| Media Núcleo | 2.5 |
| Daño Martillo (media) | 2.5 (Ataque puro, CD1 sin modificador) |
| Daño Grito de guerra | Trama1 (básica CD1 del Verdugo) |
| Daño Ejecución (⚫4) | 6 (4+2) — solo con valor 4 |
| Daño Decapitación (⚫4) | 7 (4+3) — Fase 2 |
| Daño Tajo (media) | 2.5 (Ataque puro, CD1) |
| Daño Coladura umbral (Núcleo 4) | 8 (×2) — techo CD3 |
| Daño GranF N1 (Núcleo 4) | 12, auto-daño 4 |
| Daño GranF N3 (Núcleo 4) | 16, auto-daño 4 — techo |
| Daño Esbirro | 1 plano |
| Pasivo esbirro (Verdugo) | +1 daño Proclama c/u |
| Pasivo esbirro (Bastión) | +1 escudo persistente Verdugo c/u |
| Tope blando vida enemigo | 100HP máximo, sin excepción |

---

## 11. REFERENCIA: PRIMERA SIMULACIÓN COMPLETA (sesión v6, 20 jun 2026)

Se jugó una partida completa Forjador vs Verdugo en El Bastión hasta cerca del fin de Fase 1 (con los números de v5, anteriores a esta revisión — vida Verdugo 90HP, Martillo Ataque+1). Resultado relevante más allá de los números concretos:

**Lección principal:** el jugador (simulado con criterio "competente" pero sin checklist explícita) ignoró durante 9 turnos completos a 2 Esbirros Defensor invocados por el Verdugo, dedicando todas sus acciones a daño directo al Líder enemigo. Esto disparó ambas pasivas acumulables a la vez (Trama acelerada por Proclama + escudo del Verdugo reforzado por la pasiva del Bastión), llevando al Forjador a un mínimo de 8HP/32 antes de estabilizarse con un Contratiempo.

**Conclusión confirmada:** esto no es un fallo de balance — es la keyword Defensor y las pasivas acumulables de esbirros funcionando exactamente como están diseñadas para castigar la inacción. **Cualquier IA del Líder usada en el Devkit (ver documento Devkit v1, §4) debe incluir explícitamente la prioridad de eliminar secuaces con keyword Defensor cuando sea eficiente hacerlo**, o las simulaciones masivas reproducirán este mismo sesgo de forma sistemática y darán una lectura de balance distorsionada (ritmo más lento de lo real, HP del Líder más bajo de lo real).

**Otras observaciones de esa partida:**
- Contratiempo (Enfriar el metal) funcionó como red de seguridad exactamente según lo previsto, deshaciendo un turno entero de daño en el momento de mayor tensión.
- El escudo persistente del Bastión saturó el tope (5) ya en el turno 6 con 2 esbirros vivos — confirma la sospecha de §13.1 del Sistema y Balanceo.
- Gran Fundición con Núcleo bajo (1-2) resulta decepcionante comparado con Martillo — esperado, es la naturaleza del color Caos (alto riesgo solo paga con Núcleo alto).

*Esta sección documenta una partida jugada con los números de v5 (pre-revisión). Los números base del sistema han cambiado en v6 (ver cambios en cabecera); la lección de gestión de mesa permanece válida independientemente de la versión numérica.*

---

*Simulación Prototipo v1.2 — actualizada en sesión v6, 20 de junio de 2026.*
*Adjuntar junto al GDD v5, Sistema y Balanceo v6 y Devkit v1 al inicio de sesiones de simulación.*
