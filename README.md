# VoiceOver Adventures

A progressive web game that teaches macOS VoiceOver keyboard shortcuts through interactive challenges. Learn screen reader navigation without needing to enable VoiceOver.

![VoiceOver Adventures Screenshot](./screenshot.png)

## Features

- **10 Progressive Levels** - From basic navigation to advanced rotor and form controls
- **Realistic VoiceOver Simulation** - Virtual cursor, element announcements, and interaction states
- **Speech Synthesis** - Hear announcements via Web Speech API (with visual fallback)
- **Progress Persistence** - Your progress saves automatically via localStorage
- **Star Ratings** - Earn stars based on move efficiency
- **Accessibility First** - Works with actual screen readers, supports high contrast mode

## Commands Taught

| Keys | Action |
|------|--------|
| `VO + ←/→` | Navigate between items |
| `VO + ↑/↓` | Navigate in grid layouts |
| `VO + Shift + ↓` | Interact (enter group) |
| `VO + Shift + ↑` | Stop interacting (exit group) |
| `VO + Space` | Activate element |
| `VO + Cmd + H` | Next heading |
| `VO + Cmd + L` | Next link |
| `VO + Cmd + J` | Next form control |
| `VO + U` | Open rotor |
| `VO + Q` | Toggle Quick Nav |
| `VO + A` | Read all from current position |

> **Note:** `VO` means `Control + Option` pressed together

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/voiceover-adventures.git
cd voiceover-adventures

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Tech Stack

- **[Preact](https://preactjs.com/)** - Lightweight React alternative (3KB)
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Fast build tool with HMR
- **Web Speech API** - Browser-native speech synthesis

## Project Structure

```
src/
├── components/       # Preact components
├── data/            # Level definitions
├── hooks/           # Custom hooks (useGame)
├── lib/             # Core modules
│   ├── keyboard.ts  # Keyboard handler
│   ├── speech.ts    # Speech engine
│   ├── storage.ts   # LocalStorage persistence
│   └── voiceover.ts # VoiceOver simulator
├── styles/          # CSS styles
├── types.ts         # TypeScript types
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

### Ideas for Contribution

- Add more levels (text selection, Braille display commands)
- Improve mobile support
- Add internationalization
- Create level editor
- Add multiplayer/leaderboards

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

- Inspired by [Vim Adventures](https://vim-adventures.com/)
- VoiceOver keyboard shortcuts reference from [Apple Support](https://support.apple.com/guide/voiceover/welcome/mac)

## Related Projects

- [A11y.coffee](https://a11y.coffee/) - Accessibility resources
- [Deque aXe](https://www.deque.com/axe/) - Accessibility testing
