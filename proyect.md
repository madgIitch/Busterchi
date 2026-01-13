Aquí tienes un resumen operativo de **Busterchi** para arrancarlo con Codex (o cualquier agente de código) sin ambigüedad. Está escrito como “brief + spec” para que el modelo pueda generar estructura, componentes y lógica desde el minuto 1.

---

## Proyecto: Busterchi (PWA)

**Idea:** Tamagotchi kawaii de un galgo (Buster) para iOS vía PWA instalable (“Add to Home Screen”).
**Objetivo:** Una experiencia cute, ligera y emocional; sin tareas tóxicas. Todo offline-first.

---

## Stack recomendado

* **Next.js (App Router) + TypeScript**
* **TailwindCSS**
* **Framer Motion** (micro-animaciones UI)
* **Zustand** (estado global del pet)
* **Persistencia:** `localStorage` (MVP) → opcional `IndexedDB` si crece
* **PWA:** manifest + service worker (Workbox/next-pwa o SW simple)

---

## UX / Pantalla principal (MVP)

Una sola pantalla Home con:

1. Header: `Busterchi` + icono pequeño del galgo + botón settings (placeholder)
2. Card central: escena con el galgo pixel (idle animation)
3. Stats bars:

   * **Food**
   * **Walk**
   * **Love**
   * (Opcional) **Energy**
4. Acciones principales (3 botones kawaii):

   * **Snack**
   * **Walk**
   * **Pet**
5. “Speech bubble” inferior con mensajes random (“Zoomies activated!”, etc.)

**Look & feel:** pastel kawaii, bordes redondeados, sombras suaves, iconitos (hueso, patita, corazón).

---

## Mecánica del Tamagotchi (simple)

### Stats (0–100)

* `food`
* `walk`
* `love`
* `energy` (opcional pero recomendable)

### Mood (derivado)

`mood: "happy" | "chill" | "sleepy" | "sad" | "excited"`

Reglas simples:

* Si `food < 25` o `love < 25` → `sad`
* Si `energy < 25` → `sleepy`
* Si `walk > 70 && love > 50` → `excited`
* Si todo > 50 → `happy`
* Else → `chill`

### Acciones

* Snack: `food +15`, `energy +5` (cap 100)
* Walk: `walk +20`, `energy -10`
* Pet: `love +18`, `energy -2`
* Sleep (si lo incluyes): `energy +35`, reduce decay temporal (opcional)

Cooldowns (para que no sea spam):

* Snack: 2 min
* Walk: 5 min
* Pet: 1 min

---

## “Decay” (degradación realista, sin timers agresivos)

**Sin intervalos activos**: recalcular al abrir la app o al volver al foco.
Guardar `lastUpdated` (timestamp).

Al rehidratar:

* `food -= deltaMinutes * 0.03`
* `walk -= deltaMinutes * 0.02`
* `love -= deltaMinutes * 0.025`
* `energy -= deltaMinutes * 0.015`

Clamp a 0–100.
Luego recalcular `mood`.

---

## Persistencia (offline-first)

Guardar en `localStorage`:

* `petState` (stats, mood, cooldowns, streak)
* `lastUpdated`
* `lastCheckInDate` (para racha diaria)

---

## Micro-interacciones kawaii

* Botones con bounce al tap (Framer Motion)
* Pequeño sparkle al subir stats
* Speech bubble cambia tras cada acción
* Idle animation del galgo:

  * blink cada X segundos
  * tail wag en “happy/excited”
  * zzz en “sleepy”

Assets:

* `buster_idle.png` o spritesheet (Aseprite)
* Por MVP: usar una imagen estática y animar con CSS/Framer Motion; luego migrar a spritesheet.

---

## PWA checklist (imprescindible)

* `public/manifest.json` con:

  * name/short_name: **Busterchi**
  * display: standalone
  * theme_color / background_color pastel
  * icons 192 y 512
* Meta tags iOS en layout:

  * `apple-mobile-web-app-capable`
  * `apple-mobile-web-app-status-bar-style`
* Página `/install` opcional con instrucciones “Share → Add to Home Screen”

---

## Estructura de carpetas sugerida

```
app/
  layout.tsx
  page.tsx
  globals.css
components/
  PetScene.tsx
  StatsBars.tsx
  ActionButtons.tsx
  SpeechBubble.tsx
store/
  usePetStore.ts
lib/
  decay.ts
  storage.ts
  mood.ts
public/
  icons/
  pet/
  manifest.json
```

---

## Definition of Done (MVP 1)

* Home renderiza Buster + stats + botones
* Acciones modifican stats + muestran feedback visual
* Estado persiste tras cerrar/abrir
* Decay funciona (abre tras horas y stats bajaron)
* PWA instalable en iOS (Add to Home Screen) con icono y standalone

---

## Prompt listo para Codex (cópialo tal cual)

```text
Build a Next.js (App Router) + TypeScript PWA called “Busterchi”, a kawaii pixel-art greyhound tamagotchi. Create the full project structure with TailwindCSS, Framer Motion for micro-animations, and Zustand for state.

Requirements:
- Single main screen (Home): header with title “Busterchi” + small icon, central pet scene card, 3 stats bars (Food/Walk/Love) plus optional Energy bar, three main action buttons (Snack/Walk/Pet), and a speech bubble with random cute messages.
- Pet state: food, walk, love, energy (0-100), mood derived from stats, cooldown timestamps, lastUpdated timestamp, daily streak fields.
- No running intervals; implement “decay on resume”: when app loads or becomes visible, compute deltaMinutes from lastUpdated and decrease stats with given rates; clamp 0-100; recompute mood.
- Actions: Snack +15 food +5 energy; Walk +20 walk -10 energy; Pet +18 love -2 energy; add cooldowns (Snack 2m, Walk 5m, Pet 1m) and disable buttons with remaining time.
- Persistence: save/rehydrate from localStorage; version key for future migrations.
- Kawaii UI: pastel palette, rounded cards, soft shadows; use Framer Motion for button tap bounce and subtle stat “sparkle” feedback.
- Add PWA manifest and iOS meta tags. Provide icons placeholders and instructions to add to home screen.
Deliver the full code with comments and ensure it runs with `npm run dev`.
```

---

Si quieres, en el siguiente mensaje te preparo también:

* una paleta exacta en Tailwind (tokens),
* el `manifest.json` final con theme colors,
* y un set de “speech bubble lines” ya curadas para Busterchi.
