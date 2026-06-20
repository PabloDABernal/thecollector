# PROMPT DE SISTEMA — THE COLLECTOR (v6)
## Copiar al inicio de un nuevo chat para continuar el desarrollo

---

### CONTEXTO
Desarrollamos **"The Collector"**, juego de cartas PVE para un jugador. El jugador es un coleccionista de TCGs reales que adapta sus cartas para crear su propio sistema PVE solitario. Documentos vivos: GDD v5, Sistema y Balanceo v6, Simulación Prototipo v1.2, Devkit v1. Adjuntar los cuatro.

### REGLAS DE TRABAJO
- No asumir nada no definido. Proponer opciones, no imponer.
- Fase **conservadora**: fijar la norma sólida primero, pervertirla después con criterio.
- Distinguir 🟢 FIRME / 🟡 BORRADOR numérico / ⬜ ABIERTO.
- PVE, no PVP. Economía 100% in-game. Combo opcional, no el centro.
- **Aprovechar el medio digital** como palanca de diferenciación (cooldowns, Contratiempo, dados virtuales).
- **Ningún enemigo supera 100HP**, sin excepción. Ritmo lento se arregla ajustando habilidades, nunca inflando vida.
- Sesiones en **español**.

---

### LO YA CERRADO (🟢 FIRME)

**5 Colores de Núcleo:** 🔴 Agresión · 🔵 Control (Trama) · 🟢 Defensa · 🟡 Recurso · 🟣 Caos.

**Rango de Núcleos:** base **1-4**. Umbral **≥3** (50%). Rango **modificable** por cartas/habilidades/escenarios (dados virtuales de N caras — mecánica digital exclusiva).

**Notación de costes:** ⚫ (cualquier Núcleo) · 🔴 (rojo) · ⚫3 (mínimo 3) · 🔴🟡🟢 (uno de varios). El número = valor mínimo.

**Rarezas:** rol/organización/cosmético. NUNCA poder ni escasez.

**Dos economías:** Cartas → Energía (1-5). Habilidades → Núcleos. Energía inicial: 2.

**2 acciones por turno.** Plan B siempre disponible: Canalizar o +Energía son acciones válidas. CD1 del Líder siempre ⚫ → nunca Acción Muerta.

**CD1 del Líder: siempre puro.** Ataque=Núcleo / Trama=Núcleo, sin +X/×X/Umbral. Modificadores empiezan en CD2+. Norma sólida con posible excepción deliberada por identidad (no por defecto). Benchmark base: **2.5** de media.

**CD1 del Enemigo: doble básica.** Una de Ataque, una de Trama, **ambas siempre ⚫**. Modificador opcional ±2 por enemigo (identidad temprana, ya que el Enemigo no progresa de nivel dentro de la batalla).

**Combo = acción extra** (premium, opcional, keyword renombrada de "Genera Combo"). Tooltip: "permite una acción extra este turno". Siempre aprovechable: Canalizar/+Energía garantizan que nunca se desperdicia.

**Gramática del Núcleo:**
- Ataque = Núcleo
- Ataque+X = Núcleo+X
- Ataque×X = Núcleo×X
- **Caos (🟣): toda habilidad de este color inflige auto-daño = valor del Núcleo gastado** (regla de color)
- Umbral ≥3 activa bonus (no aplica en CD1, ver arriba)

**Arrollar:** sin esta keyword, el daño excedente al Aliado/escudo se pierde. Con Arrollar, pasa al Líder.

**Trama X (keyword bidireccional):** sin +/-. Contexto determina dirección (enemigo/Dramaturgia sube, jugador baja). NO sube automáticamente.

**Dramaturgia:** enemigo siempre roba 1 carta/turno. Icono ⚔️ = ejecuta habilidad de ataque (firma o básica CD1). 📜 = ejecuta habilidad de Trama (de mayor CD desbloqueada, o básica CD1). La carta también resuelve su efecto propio.

**Mazo de Dramaturgia: 30 cartas** (10 enemigo + 10 escenario + 10 comunes). Ratio ⚔️/📜 emerge del diseño.

**IA del enemigo:**
```
Carta ⚔️: 1. Habilidad firma (si Núcleo mínimo disponible) · 2. Básica de Ataque (⚫, CD1, siempre)
Carta 📜: 1. Habilidad de Trama de mayor CD (si desbloqueada) · 2. Básica de Trama (⚫, CD1, siempre)
Capa 2 (selección de Núcleo): colores del jugador ≥3 primero (denegar) → mayor disponible
```

**Calentamiento:** todo arranca en CD (jugador y enemigo). CD baja 1 por acción propia. Aliados: bloquean desde que entran, habilidades en CD.

**Defensa/Escudos:** proactiva. Fichas persistentes. Tope 5 (🟡 — observado que se satura rápido con ≥2 esbirros vivos en simulación, revisar en playtest). Sin Arrollar = exceso perdido.

**Contratiempo:** carta que en tu turno deshace efectos del turno enemigo anterior. Paga Energía. No restaura Núcleos. Excepción letal: salta en tiempo real pero cuesta tu acción y necesitas la Energía.

**Trama:** solo sube por 📜 y efectos de carta. No automática. Bidireccional. Daño inabsorbible.

**Aliados:** bloquean desde que entran. Habilidades en CD. Sin Arrollar = exceso a líder solo con keyword.

**Esbirros:** daño bajo, sin límite de presencia. **1 actúa por turno**, elegido al azar entre los válidos (no en CD, Núcleo disponible). **Presencia pasiva acumulable:** cada esbirro en mesa aporta un efecto definido por enemigo y/o escenario (se acumulan). Pesa por existir, no por dar acciones extra. **Keyword Defensor castiga por partida doble si se ignora** (confirmado en simulación): gestionar mesa es esperado, no opcional.

**Evolución en batalla:** checkpoints fijos (fase) + variables. Elige-1-de-3, sin gastar turno. Triggers: fase, texto enemigo/escenario, umbral Trama, objetivo, derrota secuaces. No elimina cartas.

**Level-Up del Líder:** 3 niveles (inicial + máx. 2). Definidos en editor. Se mantiene en campaña, resetea en campaña nueva.

**Deck-out:** rebaraja por defecto. Mill solo como condición de escenario.

**Sobres:**
- Personaje (TCG): 1 Líder + 5 cartas personaje + 9 comunes = 15 cartas. 5 sobres iniciales (aleatorios).
- Enemigo (LCG): 1 Enemigo + 8 cartas (4×2) + 2 únicas + 5 comunes Drama = 16 cartas.
- Escenario (LCG): 1 Escenario + 8 cartas (4×2) + 2 únicas + 5 comunes Drama = 16 cartas.

**Pool de comunes:** 30 Dramaturgia + 50 jugador al lanzamiento. Crece con nuevos sets/líderes. (Cerrado, no confundir con el ⬜ residual de versiones anteriores.)

**Prototipo de prueba:** El Forjador vs El Verdugo en El Bastión. Ver Simulación Prototipo v1.2.

**Devkit:** editor de contenido (Líderes/Enemigos/Escenarios/cartas) + validador por simulación masiva (N partidas, IA del Enemigo + IA del Líder con perfiles de bot, métricas agregadas). Es devkit interno en esta fase, no feature de jugador. Ver documento Devkit v1 completo.

---

### ANCLAJES NUMÉRICOS (🟡 BORRADOR)
- Vida del Líder: 28-38, neutro 32.
- Vida Verdugo: **80HP (40+40 en 2 fases)**, bajado de 90 en v6. Tope blando de cualquier enemigo: 100HP.
- Ritmo: ~8 turnos Fase 1 objetivo (primera simulación dio ~9-10 con gestión de mesa subóptima; pendiente de confirmar con Devkit).
- Daño básico: Ataque puro (CD1) = media **2.5** (Núcleo 1-4). Antes 3.5 (llevaba +1 incluido).
- Presupuesto de carta: **4 + Energía** (acción 2.5 + carta 1.5). Cancelación, daño fijo y permanentes se tasan aparte con prima de fiabilidad (ver Sistema y Balanceo §10.3).
- **Dificultad = TIEMPO, no turnos:** ~5/10/15/20 min (mega fácil/fácil/normal/difícil). Duración por densidad de decisión, nunca esponjas de vida.
- Trama: ~15 turnos hasta derrota sin gestión (ratio 40% 📜).
- Tope escudo Líder: 5.

---

### PENDIENTES (orden sugerido)
1. 🟡 Validar anclajes con el Devkit/simulación masiva (vida, daño, Trama, escudo, ritmo de Fase 1).
2. ⬜ Devkit: cerrar alcance inicial (todo el contenido desde el día 1, o por fases) y criterio de aprobación/rangos objetivo por dificultad.
3. ⬜ Regla de equilibrio entre los modificadores ±2 de las 2 básicas del Enemigo (libre por ahora).
4. ⬜ Escudo persistente Bastión: se satura rápido con ≥2 esbirros — confirmar si es aceptable o ajustar.
5. ⬜ El Yunque Viviente (Berserker): ventaja relativa mayor tras el cambio de benchmark — vigilar en playtest.
6. ⬜ Esbirros: límite técnico de implementación (no de diseño).
7. ⬜ Insignias/logros, tutorial, plataformas.
8. ⬜ Capa futura: cartas con saltos grandes al evolucionar.

---

*v6 generado el 20 de junio de 2026. Continúa desde aquí.*
