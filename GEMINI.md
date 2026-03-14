# GEMINI.md

## Project Overview
**VoiceOver Adventures** is an interactive, web-based educational game designed to teach screen reader keyboard shortcuts (macOS VoiceOver, NVDA, and Orca) through progressive challenges. It simulates screen reader behavior (virtual cursor, element announcements, interaction states) without requiring the user to enable an actual screen reader.

### Core Technologies
- **Frontend:** [Preact](https://preactjs.com/) (lightweight React alternative) with TypeScript.
- **Build Tool:** [Vite](https://vitejs.dev/) for fast development and bundling.
- **Testing:** [Vitest](https://vitest.dev/) for unit and integration testing.
- **Audio/Speech:** Web Speech API for synthesis and browser-native Audio API for sound effects.
- **State Management:** Custom hooks (`useGame`) and module-level state for navigation simulation.

## Architecture & Key Modules

### 1. Screen Reader Simulation (`src/lib/`)
- **`navigation.ts`**: The core "engine" that manages the virtual cursor, interaction stack (for nested groups), and executing navigation commands (e.g., `moveNext`, `nextHeading`).
- **`keyboard.ts`**: High-level keyboard event handler. It captures raw input and uses screen reader adapters to resolve them into abstract `SRCommand` types.
- **`screenreaders/`**: Implements an **Adapter Pattern** to support different screen readers.
  - `voiceover.ts`, `nvda.ts`, `orca.ts`: Concrete implementations defining keys, modifiers, and terminology.
  - `types.ts`: Defines the `ScreenReaderAdapter` interface and `SRCommand` union.

### 2. Game Logic & State (`src/hooks/`)
- **`useGame.ts`**: The central orchestrator. It manages level loading, move counting, win condition checking, and bridges the simulation logic with the Preact UI.

### 3. Level System (`src/data/`)
- **`levels.ts`**: Defines each level's structure, including allowed commands, element layout (headings, links, tables), and win conditions (`reach`, `activate`, `reachCell`).

### 4. UI Components (`src/components/`)
- **`GameArea.tsx`**: Renders the level's virtual DOM.
- **`AnnouncementBar.tsx`**: Displays the "visual braille" (text output of what the screen reader says).
- **`Rotor.tsx` / `ElementsList.tsx`**: Simulates the modal navigation menus found in screen readers.

## Development Workflows

### Key Commands
- `npm run dev`: Starts the development server at `http://localhost:3000`.
- `npm run build`: Production build (runs `tsc` then `vite build`).
- `npm run test`: Runs the Vitest suite.
- `npm run lint`: Runs ESLint on the source directory.
- `npm run typecheck`: Runs TypeScript compiler in `noEmit` mode.

### Coding Standards
- **Path Aliases:** Use `@/` to refer to the `src/` directory (e.g., `import { ... } from '@/types'`).
- **Styling:** Modular CSS located in `src/styles/`. Avoid utility-first CSS frameworks.
- **Types:** All shared interfaces and types should be defined in `src/types.ts`.
- **Testing:** New features or navigation logic changes should include a corresponding `.test.ts` file in `src/lib/`.

## Screen Reader Support Table

| Screen Reader | Platform | Primary Modifier | Mode Names |
|---------------|----------|------------------|------------|
| **VoiceOver** | macOS    | `Ctrl + Opt`     | Quick Nav  |
| **NVDA**      | Windows  | `Insert` / `Caps`| Browse Mode|
| **Orca**      | Linux    | `Insert` / `Caps`| Browse Mode|

## Important Constants
- **`VO` Modifier:** In code and documentation, `VO` refers to the active screen reader's modifier keys (e.g., `Control + Option` for VoiceOver).
- **Virtual Cursor:** Visualized via the `.vo-cursor` CSS class on game elements.
