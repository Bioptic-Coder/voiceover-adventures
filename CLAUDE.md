# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Type check + production build to dist/
npm run typecheck  # TypeScript type checking only
npm run preview    # Preview production build
npm run lint       # ESLint on src/
npm run test       # Run tests with vitest (watch mode)
```

To run a single test file: `npx vitest src/lib/keyboard.test.ts`

## Architecture

VoiceOver Adventures is a Preact + TypeScript game that simulates screen reader navigation (VoiceOver, NVDA, Orca). The game teaches keyboard shortcuts through progressive levels.

### Core Flow

1. **Keyboard events** → `lib/keyboard.ts` captures keydown events and delegates to the active screen reader adapter's `parseCommand()` to resolve the `SRCommand`
2. **Commands** → `lib/navigation.ts` executes navigation (moves virtual cursor, manages interaction state)
3. **Speech** → `lib/speech.ts` announces elements via Web Speech API
4. **State** → `hooks/useGame.ts` manages game state, checks win conditions, tracks moves
5. **Persistence** → `lib/storage.ts` saves progress to localStorage

### Screen Reader Adapter System

`src/lib/screenreaders/` contains a pluggable adapter pattern:

- **`types.ts`** — `ScreenReaderAdapter` interface and `SRCommand` union type (superset of all screen reader commands)
- **`index.ts`** — Registry: `setScreenReader(type)`, `getAdapter()`, `transformHint(hint)`, `getCommandKey(command)`
- **`voiceover.ts`**, **`nvda.ts`**, **`orca.ts`** — Concrete adapters implementing `ScreenReaderAdapter`

Each adapter defines its `commands` (modifier+key), `quickNavCommands`/`browseCommands` (single-key modes), `modalCommands` (rotor/elements list), and `commandInfo` (key display strings for UI).

`VOCommand` in `types.ts` is a backward-compatibility alias for `SRCommand`.

### Key Modules

**`src/lib/navigation.ts`** — Screen reader simulator with module-level state:
- `currentElement` — Element with virtual cursor
- `interactionStack` — Stack for nested group navigation (interact/stopInteract)
- `handleCommand(SRCommand)` — Main entry point; maps NVDA/Orca commands to VoiceOver equivalents internally (e.g., `openElementsList` → `openRotor`)

**`src/lib/keyboard.ts`** — Keyboard capture:
- Calls the active adapter's `parseCommand(event, state)` to convert events to `SRCommand`
- Manages modal state flags (`setQuickNav`, `setRotorOpen`) that affect which command set is active

**`src/hooks/useGame.ts`** — Central game hook:
- Initializes all lib modules on mount
- `handleCommand` validates commands against level's `commands[]` allowlist
- `checkWinCondition` evaluates `reach`/`activate`/`reachCell` conditions
- Manages modal states (help, settings, level complete)

### Level System

Levels defined in `src/data/levels.ts`:
- `commands: SRCommand[]` — Which commands this level teaches/allows
- `elements: GameElementDef[]` — Elements to render (can be nested for groups)
- `winCondition` — `reach` (navigate to), `activate` (click), or `reachCell` (table cell)
- `starThresholds.moves` — Move counts for 3/4/5 stars
- `hints: string[]` — Displayed as VoiceOver-style hints, transformed via `transformHint()` for the active screen reader

### Type Definitions

All types in `src/types.ts`. Key types:
- `SRCommand` / `VOCommand` (alias) — Union of all screen reader command names
- `ScreenReaderType` — `'voiceover' | 'nvda' | 'orca'`
- `LevelDef` — Complete level definition
- `GameElementDef` — Element with id, type, label, optional children
- `GameSettings` — Includes `screenReader: ScreenReaderType`

### Path Alias

`@/*` maps to `src/*` (configured in tsconfig.json and vite.config.ts)
