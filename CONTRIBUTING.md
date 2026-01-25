# Contributing to VoiceOver Adventures

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and inclusive. We want this to be a welcoming project for everyone.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/voiceover-adventures/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and OS information

### Suggesting Features

1. Open an issue with the `enhancement` label
2. Describe the feature and its use case
3. Explain why it would benefit users

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run type checking: `npm run typecheck`
5. Test your changes in the browser
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build
```

## Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

## Adding New Levels

Levels are defined in `src/data/levels.ts`. Each level needs:

```typescript
{
  id: number,
  title: string,
  description: string,
  objective: string,
  commands: VOCommand[],      // Commands to teach
  layout: LevelLayout,        // 'linear' | 'grid' | 'document' | etc.
  elements: GameElementDef[], // Elements in the level
  winCondition: WinCondition, // How to complete the level
  starThresholds: { moves: [number, number, number] },
  hints: string[]
}
```

## Testing

Currently testing is manual. Before submitting a PR:

1. Test all affected levels
2. Verify keyboard shortcuts work
3. Check speech announcements
4. Test in multiple browsers (Chrome, Firefox, Safari)

## Questions?

Open an issue with the `question` label or start a discussion.
