# Development notes

## Architecture

- `src/App.tsx`: React screens, menus, HUD, phone, save model, UI events.
- `src/game/World.ts`: Phaser scene, generated neighbourhood, movement, collision, NPC proximity and vehicle controls.
- `src/story.ts`: deterministic seed-based procedural story and mission templates.
- `src/types.ts`: identity, mission and save contracts.
- `src/style.css`: game UI styles and responsive breakpoints.

React owns the interface and persistent game state; Phaser owns the real-time scene. Phaser emits small semantic events (`npc`, `drive`, `shop`, `pause`, `hint`) to the React host.

## Development

`npm install`, then `npm run dev`. `npm run build` runs TypeScript project checking and Vite production bundling. Save key is `vibe-save-v1` in browser localStorage.

## Verification boundary

Build/type check is the only automated check performed here; no browser automation was available/performed. The prototype should be exercised in-browser before treating controls and edge cases as production-ready. Geographic coordinates are approximate reference coordinates, not connected to a map tile provider.
