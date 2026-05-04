# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build (also runs type checking)
npm run lint         # ESLint
npm run simulate:combat          # Run combat balance simulation (200 runs by default)
npm run simulate:combat -- --enemy orden_publico --runs 500 --seed abc
npm run analyze:reports          # Analyze saved simulation reports in /reports/
```

No test suite. TypeScript (`npx tsc --noEmit`) is the main correctness check.

## Architecture

**Bustergochi** is a single-screen PWA tamagotchi about a greyhound named Buster, with a card-based walk mini-game. All UI lives in `app/page.tsx`; there is no routing.

### State (Zustand)

Two stores, both auto-persist on every state change via `store.subscribe()`:

- **`store/usePetStore.ts`** — pet stats (food, walk, love, energy), action cooldowns, sleep state, bucksters currency, XP/level. Persistence key `busterchi.pet.v1` (IDB primary, localStorage fallback). Bump `STORAGE_VERSION` and add a migration path in `readStorage()` whenever the shape changes.
- **`store/useShopStore.ts`** — owned items, active decorations, card deck for combat. Key `bustergochi.shop.v1`, currently at schema v3 with migrations from v1/v2 in `lib/shopStorage.ts`.

### Persistence pattern

Both stores use a hybrid IDB + localStorage write-through (`lib/idb.ts` wraps IndexedDB). `readStorage` / `readShopStorage` check IDB first, fall back to localStorage, and promote localStorage data to IDB on the way out. Schema migrations live inside the read function; always write the migrated payload back before returning.

### Combat system

`combat.ts` (root) is a pure state-machine with no React deps — safe to import in Node scripts.

```
createCombatState(playerDeck, enemyDeck) → CombatState
playCard(state, cardId)   // mutates state in place
endTurn(state)            // runs enemy actions then starts player step
```

`CombatState.outcome` (`"ongoing" | "win" | "lose"`) is set by `checkOutcome()` after every effect application. Stress ≥ 100 drains 25 mood and resets stress. `endTurn` and `playCard` no-op if outcome ≠ `"ongoing"`.

Enemy AI patterns are in `selectEnemyCard()`: `rotation` (fixed order), `weighted` (basic 60 / reactive 20 / strong 15 / identity 5), `reactive` (prioritises reactive cards when player used impulso).

### Encounter data (`lib/encounters/`)

| File | Contents |
|---|---|
| `types.ts` | All shared types: `CardDefinition`, `EnemyDeck`, `EnemyVariant`, `EnemyDialogue`, `CardEffect` |
| `cards.ts` | `CARD_CATALOG` — 37+ player cards across 5 elements |
| `enemies.ts` | `ENEMY_DECKS` — 6 archetypes, each with `variants[]` (PNG + 3-line dialogue per character) |
| `elements.ts` | `ELEMENTS` — 5-element cycle with `strongAgainst`/`weakAgainst` |
| `config.ts` | `ENABLE_WALK_GAME` feature flag |

Enemy images live in `public/enemies/`. Enemy archetypes: `orden_publico`, `txikiteros`, `ideologizado`, `mediatico`, `tpose`, `idea_fundacional` (boss, always round 10).

### Walk game flow (10-round roguelite)

`WalkGameModal.tsx` owns a `phase` state machine: `pre → battle → between → run_over | lose`. Rounds 1–9 are random enemies (excluding boss deck); round 10 is always `idea_fundacional` / Sabino Arana. Between-rounds screen shows the defeated enemy's `dialogue.defeat` line and a preview of the next enemy. Lose screen shows the winner's `dialogue.victory` line.

### Decoration system

`lib/decorations/layout.ts` defines per-category pixel slots (`DECORATION_SLOTS`) and furniture-type sub-slots (`FURNITURE_TYPE_SLOTS`). `PetScene.tsx` uses a `ResizeObserver` to scale slot percentages to actual rendered pixels. Category exclusivity rules (one rug, one flag, etc.) are enforced in `useShopStore.toggleDecoration()`.

### Combat balance tooling

`.sim/` contains compiled JS mirrors of `combat.ts` and `lib/encounters/`. Run `npm run simulate:combat` to regenerate; reports save to `/reports/` as JSON + Markdown. The simulator uses a greedy card-scoring heuristic, not random play.

### Styling

Tailwind CSS v4. Theme tokens (`--color-background`, `--color-surface`, `--color-primary`, `--color-text`, `--color-muted`, `--color-accent`) are defined in `app/globals.css`. Day/night backgrounds and sleep dark-mode are toggled via CSS classes on the root.
