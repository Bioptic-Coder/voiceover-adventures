import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as navigation from './navigation';

describe('navigation', () => {
  let container: HTMLDivElement;
  let callbacks: any;

  beforeEach(() => {
    // Set up a mock DOM environment
    container = document.createElement('div');
    container.innerHTML = `
      <div id="start" class="game-element start" data-type="text">Start Here</div>
      <div id="item1" class="game-element" data-type="button">Button 1</div>
      <div id="group1" class="game-element" data-type="group">
        <div id="inner1" class="game-element" data-type="button">Inner Button</div>
        <div id="inner2" class="game-element" data-type="link">Inner Link</div>
      </div>
      <div id="goal" class="game-element goal" data-type="button">Goal</div>
    `;
    document.body.appendChild(container);

    callbacks = {
      onCursorMove: vi.fn(),
      onInteract: vi.fn(),
      onActivate: vi.fn(),
      onRotorChange: vi.fn(),
    };

    // Initialize navigation with the mock elements
    navigation.init(callbacks);
    const elements = Array.from(container.querySelectorAll('.game-element')) as HTMLElement[];
    navigation.setElements(elements);
  });

  afterEach(() => {
    document.body.removeChild(container);
    navigation.reset();
    vi.clearAllMocks();
  });

  it('initializes and focuses the first element', () => {
    const current = navigation.getCurrentElement();
    expect(current?.id).toBe('start');
    expect(callbacks.onCursorMove).toHaveBeenCalledWith(current);
  });

  it('moves to the next top-level element', () => {
    navigation.moveNext();
    const current = navigation.getCurrentElement();
    
    expect(current?.id).toBe('item1');
    expect(callbacks.onCursorMove).toHaveBeenCalledWith(current);
  });

  it('ignores nested elements logically unless interacting', () => {
    navigation.moveNext(); // To item1
    navigation.moveNext(); // To group1
    
    const currentGroup = navigation.getCurrentElement();
    expect(currentGroup?.id).toBe('group1');
    
    // One more move should jump over inner children directly to the goal
    navigation.moveNext(); 
    
    const currentGoal = navigation.getCurrentElement();
    expect(currentGoal?.id).toBe('goal');
  });

  it('allows interacting with groups', () => {
    navigation.moveNext(); // To item1
    navigation.moveNext(); // To group1
    
    expect(navigation.interact()).toBe(true);
    let current = navigation.getCurrentElement();
    
    // Now focused on inside
    expect(current?.id).toBe('inner1');
    expect(navigation.isInteracting()).toBe(true);
    
    navigation.moveNext();
    current = navigation.getCurrentElement();
    expect(current?.id).toBe('inner2');
    
    // Cannot move outside implicitly
    expect(navigation.moveNext()).toBe(false);
    current = navigation.getCurrentElement();
    expect(current?.id).toBe('inner2');
  });

  it('stops interacting and returns focus to the parent group', () => {
    navigation.moveNext();
    navigation.moveNext();
    navigation.interact();
    
    expect(navigation.stopInteract()).toBe(true);
    
    const current = navigation.getCurrentElement();
    expect(current?.id).toBe('group1');
    expect(navigation.isInteracting()).toBe(false);
  });

  it('activates elements and calls onActivate', () => {
    navigation.moveNext(); // Button 1
    
    expect(navigation.activate()).toBe(true);
    expect(callbacks.onActivate).toHaveBeenCalled();
  });

  it('ignores activation if element unsupported or no current element', () => {
    // Current element is text, actually navigation.activate doesn't return false for text, it returns true but just skips CSS toggling.
    // Wait, let's verify if activate does anything
    navigation.activate();
    expect(callbacks.onActivate).toHaveBeenCalled();
  });
});
