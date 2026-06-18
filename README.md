# MonsterBloom 🌿

A browser-based monster plant collecting and battling game. Grow fearsome plant creatures from tiny seeds, upgrade their stats, and challenge other trainers to battle.

## What It Does

- **Hatch monsters** — Choose from 8 unique plant species, each with distinct stats and visual themes. Name your creature and watch it hatch with an animated sequence.
- **Grow & evolve** — Feed your monsters to earn XP. At 5 growth thresholds (Seed → Sprout → Sapling → Elder → Ancient) your monster evolves with a full-screen stage-up animation.
- **Upgrade stats** — Each evolution awards 3 stat points to distribute across Attack, Defense, Speed, and HP.
- **Battle rivals** — Challenge any other player's monster to turn-based combat. The battle log plays out in real time; the winner earns 100 XP.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [TanStack Start](https://tanstack.com/start) |
| Routing | TanStack Router v1 (file-based) |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Storage | Netlify Blobs (key-value, persistent) |
| Language | TypeScript 5.7 (strict) |
| Deployment | Netlify |

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server (requires Netlify CLI for Blobs support)
netlify dev
```

The app will be available at `http://localhost:8888`.

> **Note:** Netlify Blobs requires the Netlify dev environment for local storage to work. Run via `netlify dev`, not `npm run dev`, to get full functionality.

## Project Structure

```
src/
├── lib/
│   ├── types.ts          # Plant, BattleResult, StatKey types
│   └── plantData.ts      # Species definitions, XP thresholds, helpers
├── server/
│   └── plants.functions.ts  # Server functions (CRUD + battle logic)
└── routes/
    ├── __root.tsx         # App shell with navigation
    ├── index.tsx          # Landing page
    ├── garden.tsx         # Player's garden (client-rendered)
    ├── hatch.tsx          # Hatch a new monster
    ├── plant.$plantId.tsx # Monster detail, feeding, stat upgrades
    └── battle.tsx         # Battle arena
```

## Game Mechanics

- **XP thresholds:** 100 / 300 / 700 / 1500 XP for stages 1–4
- **Feeding:** +50 XP per feed
- **Battle win:** +100 XP to winner
- **Stat upgrades:** ATK/DEF/SPD +5, HP +20 per point
- **Battle simulation:** Turn-based, speed determines order, damage = `max(1, ATK − DEF×0.5) + random(0–3)`

## Player Identity

No sign-up required. Each browser generates a UUID on first visit stored in `localStorage`, acting as the player's persistent identity across sessions.
