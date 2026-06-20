# SISTEMA Y BALANCEO — THE COLLECTOR
## Documento de trabajo · Borrador v6

> **Cómo leer este documento:**
> - 🟢 **FIRME** — decisión estructural cerrada.
> - 🟡 **BORRADOR** — propuesta numérica por validar.
> - ⬜ **ABIERTO** — planteado, sin decidir.
>
> *Actualizado el 20 de junio de 2026. Continúa el GDD v5.*

> **Cambios de la sesión v6 (20 jun 2026):**
> - **CD1 del Líder pasa a ser puro**: Ataque=Núcleo / Trama=Núcleo, sin +X/×X/Umbral. Los modificadores empiezan en CD2+. Norma sólida con posibilidad de excepción deliberada por identidad (no por defecto).
> - **Benchmark base recalculado: 2.5** (antes 3.5, que llevaba un +1 ya incluido).
> - **Enemigo: CD1 pasa a tener 2 habilidades básicas**, una de Ataque y una de Trama, **ambas siempre ⚫** (sin color). Modificador opcional ±2 por enemigo para dar identidad temprana.
> - **Presupuesto de carta recalibrado: 4 + Energía** (acción baja de 3.5 a 2.5, coherente con el nuevo benchmark).
> - **Combo** (antes "Genera Combo"): keyword renombrada. Tooltip: "permite una acción extra este turno". Principio: siempre aprovechable, nunca debería desperdiciarse.
> - **Tope blando de vida de enemigo: máximo 100HP**, sin excepción. Ritmo lento se corrige ajustando habilidades, nunca inflando vida por encima del tope.
> - Nuevo documento complementario: **Devkit v1** (editor de contenido + validador por simulación masiva).
>
> *Cambios de la sesión v5 (19 jun 2026), ya integrados:*
> - Coladura ardiente: umbral pasa a Ataque×2 (techo 8, dentro de CD3).
> - Principio de dificultad = TIEMPO, no turnos (5/10/15/20 min).
> - Reglas de tasación para cancelación y permanentes.
> - Yunque del Maestro: condición pasa a Trama≥3.
> - Regla de color Caos (🟣): auto-daño = valor del Núcleo gastado.
> - Gran Fundición Nivel 3: pasa a Ataque×4.
> - Esbirros: presencia pasiva acumulable + selección aleatoria con filtro de validez.
> - Verdugo: esbirros dan +1 daño Proclama. Bastión: esbirros dan +1 escudo persistente al Verdugo.

---

## 0. RESUMEN DE LO DECIDIDO

| Bloque | Estado | Resumen |
|--------|--------|---------|
| Colores de Núcleo | 🟢 | 5 colores, identidad mecánica leve |
| Rango de Núcleos | 🟢 | Base 1-4. Umbral ≥3. Modificable (dados virtuales) |
| Rarezas | 🟢 | Rareza = rol/organización/cosmético, nunca poder |
| Dos economías | 🟢 | Cartas → Energía · Habilidades → Núcleos |
| 2 acciones por turno | 🟢 | Plan B siempre disponible (Canalizar o +Energía) |
| Energía inicial | 🟢 | 2 Energía al empezar |
| CD mínimo 1 | 🟢 | CD1 del Líder siempre ⚫, **siempre puro** (sin +X/×X/Umbral) |
| CD1 del Enemigo | 🟢 | **2 habilidades básicas** (Ataque + Trama), ambas siempre ⚫ |
| Calentamiento | 🟢 | Todo arranca en CD. Escalera de apertura |
| Gramática del Núcleo | 🟢 | Ataque / Ataque+X / Ataque×X. Umbral ≥3. CD1 sin modificador |
| Arrollar | 🟢 | Sin keyword: exceso de daño se pierde |
| Notación de costes | 🟢 | ⚫, 🔴, ⚫3, 🔴🟡🟢 |
| Trama | 🟢 | No automática. Solo sube por 📜 y efectos de carta |
| Dramaturgia | 🟢 | Siempre roba 1 carta/turno. Icono ⚔️/📜 |
| Mazo Dramaturgia | 🟢 | 30 cartas (10 enemigo + 10 escenario + 10 comunes) |
| Aliados | 🟢 | Bloquean desde que entran. Habilidades en CD |
| Defensa / Escudos | 🟢/🟡 | Persistente, proactiva. Tope 5 (🟡) |
| Contratiempo | 🟢 | Counter diferido. Paga Energía |
| Evolución en batalla | 🟢 | Checkpoints fijos/variables, elige-1-de-3 |
| Level-Up | 🟢 | 3 niveles, definidos en editor |
| Deck-out | 🟢 | Rebaraja por defecto |
| Dados virtuales | 🟢 | Rango 1-4 modificable por cartas/efectos/escenarios |
| Sobres | 🟢 | Personaje 15 / Enemigo 16 / Escenario 16 |
| Pool de comunes | 🟢 | 30 Dramaturgia + 50 jugador al lanzamiento |

---

## 1. LOS 5 COLORES DE NÚCLEO 🟢

| Color | Forma | Identidad | Empuje |
|-------|-------|-----------|--------|
| 🔴 Rojo | Rombo | **Agresión** | Daño directo, presión, cierre |
| 🔵 Azul | Círculo | **Control** | Tempo, Trama, CDs ajenos, anular |
| 🟢 Verde | Hexágono | **Defensa** | Prevenir, curar, escudos |
| 🟡 Amarillo | Triángulo | **Recurso** | Robar, Energía extra, reciclar |
| 🟣 Morado | Estrella | **Caos** | Riesgo/recompensa, Ataque×X |

- **Pool compartido:** negar un color al rival gastándolo tú es jugada táctica.
- 🔵 Control = **el color de la Trama** (por convención de diseño).
- CD1 del Líder siempre **⚫** (acceso garantizado).

---

## 2. RANGO DE NÚCLEOS Y DADOS VIRTUALES 🟢

**Rango base: 1-4.** Media: 2.5.

| Valor | Frecuencia | Carácter |
|-------|-----------|----------|
| 1 | 25% | Bajo |
| 2 | 25% | Bajo-medio |
| 3 | 25% | Umbral ✓ |
| 4 | 25% | Máximo. Umbral ✓ |

**Umbral ≥3** activa bonus. Se cumple el 50% de las veces.

### 2.1 Dados Virtuales 🟢
El rango base (1-4) puede ser **modificado temporalmente** por cartas, habilidades, pasivos o escenarios. Ejemplos:
- *Truncar por abajo:* "mínimo 2 este turno" → valores posibles: 2/3/4.
- *Truncar por arriba:* "máximo 2 este turno" → valores posibles: 1/2.
- *Expandir:* "el pool se relanza con dados de 6" → valores posibles: 1-6.
- *Fijar:* "el siguiente Núcleo vale 4" → exactamente 4.
- *Filtrar:* "todos los Núcleos son impares" → 1/3.

**Palanca de diseño única del medio digital.** En físico sería inmanejable; aquí es un número en memoria.

---

## 3. LAS DOS ECONOMÍAS 🟢

| Recurso | Paga por | Naturaleza |
|---------|----------|------------|
| **ENERGÍA** | Bajar cartas (1-5) | Renovable, tope 5 |
| **NÚCLEO** | Activar habilidades | Azaroso, compartido |

### 3.1 Modelo de Energía
- La elección de inicio de turno (Energía o Canalizar) **NO consume acción.**
- **Energía inicial: 2.**
- Peso ~1/punto. Escasez = coste de oportunidad (Energía no robada = carta no robada).
- Auto-reglas: mano 10 → Energía forzada; Energía 5 → robo forzado.
- **Canalizar y +Energía son también acciones disponibles** (plan B para Acción Muerta).

---

## 4. TEMPO, COOLDOWNS Y CALENTAMIENTO 🟢

**Recurso escaso real = ACCIÓN** (2/turno). El CD clasifica el techo de poder.

| CD | Qué es | Techo |
|----|--------|-------|
| **1** | Pan de cada turno. **Siempre ⚫.** | Bajo |
| **2** | Jugada de ritmo | Medio |
| **3** | Golpe fuerte espaciado | Alto |
| **4+** | Ultimate | Muy alto |

**Plantilla del Líder:** 4 habilidades CD 1/2/3/4. CD1 siempre ⚫.

**Calentamiento:** todo arranca en CD (jugador y enemigo). Escalera de apertura:

| | T1 | T2 | T3 | T4 |
|--|--|--|--|--|
| CD1 | ✅ | ✅ | ✅ | ✅ |
| CD2 | — | ✅ | ✅ | ✅ |
| CD3 | — | — | ✅ | ✅ |
| CD4 | — | — | — | ✅ |

**Aliados:** bloquean desde que entran. Sus habilidades activas arrancan en CD.

---

## 5. GRAMÁTICA DEL NÚCLEO 🟢

Pagas 1 Núcleo del color requerido. El valor del Núcleo opera según la habilidad:

| Keyword | Efecto | Rango con base 1-4 |
|---------|--------|--------------------|
| **Ataque** | Daño = Núcleo | 1-4 |
| **Ataque +X** | Daño = Núcleo + X | 1+X a 4+X |
| **Ataque ×X** | Daño = Núcleo × X | X a 4X |
| **Umbral ≥3** | Si Núcleo ≥3, efecto extra | 50% de frecuencia |

**Benchmark "cero":** Líder CD1, ⚫ → Ataque puro (sin modificador). Media: **2.5 daño.**

### 5.0 CD1 — Siempre Puro 🟢
**CD1 nunca lleva modificador.** Ni +X, ni ×X, ni Umbral. Es Ataque=Núcleo o Trama=Núcleo, sin más. Los modificadores (+X, ×X, Umbral) empiezan a aparecer desde CD2 en adelante, donde ya hay algo a cambio (CD más alto, color requerido, riesgo).

Razón: CD1 es la acción de relleno garantizada, la que nunca falla (regla de "nunca Acción Muerta"). Si ya lleva modificador de fábrica, el benchmark de referencia del sistema queda inflado artificialmente y distorsiona todos los presupuestos que se anclan contra él.

**Esto es norma sólida, no ley absoluta.** Un Líder concreto puede romperla con criterio si su identidad lo pide explícitamente (fase conservadora: norma primero, excepción deliberada después) — pero el valor por defecto, y el que se usa como benchmark del sistema, es CD1 puro.

**El Enemigo no tiene este mismo problema** porque su CD1 nunca llevó modificador en el sistema base; ver §6.1bis para su estructura de CD1 doble.

### 5.1 Arrollar 🟢
**Sin Arrollar (por defecto):** el daño excedente al escudo o al Aliado **se pierde.** El Líder no recibe el exceso.
**Con Arrollar:** el exceso pasa al Líder (o al siguiente objetivo). Debe estar escrito explícitamente.

### 5.2 Regla de Color — Caos (🟣) 🟢
**Toda habilidad de Caos inflige auto-daño igual al valor del Núcleo gastado.**

No es una propiedad de una carta concreta: es la identidad mecánica del color morado. Cualquier carta 🟣 futura la hereda sin reexplicarla.

- Crea un ratio legible: el riesgo escala con la recompensa (sacas más daño con Núcleo alto, pero pagas más vida).
- Evita el doble castigo de la mala suerte: con Núcleo 1 el auto-daño es solo 1, no un golpe fijo que te machaca por una tirada baja.
- Ejemplo (Gran Fundición, Ataque×3): Núcleo 1 → 3 daño / −1 vida. Núcleo 4 → 12 daño / −4 vida.

---

## 6. EL ENEMIGO 🟢

### 6.1 Turno del Enemigo
1. **Roba la carta superior de Dramaturgia.**
2. **Resuelve el efecto de la carta** (invocar secuaz, daño, Trama extra, etc.).
3. **Ejecuta habilidad según el icono:**
   - ⚔️ → habilidad de ataque (según IA de prioridades).
   - 📜 → habilidad de Trama.

### 6.2 Recursos
- **No usa Energía.** Solo Núcleos.
- Arranca en cooldown.

### 6.3 IA de Prioridades
```
Cuando carta ⚔️:
  1. Habilidad firma — si tiene Núcleo mínimo (⚫3, ⚫4...) disponible
  2. Habilidad básica de Ataque (CD1, ⚫) — siempre disponible

Cuando carta 📜:
  1. Habilidad de Trama de mayor CD — si está desbloqueada (fuera de calentamiento)
  2. Habilidad básica de Trama (CD1, ⚫) — siempre disponible

Capa 2 — selección de Núcleo (coste ⚫):
  → Colores del jugador con valor ≥3 primero (denegar)
  → Si no: mayor valor disponible
  → Si empate: cualquiera
```

### 6.1bis CD1 del Enemigo — Doble Básica 🟢
**El Enemigo tiene 2 habilidades en CD1, no 1.** Una de Ataque básico, una de Trama básico. **Ambas siempre ⚫** (sin color), igual que el CD1 del Líder.

Razón: el icono de la carta de Dramaturgia (⚔️/📜) determina qué tipo de habilidad ejecuta el Enemigo. Si solo existiera una habilidad en CD1 (de Ataque), una carta 📜 que cayera mientras la habilidad de Trama de mayor CD sigue en calentamiento dejaría al Enemigo sin acción válida — un agujero de regla real, detectado en simulación (carta 📜 + Proclama en CD, sin fallback definido). Con la doble básica, el icono siempre tiene un relleno garantizado.

**Por qué ambas van sin color:** si llevaran color, dejarían de estar "siempre disponibles", contradiciendo el propósito de ponerlas en CD1. La identidad del Enemigo no vive en su CD1 — vive en sus habilidades de CD más alto.

**Modificador opcional ±2:** a diferencia del Líder (CD1 siempre puro), las básicas del Enemigo sí pueden llevar un modificador en rango ±2 (ej. "Ataque+1", "Trama-1") como herramienta de identidad temprana, porque el Enemigo no tiene una progresión de nivel dentro de la batalla que le permita expresar personalidad poco a poco — su única vía inmediata es esa primera pareja de básicas. Esto es libre por enemigo; no hay regla de equilibrio fijada entre ambas todavía (⬜, ver Pendientes).

### 6.4 Fases
- 2-3 fases (variable). Cada cambio = hito + checkpoint de evolución.

### 6.5 Selección del esbirro activo 🟢
Cuando hay varios esbirros en mesa, **1 actúa por turno enemigo** (la asimetría de acciones se mantiene: el enemigo nunca inunda de ataques). El que actúa se elige así:
1. Se descartan los esbirros cuya acción no es ejecutable ahora (habilidad en CD, o pide un Núcleo que no hay en el pool).
2. De los que **sí** pueden actuar, se elige **uno al azar**.
3. Si ninguno tiene acción especial disponible, actúa uno al azar con su **ataque plano** (siempre ejecutable).

> Coherente con "nunca hay acción muerta": el esbirro elegido siempre hace algo útil. El azar se mantiene, pero filtrado por validez.

## 6.bis PRINCIPIO DE DIFICULTAD = TIEMPO 🟢

**La dificultad se mide en tiempo real de partida, no en número de turnos.**

| Dificultad | Tiempo objetivo |
|------------|-----------------|
| Mega fácil | ~5 min |
| Fácil | ~10 min |
| Normal | ~15 min |
| Difícil | ~20 min |
| Reto | más |

**Clave:** el tiempo por turno NO es constante — sube con la dificultad. Un enemigo fácil se juega en automático (~15-25 s/turno); uno difícil obliga a pensar (~40-50 s/turno: más telegrafío que valorar, pools que importan, decisiones de Contratiempo, Trama apretada).

**Consecuencia de diseño:** la duración se alarga aumentando la **densidad de decisión por turno**, NUNCA inflando vida (esponjas). Una esponja plana alarga la parte aburrida, no la interesante. Para combates más largos: más fases, mecanismos que cambian cómo juegas, secuaces con efectos — no más HP.

### 6.bis.1 Tope Blando de Vida de Enemigo 🟢

**Ningún enemigo, en ningún nivel de dificultad, debería superar los 100HP.** Es un tope estructural, no orientativo.

Si un enemigo se siente "corto" o el ritmo va lento respecto al objetivo de tiempo, la solución es **ajustar sus habilidades** (daño por turno, mecánicas de fase, presión de secuaces/Trama) — nunca subir la vida por encima del tope. Esto es consecuencia directa del principio de §6.bis: la dificultad la da la densidad de decisión, y una vida excesiva es precisamente la esponja que ese principio prohíbe.

---

## 7. LA TRAMA 🟢

**No es un timer automático: es un recurso bidireccional.**

### 7.1 Cómo Sube
- Carta 📜 → enemigo ejecuta habilidad de Trama (ej. Proclama Trama3).
- Efectos de carta de Dramaturgia (ej. "Las murallas ceden: Trama2 adicional").
- **NO sube automáticamente** cada turno.

### 7.2 Keyword Trama X
- Sin +/-. La dirección la da el contexto:
  - Enemigo/Dramaturgia → suma X.
  - Jugador → resta X.
  - Si el escenario invierte esto, lo dice explícitamente.

### 7.3 Cómo Frenarla
| Fuente | Cuesta |
|--------|--------|
| Habilidad de Líder anti-Trama (🔵) | Acción + Núcleo + CD |
| Carta de jugador anti-Trama | Energía + activación |
| Objetivo del escenario | Condicionado |

### 7.4 Reglas
- El daño de Trama es **inabsorbible**.
- Umbral final = derrota alternativa.
- ~15 turnos para llegar al umbral final sin gestión (depende del ratio 📜 del mazo).

---

## 8. MAZO DE DRAMATURGIA 🟢

**30 cartas** totales: 10 del enemigo + 10 del escenario + 10 comunes.

### 8.1 Estructura de las Cartas
Cada carta tiene:
- **Icono ⚔️ o 📜** (determina qué habilidad ejecuta el enemigo).
- **Efecto propio** (siempre resuelve, independientemente del icono).

Ninguna carta está vacía. El icono y el efecto son siempre relevantes.

### 8.2 Ratio ⚔️/📜
Emerge del diseño de las cartas incluidas. No se declara externamente. Un enemigo agresivo tendrá más ⚔️ naturalmente.

### 8.3 Mazo del Verdugo (Prototipo)
**10 cartas del Verdugo:**
| Carta | ⚔️/📜 | Efecto | Copias |
|-------|--------|--------|--------|
| Llamada a filas | ⚔️ | Invoca Esbirro (Vida4, Ataque1) | ×2 |
| Golpe de apertura | ⚔️ | Ataque+1 este turno | ×2 |
| Barrido brutal | ⚔️ | 2 daño a cada Aliado | ×2 |
| Invocación Defensor | ⚔️ | Invoca Esbirro Defensor (Vida6) | ×2 |
| Ultimátum | 📜 | 3 daño inabsorbible al Líder | ×1 |
| El Verdugo Despierta | 📜 | El Verdugo recupera 3HP | ×1 |

**10 cartas del Bastión:**
| Carta | ⚔️/📜 | Efecto | Copias |
|-------|--------|--------|--------|
| Las murallas ceden | 📜 | Trama2 adicional | ×2 |
| Refuerzo inesperado | ⚔️ | Invoca Esbirro (Vida4) | ×2 |
| Terreno hostil | 📜 | Jugador pierde 1⚡ | ×2 |
| Posición defensiva | ⚔️ | Verdugo gana 2 escudo | ×2 |
| Grietas en la defensa | 📜 | Siguiente daño al Líder inabsorbible | ×1 |
| Barricada derrumbada | 📜 | Trama3 adicional | ×1 |

**10 cartas Comunes:**
| Carta | ⚔️/📜 | Efecto | Copias |
|-------|--------|--------|--------|
| Presión constante | ⚔️ | Ataque+1 este turno | ×2 |
| Momento de duda | 📜 | Jugador descarta 1 carta | ×2 |
| Flanqueo | ⚔️ | 2 daño directo al Líder | ×2 |
| Intimidación | 📜 | Jugador pierde 1⚡ | ×2 |
| Emboscada | ⚔️ | Invoca Esbirro (Vida3) | ×2 |

**Total: 30 cartas · 18⚔️ / 12📜 (60%/40%)**

---

## 9. ALIADOS Y ABSORCIÓN 🟢

### 9.1 Reglas de Bloqueo
- Entran a mesa y **bloquean daño inmediatamente** (sin warmup para el bloqueo).
- Sus habilidades activas arrancan en **CD** (warmup normal).
- El jugador decide **libremente** si redirigir daño al Aliado. Sin gastar acción.

### 9.2 Arrollar en Aliados
- Sin Arrollar: el daño excedente al Aliado se pierde. El Líder no recibe el exceso.
- Con Arrollar (escrito en la habilidad/carta): el exceso pasa al Líder.

### 9.3 Vida del Aliado (🟡)
| Coste | Vida orientativa |
|-------|-----------------|
| 2⚡ | ~3-5 |
| 3⚡ | ~5-7 |
| 4⚡ | ~7-9 |
| 5⚡ | ~9-12 |

---

## 10. PRESUPUESTO DE PODER 🟡 BORRADOR

**1 punto ≈ 1 de daño.** Ajustado para Núcleos 1-4.

### 10.1 Tabla de HABILIDADES (presupuesto en Núcleo)

**COSTES:**
| Palanca | Pts |
|---------|-----|
| +1 Cooldown | ~1.5 |
| 1 Energía (si la pide) | ~1 |
| Condición de color | ~0.5 |
| Riesgo (auto-daño, Caos) | ~1-2 |
| Coste mínimo de Núcleo (⚫3/⚫4) | ~0.5-1 |

**EFECTOS:**
| Efecto | Coste | Nota |
|--------|-------|------|
| Ataque (Núcleo) | ~2.5 esperados | Media 1-4 |
| Ataque+X | 2.5+X | |
| Bonus umbral ≥3 | ~50% del efecto pleno | |
| Ataque×2 | ~5 esperados | 2.5×2, con riesgo |
| Ataque×3 | ~7.5 esperados | 2.5×3, con riesgo alto |
| Curar/prevenir 1 | ~1 🟡 | |
| Robar 1 carta | ~1.5 | |
| Aturdir/control 1 turno | ≥3 | Caro y raro |
| Trama 1 | ~1.3-1.5 🟡 | No lineal |
| Defensa 1 | ~1 🟡 | Persistente |

### 10.2 Tabla de CARTAS (presupuesto en Energía)

**Presupuesto = 4 + Energía** (Acción ~2.5 + carta ~1.5):

| Coste | Presupuesto |
|-------|-------------|
| 1⚡ | 5 pts |
| 2⚡ | 6 pts |
| 3⚡ | 7 pts |
| 4⚡ | 8 pts |
| 5⚡ | 9 pts |

> **Nota (v6):** la Acción bajó de 3.5 a 2.5 para mantener coherencia total con el nuevo benchmark de CD1 puro (§5.0). Antes la Acción representaba "una habilidad CD1 con +1 ya incluido"; ahora representa el benchmark real de una acción básica del sistema.
>
> **Nota (v5, histórica):** la acción se había bajado de 4 a 3.5 porque con **2 acciones por turno** cada acción vale ligeramente menos que en un sistema de 1 acción.

### 10.3 Tasación de cartas especiales 🟢

El presupuesto lineal asume **efecto fijo y conocido al jugar la carta.** Dos categorías rompen ese supuesto y se tasan aparte:

**Cancelación / Contratiempo:**
- Se tasan por el **valor esperado de lo que niegan** (la media de daño/efecto del enemigo por turno), **no por el techo.**
- Prima del **~50-100%** por ser defensa garantizada que no depende del pool de Núcleos (elimina varianza).
- El techo (cancelar un golpe enorme) NO se penaliza: exige timing y lectura del telegrafío, lo cual es habilidad del jugador, no un coste a pagar.
- Ej.: Enfriar el metal (2⚡) niega ~2.5 de media → con la prima, cuadra en presupuesto 6.

**Daño fijo (sin depender del Núcleo):**
- Recibe la misma lógica de prima por fiabilidad que la cancelación (~1.2-1.4x sobre el benchmark de Núcleo), porque elimina el riesgo del pool.
- Ej.: Coladura imprevista (6 daño fijo) → benchmark 2.5 × prima ~1.4-2x ≈ 3.5-5 "justo" → con prima generosa, cuadra en presupuesto 7 (3⚡).

**Permanentes / pasivos:**
- Presupuesto = **(valor por turno × ~4 turnos de vida útil esperada) × 0.6 de descuento** por incertidumbre (te lo pueden quitar, la partida puede acabar, la condición puede no cumplirse).
- Lo **condicional** baja más el multiplicador (cuenta solo los turnos en que la condición se cumple).
- Ej.: Yunque del Maestro (3⚡) con Trama≥3 → activo ~6-8 turnos de 15 → ~6-7 de valor → cuadra en presupuesto 7.

---

## 11. EL FORJADOR — Líder de Prueba 🟡

Colores: 🔴 Brasa · 🔵 Temple · 🟢 Yunque · 🟡 Mena · 🟣 Crisol.

### 11.1 Habilidades (Nivel 1)
| CD | Color | Nombre | Keywords |
|----|-------|--------|----------|
| 1 | ⚫ | Martillo de forja | Ataque (puro) |
| 2 | 🔵 | Temple de acero | Trama2·Defensa3. Umbral: Trama3·Defensa3 |
| 3 | 🔴 | Coladura ardiente | Ataque+3. Umbral: **Ataque×2** |
| 4 | 🟣 | Gran Fundición | Ataque×3. Auto-daño = valor del Núcleo |

Con Núcleos 1-4:
- Martillo: 1-4 daño (media 2.5).
- Coladura sin umbral (Núcleo 1-2): 4-5 daño. Con umbral (Núcleo 3-4): **6-8 daño** (techo 8, dentro de CD3). Salto suave y sin solapamientos: el +3 solo opera con Núcleo 1-2, el ×2 con Núcleo 3-4.
- Gran Fundición: 3-12 daño. Auto-daño = valor del Núcleo (Núcleo 1 → −1; Núcleo 4 → −4).

### 11.2 Los 3 Niveles
| Nivel | Cómo se gana | Cambio |
|-------|--------------|--------|
| 1 | Inicial | Habilidades de arriba |
| 2 | 1ª subida | Martillo: Ataque (puro) → **Ataque+1** (primer modificador del Líder) |
| 3 | 2ª subida | Gran Fundición: Ataque×3 → **Ataque×4** (mejora de techo; mantiene el auto-daño proporcional) |

> Nivel 3, GranF con Núcleos 1-4: 4 / 8 / 12 / **16** daño, con auto-daño 1 / 2 / 3 / 4. Techo 16 sujeto a tres condiciones que deben alinearse: CD4 + sacar 🟣4 del pool + pagar 4 de vida. Es el "momentazo" de Caos que no puedes forzar.

### 11.3 Pool de 10 Cartas
| # | Carta | Tipo | ⚡ | Efecto |
|---|-------|------|----|--------|
| 1 | Yunque del Maestro | Equipo | 3 | Pasivo: con Trama≥3, tus 🔴 hacen +1 daño |
| 2 | Aprendiz de fragua | Aliado | 2 | Vida4. Slot⚫ Ataque. Al entrar: +1⚡ |
| 3 | Coloso de hierro | Aliado | 5 | Vida10. Slot🟢 Defensa3 |
| 4 | El Yunque Viviente | Aliado | 4 | **Berserker.** Vida8. Slot🔴 Ataque+2 |
| 5 | Chispa Combustible | Evento | 1 | Roba 2. **Combo** |
| 6 | Coladura imprevista | Evento | 3 | 6 daño directo (fijo, sin Núcleo) |
| 7 | Enfriar el metal | Contratiempo | 2 | Cancela el daño del turno enemigo anterior |
| 8 | Romper el molde | Contratiempo | 3 | Cancela la última carta de Dramaturgia jugada |
| 9 | Apagar la fragua | Evento | 1 | Trama4 |
| 10 | Reforjar | Evento | 2 | Cura4·Defensa2 |

> **Cambios v6:** Martillo de forja pierde el +1 (ahora puro). Coladura imprevista sube de 2⚡ a 3⚡ (recalibrado contra el nuevo benchmark, ver §10.3). Genera Combo → Combo (renombrada, ver §4 GDD).

### 11.4 Mazo de Prueba (30 cartas, con repeticiones)
| Carta | Copias |
|-------|--------|
| Aprendiz de fragua | ×3 |
| Chispa Combustible | ×3 |
| Apagar la fragua | ×4 |
| Enfriar el metal | ×3 |
| Reforjar | ×4 |
| Coladura imprevista | ×4 |
| Romper el molde | ×3 |
| Yunque del Maestro | ×2 |
| Coloso de hierro | ×2 |
| El Yunque Viviente | ×2 |
| **Total** | **30** |

---

## 12. EL VERDUGO — Enemigo de Prueba 🟡

### 12.1 Habilidades Base
| CD | Coste | Nombre | Efecto |
|----|-------|--------|--------|
| 1 | ⚫ | Tajo | Ataque (puro) |
| 1 | ⚫ | Grito de guerra | Trama1 |
| 2 | ⚫4 | Ejecución | Ataque+2 |
| 3 | ⚫ | Proclama | Trama3 |

> **CD1 doble (v6):** el Verdugo tiene dos básicas en CD1, ambas ⚫ sin modificador (su identidad agresiva ya vive en Ejecución/Proclama, no necesita potenciar el relleno). Resuelve el caso de carta 📜 con Proclama todavía en calentamiento — ver §6.1bis del sistema general.

### 12.2 Fase 2 (≤40HP)
- Ejecución → **Decapitación:** ⚫4, Ataque+3.

### 12.3 IA del Verdugo
```
Carta ⚔️:
  1. Ejecución/Decapitación — si hay ⚫4 disponible
  2. Tajo — siempre (⚫, CD1)

Carta 📜:
  1. Proclama — si está fuera de calentamiento (desde T3)
  2. Grito de guerra — siempre (⚫, CD1)

Capa 2 — qué Núcleo gastar:
  → Colores del jugador (🔴🔵🟣) con valor ≥3 primero (denegar)
  → Si no: mayor disponible
```

### 12.3bis Escalera de Calentamiento
| | T1 | T2 | T3 |
|--|--|--|--|
| Tajo (CD1) | ✅ | ✅ | ✅ |
| Grito de guerra (CD1) | ✅ | ✅ | ✅ |
| Ejecución (CD2) | — | ✅ | ✅ |
| Proclama (CD3) | — | — | ✅ |

### 12.4 Vida y Fases
- Vida total: **80HP** (bajado de 90 en v6, ver §0bis Tope de vida del enemigo)
- Fase 1: 80HP → 40HP
- Fase 2: 40HP → 0HP

### 12.5 Secuaces del Verdugo
- **Esbirro refuerzo:** Vida4, Ataque1 plano (no B+Núcleo). No tiene Arrollar.
- **Esbirro Defensor:** Vida6, Ataque1, keyword **Defensor**.
- **Presencia pasiva (propiedad del Verdugo):** cada esbirro en mesa → **+1 al daño de cada Proclama** (Trama). Acumulable y sin tope. La presión de reloj escala con cuántos esbirros dejes vivos.

> **Nota de simulación (v6):** ignorar a los Esbirros Defensor con keyword Defensor es una decisión costosa por diseño — castiga por partida doble (Trama acelerada + escudo del Verdugo reforzado, ver §13.1). No es un fallo de balance: es la keyword Defensor funcionando como debe. La gestión de mesa (eliminar esbirros activamente) es esperada, no opcional.

---

## 13. EL BASTIÓN — Escenario de Prueba 🟡

### 13.1 Carta de Escenario
- **Propiedad de esbirro:** cada esbirro en mesa → el Verdugo gana **+1 escudo al inicio del turno enemigo**. El escudo es **persistente** (se acumula, no caduca). Acumulable y sin tope.
- **Regla emergente:** combinado con la propiedad del Verdugo, ignorar los esbirros te castiga por dos vías a la vez (la Trama corre más rápido Y el Verdugo se blinda). Derrotarlos deja de ser opcional → el objetivo "derrotar ≥2 secuaces" nace de la necesidad, no de la recompensa.
- **⬜ Pendiente de playtest:** si el escudo persistente atasca demasiado la pelea, bajar a "caduca al final del turno enemigo".

### 13.2 Trama: "La defensa se resquebraja"
- Sube por habilidades 📜 del Verdugo y por cartas de Dramaturgia.
- NO sube automáticamente.

| Umbral | Efecto |
|--------|--------|
| 5 | Ataques del Verdugo hacen +1 daño |
| 10 | Jugador pierde 1⚡ al inicio de su turno |
| 15 | 2 daño inabsorbible al inicio del turno del jugador |
| 20 | **DERROTA.** El Bastión cae |

### 13.3 Objetivos
| Objetivo | Recompensa |
|----------|------------|
| Derrotar al Verdugo | Base |
| Victoria con Trama final ≤5 | Sobre de Oro + 50 Créditos |
| Derrotar al menos 2 secuaces | Sobre de Plata + 50 Créditos |
| *(Oculto)* Ganar sin recibir el Ultimátum | +25 Créditos |

---

## 14. ANCLAJES NUMÉRICOS DE BATALLA 🟡 BORRADOR

| Anclaje | Propuesta | Razón |
|---------|-----------|-------|
| Vida del Líder | **28-38, neutro 32** | A validar en playtest (sin cambio en v6: el daño recibido del CD1 del Enemigo no varía) |
| Vida Enemigo (N1, prototipo) | **80HP en 2 fases** | 40+40 — bajado de 90 en v6 para reflejar el nuevo benchmark de daño del Líder. Tope blando: máx. 100HP en cualquier enemigo (§6.bis.1) |
| Daño habilidad básica | **Ataque puro (~2.5 media)** | Benchmark con 1-4, CD1 sin modificador (v6) |
| Energía máx | **5** | |
| Energía inicial | **2** | |
| Presupuesto de carta | **4 + Energía** | Cerrado en v6, coherente con benchmark 2.5 |
| Tope de escudo (Líder) | **5** | Punto de partida — observado en simulación: se satura rápido con ≥2 esbirros vivos (pasiva Bastión); revisar en playtest |
| Trama | **~15 turnos sin gestionar** | Con ratio 40% 📜 |
| Daño de secuaz | **1 plano** | 1 actúa/turno |
| Objetivo Fase 1 | **~8 turnos de jugador** | A validar — primera simulación dio ~9-10 turnos, pero con gestión de mesa subóptima (esbirros Defensor ignorados); ritmo real pendiente de confirmar con el Devkit |

---

## 15. PENDIENTES (orden sugerido)

1. 🟡 **Validar anclajes en playtest/Devkit** (vida Líder, vida por fase, Trama concreta, tope escudo) — ahora con simulación masiva disponible vía Devkit, no solo partidas manuales.
2. ✅ ~~Revisar presupuesto de carta con 2 acciones~~ → cerrado v5: 5 + Energía. **Recalculado en v6: 4 + Energía.**
3. ⬜ **Calibrar Fase 1** (ajustar vida del Verdugo según tiempo objetivo, no turnos) — vida ya bajada a 80HP en v6 como estimación razonada; validación fina pendiente del Devkit.
4. ✅ ~~Cerrar detalle del enemigo (calentamiento del Verdugo)~~ → cerrado v5, **actualizado v6:** escalera Tajo+Grito de guerra T1 / Ejecución T2 / Proclama T3 (CD1 doble).
5. ✅ ~~Tamaño del pool de comunes~~ → ya cerrado desde el GDD: 30 Dramaturgia + 50 jugador al lanzamiento.
6. ✅ ~~Secuaces: aleatorio puro vs con memoria~~ → cerrado: aleatorio con filtro de validez.
7. ⬜ **Esbirros: límite técnico de implementación** (muchos esbirros con efectos acumulados puede complicar rendimiento/legibilidad en pantalla — problema de implementación, no de diseño).
8. ⬜ **Escudo persistente del Bastión:** validado parcialmente en simulación v6 — satura el tope (5) muy rápido con ≥2 esbirros vivos, lo cual reduce su efecto a partir de cierto punto. No parece atascar la pelea (no alarga duración), pero desperdicia diseño pasado el punto de saturación. Confirmar con más simulaciones si es aceptable o si conviene revisar.
9. ✅ ~~CD1 del Líder/Enemigo~~ → cerrado v6: CD1 Líder siempre puro; CD1 Enemigo doble (Ataque+Trama, ambas ⚫).
10. ⬜ **Regla de equilibrio entre modificadores ±2 de las 2 básicas del Enemigo** (ej. si Ataque sube, ¿Trama debe bajar?) — libre por ahora, a decidir cuando se diseñe un segundo enemigo.
11. ⬜ **El Yunque Viviente (Berserker, slot Ataque+2):** tras el cambio de benchmark, tiene más ventaja relativa sobre el CD1 puro del Líder. Vigilar en playtest, no se ha tocado por iniciativa propia.
12. ⬜ Insignias/logros, tutorial, plataformas.
13. ⬜ Capa futura: cartas con saltos grandes al evolucionar.
14. ⬜ **Devkit:** alcance inicial (¿todo el contenido desde el día 1 o por fases?) y criterio de aprobación/rangos objetivo por dificultad — ver documento Devkit v1.

> **Cerrado en sesión v6:** CD1 Líder puro · benchmark 2.5 · CD1 Enemigo doble (Ataque+Trama, ⚫) · IA Verdugo sin agujero de regla · presupuesto carta 4+E · Coladura imprevista 3⚡ · Combo renombrado · vida Verdugo 80HP · tope blando 100HP enemigos · Devkit v1 diseñado.
>
> **Cerrado en sesión v5:** Coladura umbral ×2 · principio tiempo · presupuesto 5+E (superado por v6) · tasación especial · Yunque Trama≥3 · regla Caos auto-daño=Núcleo · GranF N3 ×4 · esbirros presencia pasiva acumulable · selección con filtro · pasivos Verdugo/Bastión.

---

*Borrador v6 — documento vivo. 🟡 negociable, 🟢 la base, ⬜ por decidir.*
