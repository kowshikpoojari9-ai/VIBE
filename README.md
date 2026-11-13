# V.I.B.E. — Virtual India: Beyond Everything

A lightweight playable browser prototype about identity, place, and player-led stories. Story generation works procedurally and offline; the game does not claim LLM-generated text.

## Run

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the URL printed by Vite. To create a production build, run `npm run build`; `npm run preview` serves that build. A GitHub Actions workflow is included at `.github/workflows/deploy.yml`; push this repository to a GitHub repo's `main` branch, then enable **Settings → Pages → Build and deployment → GitHub Actions**. The action builds and deploys the game to GitHub Pages.

## Implemented

- Cinematic game menu, create-character flow, review/regenerate story intro, and start life.
- Editable identity, appearance choices and starting city selection (15 Indian cities).
- Five procedural story seeds; identity is preserved during regeneration.
- Phaser 3 top-down neighbourhood, camera follow, movement, sprint, buildings and boundary collision.
- Five named NPCs with scripted dialogue; proximity interaction; a parked scooter with a basic arcade-driving control.
- Mission phone with accept/complete actions and cash rewards; market purchase; profile, messages, contacts, inventory.
- HUD, pause menu, city location selector, and localStorage save/continue.
- Original code-drawn visual assets; no paid APIs or exposed credentials.

## Controls

WASD / arrows move · Shift sprint · E interact / enter or exit nearby scooter · F toggle vehicle · Esc pause · Phone and map buttons in HUD.

## Tested

The production TypeScript/Vite build was run successfully. Functional feature verification is limited to code/build validation in this environment; no browser automation or live in-browser interaction testing was performed. Please verify keyboard/gameplay behavior in the running browser.

## Incomplete / known prototype limits

- The city map is a coordinate-based selector, not a tile map. No OpenStreetMap tiles are loaded; playable neighbourhood and geographic exploration are separate.
- Save is a single localStorage slot; New Game currently replaces it. No multiple save slots or cloud persistence.
- Story text uses five procedural seeds, no configured LLM provider. Narrative flags and consequences are very lightweight; world event pacing, wanted/police system, hunger/energy simulation and advanced branches are not implemented.
- Missions can be accepted/completed through the phone; world-objective validation is simplified and not all objectives are linked to in-world triggers.
- Phaser collision covers the building blocks; NPCs, vehicle handling, obstacle collision, animation and traffic are simplified.
- Purchases and mission rewards update saved money/inventory; there is no full job/business loop.

## Next recommended milestone

Add a proper objective/event bridge from Phaser to the persisted game model, validate missions against actual world actions, and browser-test movement/collision/vehicle and persistence. Then introduce a configurable compliant OSM tile layer and optional server-side AI provider adapter.
