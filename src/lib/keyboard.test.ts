import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as keyboard from './keyboard';
import { setScreenReader } from './screenreaders';

describe('keyboard', () => {
  let commandHandler: any;

  beforeEach(() => {
    // Ensure we are testing the VoiceOver adapter
    setScreenReader('voiceover');
    
    commandHandler = vi.fn();
    keyboard.init(commandHandler);
    
    // Reset state
    keyboard.setQuickNav(false);
    keyboard.setRotorOpen(false);
  });

  afterEach(() => {
    keyboard.destroy();
    vi.clearAllMocks();
  });

  const triggerKey = (
    key: string,
    code: string,
    modifiers: { ctrlKey?: boolean; altKey?: boolean; shiftKey?: boolean; metaKey?: boolean } = {}
  ) => {
    const event = new KeyboardEvent('keydown', {
      key,
      code,
      ctrlKey: modifiers.ctrlKey || false,
      altKey: modifiers.altKey || false,
      shiftKey: modifiers.shiftKey || false,
      metaKey: modifiers.metaKey || false,
      bubbles: true,
      cancelable: true,
    });
    
    // Spy on preventDefault/stopPropagation
    vi.spyOn(event, 'preventDefault');
    vi.spyOn(event, 'stopPropagation');
    
    document.dispatchEvent(event);
    return event;
  };

  it('should trigger command on standard VO keystrokes', () => {
    const event = triggerKey('ArrowRight', 'ArrowRight', { ctrlKey: true, altKey: true });
    
    expect(commandHandler).toHaveBeenCalledWith('moveNext', expect.any(KeyboardEvent));
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should ignore non-VO keystrokes by default', () => {
    const event = triggerKey('ArrowRight', 'ArrowRight'); // No modifiers
    
    expect(commandHandler).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should handle Quick Nav commands when enabled', () => {
    keyboard.setQuickNav(true);
    
    // Press 'h' with no modifiers
    const event = triggerKey('h', 'KeyH');
    
    expect(commandHandler).toHaveBeenCalledWith('nextHeading', expect.any(KeyboardEvent));
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should ignore Quick Nav commands when modifying keys are pressed', () => {
    keyboard.setQuickNav(true);
    
    // Press 'cmd+h' 
    triggerKey('h', 'KeyH', { metaKey: true });
    
    expect(commandHandler).not.toHaveBeenCalled();
  });

  it('should handle Rotor commands when rotor is open', () => {
    keyboard.setRotorOpen(true);
    
    const event = triggerKey('ArrowDown', 'ArrowDown');
    
    expect(commandHandler).toHaveBeenCalledWith('rotorNextItem', expect.any(KeyboardEvent));
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
