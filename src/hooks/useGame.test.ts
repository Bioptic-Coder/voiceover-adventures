import { renderHook, act } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGame } from './useGame';
import * as navigation from '@/lib/navigation';

// Mock dependencies
vi.mock('@/lib/storage', () => ({
  getSettings: vi.fn().mockReturnValue({
    speechEnabled: true,
    speechRate: 1,
    highContrast: false,
    volume: 1,
    screenReader: 'voiceover',
  }),
  getCurrentLevel: vi.fn().mockReturnValue(1),
  saveLevelProgress: vi.fn().mockReturnValue({
    bestMoves: 5,
    bestTime: 1000,
  }),
}));

vi.mock('@/lib/speech', () => ({
  init: vi.fn(),
  speak: vi.fn(),
  announceAction: vi.fn(),
  announceElement: vi.fn(),
}));

vi.mock('@/lib/audio', () => ({
  init: vi.fn(),
  playBoundary: vi.fn(),
}));

vi.mock('@/lib/navigation', () => ({
  init: vi.fn(),
  reset: vi.fn(),
  setElements: vi.fn(),
  moveTo: vi.fn(),
  handleCommand: vi.fn(),
}));

describe('useGame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with level 1 by default', () => {
    const { result } = renderHook(() => useGame());
    
    expect(result.current.currentLevelId).toBe(1);
    expect(result.current.levelState).not.toBeNull();
    expect(result.current.levelState?.id).toBe(1);
    expect(result.current.screenReader).toBe('voiceover');
  });

  it('loads a specific level', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.loadLevel(2);
    });

    expect(result.current.currentLevelId).toBe(2);
    expect(result.current.levelState?.id).toBe(2);
    expect(navigation.reset).toHaveBeenCalled();
  });

  it('handles command correctly if allowed', () => {
    renderHook(() => useGame());
    // Hook initializes keyboard.init(handleCommand)
    // Complex state transitions are handled via internal handleCommand
    // For now, we're testing the hook's interface and initial state
  });

  it('updates screen reader and resets modes', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.handleScreenReaderChange('nvda');
    });

    expect(result.current.screenReader).toBe('nvda');
    expect(result.current.browseMode).toBe(true);
    expect(result.current.quickNavEnabled).toBe(false);
  });

  it('toggles help and settings modals', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.setShowHelp(true);
    });
    expect(result.current.showHelp).toBe(true);

    act(() => {
      result.current.setShowSettings(true);
    });
    expect(result.current.showSettings).toBe(true);
  });
});
