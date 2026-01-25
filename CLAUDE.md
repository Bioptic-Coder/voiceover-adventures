# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Type check + production build to dist/
npm run typecheck  # TypeScript type checking only
npm run preview    # Preview production build
```

## Architecture

VoiceOver Adventures is a Preact + TypeScript game that simulates macOS VoiceOver screen reader navigation. The game teaches VoiceOver keyboard shortcuts through progressive levels.

### Core Flow

1. **Keyboard events** → `lib/keyboard.ts` detects VoiceOver modifier combos (Ctrl+Option+key)
2. **Commands** → `lib/voiceover.ts` executes navigation (moves virtual cursor, manages interaction state)
3. **Speech** → `lib/speech.ts` announces elements via Web Speech API
4. **State** → `hooks/useGame.ts` manages game state, checks win conditions, tracks moves
5. **Persistence** → `lib/storage.ts` saves progress to localStorage

### Key Modules

**`src/lib/voiceover.ts`** - VoiceOver simulator with module-level state:
- `currentElement` - Element with virtual cursor
- `interactionStack` - Stack for nested group navigation (interact/stopInteract)
- `handleCommand(VOCommand)` - Main entry point for executing commands

**`src/lib/keyboard.ts`** - Keyboard capture:
- Detects VO modifier (Ctrl+Option) combinations
- Handles Quick Nav mode (single-key navigation when enabled)
- Handles Rotor mode (arrow keys navigate rotor items)

**`src/hooks/useGame.ts`** - Central game hook:
- Initializes all lib modules on mount
- `handleCommand` validates commands against level's allowed commands
- `checkWinCondition` evaluates reach/activate/reachCell conditions
- Manages modal states (help, settings, level complete)

### Level System

Levels defined in `src/data/levels.ts` with structure:
- `commands: VOCommand[]` - Which commands this level teaches/allows
- `elements: GameElementDef[]` - Elements to render (can be nested for groups)
- `winCondition` - `reach` (navigate to), `activate` (click), or `reachCell` (table cell)
- `starThresholds.moves` - Move counts for 3/4/5 stars

### Type Definitions

All types in `src/types.ts`. Key types:
- `VOCommand` - Union of all VoiceOver command names
- `LevelDef` - Complete level definition
- `GameElementDef` - Element with id, type, label, optional children

### Path Alias

`@/*` maps to `src/*` (configured in tsconfig.json and vite.config.ts)
