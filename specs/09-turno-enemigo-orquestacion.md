# Spec 09 — Turno del enemigo (2): orquestación

> Especificación implementable. Fuente: Sistema y Balanceo §6.1/§6.5/§12,
> Simulación §1/§4. Pertenece al `engine`. Usa la cabeza (spec 08), el mazo
> (07), la activación (04), los efectos (03/06) y los esbirros (05).

## Resumen

El "cuerpo": ejecuta un turno completo del enemigo de principio a fin,
enganchando las decisiones de la spec 08. El **orden de operaciones importa**.

## Orden de operaciones de un turno del enemigo

1. **Inicio:**
   - Bajar en 1 los cooldowns del enemigo (si > 0). [simétrico al jugador]
   - Apagar `recienInvocado` en los esbirros que lo tengan (los invocados en
     turnos anteriores pasan a poder actuar).
   - *(Pasiva del Bastión: +1 escudo del Verdugo por esbirro — PENDIENTE, va con
     el escenario; no implementar ahora.)*
2. **Robar carta** de Dramaturgia (rebaraja si el mazo está vacío).
3. **Resolver el efecto propio de la carta** (ejecutor, fuente = enemigo). Puede
   invocar un esbirro nuevo, que entra con `recienInvocado = true` y por tanto NO
   actúa este turno.
4. **Ejecutar habilidad según el icono:**
   - `elegirHabilidad(icono, cooldownsEnemigo, pool, faseActiva(hp).habilidades)`.
   - `elegirNucleo(coste, pool, coloresJugador)` → color; resuélvelo al Núcleo
     concreto de ese color en el pool.
   - `activarHabilidad(state, habilidad, nucleoElegido, 'enemigo')`.
   - **buffAtaqueTemporal:** si la habilidad hace daño de Ataque, súmale
     `state.buffAtaqueTemporal`. (Se limpia al inicio del turno del jugador, ya
     implementado.)
   - **Pasiva del Verdugo (presencia de esbirros):** si la habilidad es Proclama
     (Trama), su valor sube en +1 por cada esbirro en mesa. Regla del Verdugo,
     claramente marcada (generalizar las presencias pasivas es tarea futura).
5. **Actúa un esbirro:**
   - Candidatos: esbirros en mesa que pueden actuar (NO `recienInvocado`; con el
     filtro de validez — en el prototipo todos tienen ataque plano, así que todos
     los no-recién-invocados valen).
   - Elegir 1 al azar (RNG con semilla).
   - Ataca al Líder por su `ataque` (1, plano), vía `aplicarDañoALider`.
   - Si no hay candidatos, no actúa nadie.
6. **Fin:** pasa el turno al jugador.

## Pendiente (no implementar ahora)

- Pasiva del Bastión (+1 escudo/esbirro) → con el escenario.
- Keyword Defensor (objetivo prioritario) → con el targeting del jugador / IA del
  Líder.
- Redirección del daño de esbirro a un Aliado → con la IA del Líder.

## Criterios de aceptación (tests)

- [ ] Turno con carta ⚔️ y un Núcleo de valor 4: roba, resuelve el efecto de la
      carta, ejecuta Ejecución (si está lista) o Tajo, y un esbirro elegible
      ataca al Líder.
- [ ] Carta 📜 con Proclama desbloqueada y 2 esbirros en mesa: la Trama sube en
      3 + 2 = 5 (pasiva del Verdugo).
- [ ] buffAtaqueTemporal: con el buff +1 puesto, el Ataque del enemigo este turno
      hace +1.
- [ ] Un esbirro recién invocado este turno NO actúa este turno.
- [ ] Un esbirro invocado el turno anterior SÍ puede actuar (recienInvocado
      apagado al inicio del turno).
- [ ] Los cooldowns del enemigo bajan 1 al inicio de su turno.
- [ ] Tras el turno, el control pasa al jugador.
