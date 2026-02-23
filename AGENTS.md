# AGENTS.md

Guidance for AI coding agents working in this repository. See also `CLAUDE.md` for architecture details.

## Project Overview

Preact + TypeScript PWA that teaches macOS VoiceOver shortcuts through interactive game levels.
Simulates VoiceOver navigation without requiring users to enable their actual screen reader.

**Stack:** Preact 10, TypeScript (strict), Vite 5, CSS files, localStorage persistence.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Dev server at http://localhost:3000
npm run build            # TypeScript check + Vite production build to dist/
npm run typecheck        # TypeScript type checking only (tsc --noEmit)
npm run preview          # Serve production build locally
```

**After making any code change, run `npm run typecheck` to verify.**

The `npm run lint` script exists in package.json but ESLint is not installed — do not run it.

### Testing

No test framework is configured. No test files exist. If adding tests, use Vitest:

```bash
npx vitest run                          # Run all tests
npx vitest run src/lib/storage.test.ts  # Run a single test file
npx vitest --watch                      # Watch mode
```

## Path Alias

`@/*` maps to `src/*` — configured in both `tsconfig.json` and `vite.config.ts`.

## Code Style

### Formatting

- **Indentation:** 2 spaces (not tabs)
- **Semicolons:** required
- **Quotes:** single quotes for strings
- **JSX attribute:** use `class` not `className` (this is Preact, not React)
- **Trailing commas:** yes, in multi-line objects/arrays/params

### Imports

Follow this order, separated by blank lines:

```typescript
// 1. Preact imports
import { useState, useEffect, useCallback } from 'preact/hooks';

// 2. Type-only imports from local code (use the `type` keyword)
import type { VOCommand, LevelDef, GameElementDef } from '@/types';

// 3. Local module imports using @/ alias
import * as storage from '@/lib/storage';
import * as speech from '@/lib/speech';
import { getLevel } from '@/data/levels';
import { Header, GameArea } from '@/components';

// 4. Relative imports (within the same directory)
import { voiceoverAdapter } from './voiceover';
```

Key rules:
- Always use `import type` for type-only imports
- Use `@/` path alias for cross-directory imports, relative paths within same directory
- Use namespace imports (`* as`) for lib utility modules (storage, speech, keyboard, navigation)
- Import components from the barrel `@/components` (re-exports from `src/components/index.ts`)

### Components

Exported named functions (no default exports). Props interface defined directly above the component.
No `import { h } from 'preact'` — JSX transform is automatic via `@preact/preset-vite`.

```tsx
interface ObjectivePanelProps {
  objective: string;
  moveCount: number;
}

export function ObjectivePanel({ objective, moveCount }: ObjectivePanelProps) {
  return (
    <div class="objective-panel">
      <p>{objective}</p>
      <span>Moves: {moveCount}</span>
    </div>
  );
}
```

### Types

All shared types in `src/types.ts`. Screen-reader types in `src/lib/screenreaders/types.ts`.

- Use `interface` for object shapes (`interface GameState { ... }`)
- Use `type` for unions and aliases (`type ElementType = 'button' | 'link' | ...`)
- Never use `any` — use `unknown` and narrow with type guards
- No `@ts-ignore` or `@ts-expect-error` without a comment explaining why

### Naming

| Thing | Convention | Example |
|-------|-----------|---------|
| Components | PascalCase function + file | `LevelCompleteModal.tsx` |
| Hooks | camelCase with `use` prefix | `useGame.ts` |
| Lib modules | camelCase file, named exports | `storage.ts`, `speech.ts` |
| Types/Interfaces | PascalCase | `GameElementDef`, `LevelDef` |
| Union types | PascalCase | `VOCommand`, `ElementType` |
| Constants | UPPER_SNAKE_CASE | `TOTAL_LEVELS`, `STORAGE_KEY` |
| Functions | camelCase | `handleCommand`, `getNavigableElements` |
| CSS classes | kebab-case | `game-area`, `header-btn` |

### Error Handling

- Wrap localStorage and Web Speech API calls in try/catch — these can fail
- Use `console.error` for real errors, `console.warn` for degraded functionality
- Degrade gracefully: if speech synthesis fails, the game still works visually
- Return fallback values rather than throwing in utility functions

### Module Pattern

Lib modules (`src/lib/`) use module-level mutable state with exported functions:

```typescript
let currentElement: HTMLElement | null = null;  // module state

export function init(callbacks: VOCallbacks = {}): void { ... }
export function reset(): void { ... }
export function handleCommand(cmd: VOCommand): boolean { ... }
```

This is the established pattern — do not refactor to classes.

## Architecture

```
src/
├── App.tsx              # Root: composes all UI
├── main.tsx             # Entry point
├── types.ts             # All shared TypeScript types
├── components/          # UI components (one per file), barrel re-exported via index.ts
├── data/levels.ts       # Level definitions (elements, win conditions, star thresholds)
├── hooks/useGame.ts     # Central game state hook (the only hook)
├── lib/
│   ├── keyboard.ts      # Keyboard event capture, VO modifier detection
│   ├── navigation.ts    # Virtual cursor, element traversal, rotor
│   ├── speech.ts        # Web Speech API wrapper
│   ├── storage.ts       # localStorage persistence
│   └── screenreaders/   # Adapter pattern: VoiceOver, NVDA, Orca
└── styles/              # Plain CSS files (base, game, levels, index)
```

### Core Flow

Keyboard → `keyboard.ts` → `navigation.ts` → `speech.ts` → UI via `useGame.ts`

### Key Constraints

- All UI must be accessible — use ARIA attributes, support keyboard navigation
- Preact, not React — hooks from `preact/hooks`, `class` not `className`
- No external runtime dependencies beyond `preact` — keep the bundle small
- No linter or formatter is installed — rely on TypeScript strict checks

## Git

Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
