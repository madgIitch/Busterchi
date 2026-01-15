# Encuentros del paseo (roguelite de cartas)

En esta versión, los enemigos se plantean como **Encounter Decks**: mazos temáticos
con mecánicas propias. No hay violencia explícita, sino dinámicas de presión,
confusión, caos social y adaptación. El objetivo es gestionar estados, tomar
decisiones y elegir cómo avanza el paseo.

---

## Núcleo de diseño

- **Encounter Deck**: conjunto de cartas que definen reglas temporales,
  estados negativos/positivos y condiciones de salida.
- **Estados clave**: Estrés, Confusión, Calma, Ritmo.
- **Victoria**: no es “derrotar”, sino **resolver** la situación con la
  estrategia correcta.

---

## Tipos de encuentros

### 👮 Fuerzas de orden (Ertzaintza / Antidisturbios / Guardia Civil)

**Mecánica: Presión**

- Suben el **Estrés del Paseo**.
- Castigan acciones impulsivas.
- Se resuelven con calma, rutinas y repetición.

**Puzzle social:** no llamar la atención.

---

### 🍷 Grupo de Txikiteros

**Mecánica: Caos alegre**

- Turnos impredecibles.
- Pueden dar buffs… o liarla.
- Interacciones basadas en azar.

**Puzzle:** riesgo vs recompensa.

---

### 🗳️ Votante ideologizado (PNV / Abascal / etc.)

**Mecánica: Narrativa**

- Ataques de discurso.
- Generan **Confusión** (cartas bloqueadas).
- Se neutralizan con desapego, humor o indiferencia perruna.

**Puzzle:** gestión de estados mentales.

---

### 🎬 Personajes mediáticos / pop

(Karlos Arguiñano, Amaia, Ibai, etc.)

**Mecánica: Influencia**

- Cambian reglas temporales del combate.
- Introducen cartas especiales al mazo.
- Pueden convertirse en aliados pasivos.

**Puzzle:** adaptación del mazo.

---

### 🧍 Guardia Civil en T-Pose

**Mecánica: Glitch del sistema**

- No hace nada… pero bloquea caminos.
- Requiere carta específica: **Aceptar el absurdo**.

**Puzzle:** meta-humor.

---

## Boss final (replanteado)

### 🏛️ “La Idea Fundacional” (Sabino Arana)

No es una persona, sino un concepto estructural.

**Reglas del boss:**

- No pierde vida.
- Cambia reglas del paseo.
- Introduce cartas “heredadas”.
- Te obliga a elegir: **asimilar / ignorar / resignificar**.

**Finales posibles:**

- Paseo corto y tranquilo.
- Paseo largo y caótico.
- Paseo eterno (endless mode).

---

## Notas de implementación (futuro)

- Cada Encounter Deck debería exponer:
  - estados que aplica
  - cartas clave
  - condición de salida
- Los eventos deberían evitar violencia explícita y
  enfocarse en “gestión emocional / social”.

---

## Loop principal

- Cada “paseo” es una run corta (10–15 encuentros).
- Baraja base + cartas que consigues en el camino.
- Derrotas al boss final (Sabino Arana) para completar el paseo.

---

## Estructura de combate

- Turnos simples: juegas 3 cartas por turno.
- Recursos: Energía (se regenera cada turno).
- Estado del perro: Salud, Ánimo, Resistencia (afecta coste/daño).

---

## Tipos de cartas

- Acción: ladrar, esquivar, sprint, “mirada tierna”.
- Defensa: esconderse, calma, escudo emocional.
- Truco: distracción, “cambio de ritmo”, “zig‑zag”.
- Apoyo: snack rápido, mimos recordados (curas).

---

## Mecánicas roguelite

- Relics: objetos pasivos (ej. “bandana +1 energía”).
- Cartas raras: se consiguen en eventos.
- Eventos: decisiones (perder energía a cambio de carta épica).

---

## Progresión

- Tras cada run: ganas Bucksters + desbloqueas cartas.
- Las cartas desbloqueadas entran al pool para runs futuras.

---

# Sistema elemental (núcleo formal)

Este bloque define el sistema **cerrado y programable** para la jugabilidad
de cartas del paseo.

---

# 1. Elementos base (núcleo del sistema)

Necesitas **pocos elementos**, muy legibles, instintivos y no “mágicos”.

Propuesta inicial: **5 elementos**
(5 funciona mejor que 3 para variedad sin romper balance)

## 🐾 Elementos de Buster

| Elemento       | Fantasía       | Describe                       |
| -------------- | -------------- | ------------------------------ |
| **IMPULSO**    | Acción directa | Sprint, tirón, avance          |
| **CALMA**      | Autocontrol    | Esperar, rutina, bajar tensión |
| **CAOS**       | Ruido          | ladrar, zig-zag, interrupción  |
| **VÍNCULO**    | Apego          | snack, humano, mimos           |
| **TERRITORIO** | Dominancia     | marcar, plantarse, presencia   |

Cada carta **tiene exactamente 1 elemento**.

---

# 2. Relación Piedra-Papel-Tijera (circular)

Cada elemento:

- es **fuerte** contra uno
- es **débil** contra otro
- neutro contra los demás

### Rueda elemental

```
IMPULSO → CAOS → CALMA → TERRITORIO → VÍNCULO → IMPULSO
```

| Ataca      | Es fuerte contra | Es débil contra |
| ---------- | ---------------- | --------------- |
| IMPULSO    | CAOS             | VÍNCULO         |
| CAOS       | CALMA            | IMPULSO         |
| CALMA      | TERRITORIO       | CAOS            |
| TERRITORIO | VÍNCULO          | CALMA           |
| VÍNCULO    | IMPULSO          | TERRITORIO      |

Esto es **clave**: no hay bien/mal, solo **contexto**.

---

# 3. Identidad elemental de Buster (muy importante)

Cuando eliges tu mazo (12 cartas):

```text
IMPULSO: 4 cartas → 33%
CALMA: 3 cartas → 25%
CAOS: 2 cartas → 17%
VÍNCULO: 2 cartas → 17%
TERRITORIO: 1 carta → 8%
```

👉 Esto define **qué tipo de perro eres** en esa run.

No es cosmético. Afecta **todo el combate**.

---

# 4. Enemigos: elementos fijos

Cada enemigo tiene **1 o 2 elementos**.
Sus movimientos **solo** usan esos elementos.

Ejemplos:

- 👮 Fuerzas de orden → **CALMA + TERRITORIO**
- 🍷 Txikiteros → **CAOS**
- 🗳️ Ideologizado → **CAOS + TERRITORIO**
- 🎬 Mediático → **VÍNCULO + CAOS**
- 🧍 T-Pose → **TERRITORIO puro**

---

# 5. Cálculo de daño a Buster (núcleo matemático)

Esto es lo importante.

## Paso 1: el enemigo usa un movimiento elemental

Ejemplo:

> Movimiento enemigo: **CAOS**  
> Daño base: **10**

## Paso 2: calcular afinidad de Buster frente a ese elemento

### Definiciones

- **Elementos fuertes contra CAOS** → IMPULSO
- **Elementos débiles contra CAOS** → CALMA

### Fórmula de afinidad

```text
Afinidad = (% fuerte) − (% débil)
```

Ejemplo de Buster:

```text
IMPULSO = 33%
CALMA = 25%

Afinidad = 33 − 25 = +8%
```

## Paso 3: aplicar modificador de daño

Define un **factor de impacto** (recomendado: 1.5)

```text
Daño final = Daño base × (1 − Afinidad × Factor)
```

Ejemplo:

```text
Daño = 10 × (1 − 0.08 × 1.5)
Daño = 10 × 0.88 = 8.8 ≈ 9
```

👉 Buster **resiste mejor** ataques de CAOS porque es impulsivo.

---

## Caso contrario (Buster mal alineado)

Si Buster tuviera:

```text
IMPULSO = 10%
CALMA = 40%

Afinidad = 10 − 40 = −30%
```

```text
Daño = 10 × (1 − (−0.30 × 1.5))
Daño = 10 × 1.45 = 14.5
```

👉 El perro **lo pasa fatal**.

---

# 6. Enemigos con 2 elementos

Se calcula **por separado** y se promedia.

Ejemplo:

- Ataque **CALMA + TERRITORIO**
- Daño base: 12

```text
Daño final = (Daño vs CALMA + Daño vs TERRITORIO) / 2
```

Esto hace que:

- Los enemigos híbridos sean **más estables**
- Los extremos sean **más peligrosos**

---

# 7. Implicaciones de diseño (muy potentes)

- El jugador **elige su vulnerabilidad**
- No hay “build perfecta”
- Cambiar 1 carta **sí importa**
- Los enemigos son legibles antes de entrar
- El azar del mazo ≠ azar del resultado

---

# 8. UI mínima necesaria

- Al seleccionar mazo:
  - Gráfico circular con % elemental de Buster
- En combate:
  - Icono del elemento del ataque enemigo
  - Tooltip: “Buster es fuerte/débil contra esto”

Sin explicar fórmulas. **Se siente**.

---

# 9. Siguiente pasos naturales

1) Asignar **elemento a cada carta del mazo inicial**
2) Diseñar **relics que modifiquen % elemental**
3) Diseñar **enemigos concretos con sets de ataques**
4) Afinar números (factor, caps, límites)

---

# Ajustes de balance (propuesta)

## Cartas del jugador

### Protesta Pacifica
- Problema: efecto debil vs coste.
- Propuesta: buff del efecto o bajar coste.
- Impacto esperado: mas margen contra orden_publico e ideologizado.

### Voz Ciudadana
- Problema: deja al jugador corto de recursos vs ideologizado y mediatico.
- Propuesta: buff de eficacia o bajar rareza.
- Impacto esperado: mejor ventana de victoria vs mediatico.

### Ciberactivismo
- Problema: demasiado fuerte contra tpose y txikiteros.
- Propuesta: nerf leve (subir coste o bajar dano).
- Impacto esperado: evitar trivializar encuentros medios.

### Otras cartas del jugador
- Revisar cartas dominantes (70-80% de presencia en mazos ganadores).
- Nerfearlas con coste o poder si rompen meta.
- Buffear cartas casi nunca usadas.
- Objetivo: estrategias variadas y viables.

## Cartas de enemigos

### Antidisturbios (orden_publico)
- Problema: carta clave con dano alto o elimina cartas.
- Propuesta: nerf (menos dano o requisito previo).

### Control Informativo (mediatico)
- Problema: desorganiza en exceso; victoria del jugador muy alta.
- Propuesta: ajuste leve (condicion especial o coste mas alto).

### Propaganda Radical (ideologizado)
- Problema: victoria del jugador muy baja.
- Propuesta: buff (mas descarte o menos requisitos).
- Objetivo: subir dificultad a rango objetivo.

### Revolucion Festiva (txikiteros)
- Problema: encuentro demasiado facil.
- Propuesta: nerf leve (coste mayor o contraataque ligero).
- Objetivo: 55-65% de victoria del jugador.

### Apoyo Infantil (tpose)
- Problema: tpose demasiado debil.
- Propuesta: buff fuerte (mas dano o efecto extra al morir).
- Objetivo: que deje de ser trivial.

### Idea Fundacional (jefe)
- Mantener alta dificultad (win rate < 10%).
- Asegurar cartas clave muy potentes.
- Posible umbral final que debilite acciones del jugador.

## Afinidades elementales

- Revisar ciclo elemental para evitar dominancia.
- Ajustar elementos de enemigos segun dificultad.
- Ideologizado y orden_publico pueden compartir o contradecir afinidades.
- Tpose podria cambiar de elemento para no ser trivial.

## Objetivo global de balance

- Orden_publico, ideologizado, mediatico, txikiteros y tpose: 45-65% win.
- Idea_fundacional: < 10% win.
- Igualar coste y beneficio de cada carta.
