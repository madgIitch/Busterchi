# Bustergochi (Busterchi)

Tamagotchi kawaii de un galgo llamado Buster, pensado como PWA instalable. La app vive en una sola pantalla con escena principal, stats y acciones para cuidar al pet.

## Caracteristicas

- Stats principales: Food, Walk, Love y Energy.
- Acciones: Snack, Walk, Pet y Sleep con cooldowns.
- Estado persistente con almacenamiento local (IndexedDB + respaldo en localStorage).
- Decay de stats basado en el tiempo transcurrido.
- Modales de inventario y tienda, y paseo con modal dedicado.

## Stack

- Next.js (App Router) + TypeScript
- React 19
- Zustand
- Tailwind CSS

## Requisitos

- Node.js 18+ (recomendado)

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run simulate:combat
npm run analyze:reports
```

## Estructura (alta nivel)

```
app/            UI principal y layout
components/     Componentes reutilizables (scene, stats, modals)
lib/            Logica de decay y storage
store/          Zustand stores (pet, shop)
public/         Assets e iconos
.sim/           Scripts de simulacion y reportes
```

## Notas

- El estado del pet se guarda en `localStorage` e IndexedDB con clave `busterchi.pet.v1`.
- El proyecto apunta a una experiencia offline-first y pensada para PWA.
