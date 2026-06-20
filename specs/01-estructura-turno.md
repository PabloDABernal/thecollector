# Spec 01 — Estructura de turno

> Especificación implementable. Fuente: GDD §2.1–2.6, Sistema y Balanceo §3–4.
> Pertenece al `engine` (código puro, sin UI).

## Resumen

El combate alterna turnos: jugador → enemigo → jugador… No hay "rondas". El
recurso escaso real es la **acción** (2 por turno). Regla rectora: **nunca debe
existir una "acción muerta"** — siempre hay algo válido que hacer.

## Turno del jugador

En orden:

1. **Efectos de inicio de turno.** Se aplican los umbrales de Trama activos
   (ver spec de Trama) y cualquier efecto "al inicio de tu turno".
2. **Bajan los cooldowns propios** en 1 (los que estén > 0).
3. **Elección de inicio (gratis, NO consume acción).** Exactamente una de:
   - **Generar Energía:** +1 Energía (máximo 5).
   - **Canalizar:** +1 carta a la mano (máximo 10).
   - Auto-reglas: con 10 cartas en mano, se fuerza Generar Energía; con 5 de
     Energía, se fuerza Canalizar.
4. **2 acciones.** Cada acción puede ser:
   - Activar una habilidad del Líder (si su CD = 0) → paga Energía si la pide
     + 1 Núcleo del color/valor requerido.
   - Activar una habilidad de un Aliado en mesa (si su CD = 0) → consume la
     acción + 1 Núcleo.
   - Bajar una carta de la mano → paga su coste en Energía.
   - **Canalizar** o **Generar Energía** como acción de emergencia (plan B).

## Combo

Si una acción tiene la keyword **Combo**, concede una **acción extra** este
turno (una 3.ª acción), pagando costes normales. No se puede repetir la misma
habilidad en la misma cadena. Como Canalizar/+Energía siempre están
disponibles, un Combo nunca se desperdicia.

## Energía

- Energía inicial: **2**. Máximo: **5**.
- Generar Energía es la única forma de subirla salvo cartas específicas.

## Turno del enemigo

En orden (detalle completo en el doc del prototipo y futura spec de enemigo):

1. **Roba la carta superior de Dramaturgia.**
2. **Resuelve el efecto de la carta** (invocar esbirro, daño, Trama extra…).
3. **Ejecuta una habilidad según el icono de la carta** (⚔️ ataque / 📜 Trama).
4. **Un esbirro actúa** (si hay esbirros válidos en mesa; máximo 1 por turno).

El enemigo **no usa Energía**, solo Núcleos. Arranca en calentamiento (ver spec
de cooldowns).

## Regla "nunca acción muerta"

El sistema garantiza siempre una jugada válida porque:
- El CD1 del Líder es **siempre ⚫** (cualquier Núcleo sirve).
- Canalizar y Generar Energía están **siempre disponibles** como acción.

## Criterios de aceptación (tests)

- [ ] Un turno de jugador permite exactamente 2 acciones (3 con Combo activo).
- [ ] La elección de inicio (Energía/Canalizar) no descuenta acciones.
- [ ] Con mano = 10, la elección de inicio se fuerza a Generar Energía.
- [ ] Con Energía = 5, la elección de inicio se fuerza a Canalizar.
- [ ] Energía nunca supera 5 ni baja de 0.
- [ ] Siempre existe al menos una acción válida disponible (nunca acción muerta).
- [ ] El turno del enemigo siempre roba 1 carta de Dramaturgia antes de actuar.
