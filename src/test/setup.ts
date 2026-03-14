import { cleanup } from '@testing-library/preact';
import { afterEach, vi } from 'vitest';

// Mock AudioContext for jsdom environment
class MockAudioContext {
  state = 'suspended';
  currentTime = 0;
  resume = vi.fn().mockResolvedValue(undefined);
  createOscillator = vi.fn().mockReturnValue({
    type: 'sine',
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      value: 440,
    },
  });
  createGain = vi.fn().mockReturnValue({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  });
  destination = {};
}

vi.stubGlobal('AudioContext', MockAudioContext);
vi.stubGlobal('webkitAudioContext', MockAudioContext);

afterEach(() => {
  cleanup();
});
