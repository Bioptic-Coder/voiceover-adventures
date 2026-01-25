import type { VOCommand, RotorCategory, RotorItem, RotorState, ElementType } from '@/types';
import * as speech from './speech';
import * as keyboard from './keyboard';

interface VOCallbacks {
  onCursorMove?: (element: HTMLElement) => void;
  onInteract?: (entering: boolean, element: HTMLElement) => void;
  onActivate?: (element: HTMLElement) => void;
  onRotorChange?: (state: RotorState) => void;
}

let currentElement: HTMLElement | null = null;
let elements: HTMLElement[] = [];
let interacting = false;
let interactionStack: HTMLElement[] = [];
let quickNavEnabled = false;

// Rotor state
const rotorCategories: RotorCategory[] = ['Headings', 'Links', 'Form Controls', 'Tables', 'Lists'];
let currentRotorCategory = 0;
let rotorItems: RotorItem[] = [];
let currentRotorItem = 0;

// Callbacks
let callbacks: VOCallbacks = {};

export function init(cbs: VOCallbacks = {}): void {
  callbacks = cbs;
  reset();
}

export function reset(): void {
  currentElement = null;
  elements = [];
  interacting = false;
  interactionStack = [];
  quickNavEnabled = false;
  currentRotorCategory = 0;
  rotorItems = [];
  currentRotorItem = 0;
}

export function setElements(els: HTMLElement[]): void {
  elements = els;
  if (elements.length > 0) {
    moveTo(elements[0]);
  }
}

function getNavigableElements(): HTMLElement[] {
  if (interacting && interactionStack.length > 0) {
    const parent = interactionStack[interactionStack.length - 1];
    return Array.from(parent.querySelectorAll(':scope > .game-element'));
  }
  return elements.filter((el) => !el.parentElement?.classList.contains('game-element'));
}

export function moveTo(element: HTMLElement): void {
  if (currentElement) {
    currentElement.classList.remove('vo-cursor');
  }

  currentElement = element;

  if (element) {
    element.classList.add('vo-cursor');
    speech.announceElement(element);
    callbacks.onCursorMove?.(element);
  }
}

export function moveNext(): boolean {
  const navigable = getNavigableElements();
  const currentIndex = navigable.indexOf(currentElement!);

  if (currentIndex < navigable.length - 1) {
    moveTo(navigable[currentIndex + 1]);
    return true;
  }
  speech.announceAction('boundary');
  return false;
}

export function movePrevious(): boolean {
  const navigable = getNavigableElements();
  const currentIndex = navigable.indexOf(currentElement!);

  if (currentIndex > 0) {
    moveTo(navigable[currentIndex - 1]);
    return true;
  }
  speech.announceAction('boundary');
  return false;
}

export function moveDown(): boolean {
  const navigable = getNavigableElements();

  if (currentElement) {
    const rect = currentElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    const below = navigable.filter((el) => {
      const elRect = el.getBoundingClientRect();
      return elRect.top > rect.bottom - 5;
    });

    if (below.length > 0) {
      const closest = below.reduce((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        const aDist = Math.abs(aRect.left + aRect.width / 2 - centerX);
        const bDist = Math.abs(bRect.left + bRect.width / 2 - centerX);
        return aDist < bDist ? a : b;
      });

      moveTo(closest);
      return true;
    }
  }

  return moveNext();
}

export function moveUp(): boolean {
  const navigable = getNavigableElements();

  if (currentElement) {
    const rect = currentElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    const above = navigable.filter((el) => {
      const elRect = el.getBoundingClientRect();
      return elRect.bottom < rect.top + 5;
    });

    if (above.length > 0) {
      const closest = above.reduce((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        const aDist = Math.abs(aRect.left + aRect.width / 2 - centerX);
        const bDist = Math.abs(bRect.left + bRect.width / 2 - centerX);
        return aDist < bDist ? a : b;
      });

      moveTo(closest);
      return true;
    }
  }

  return movePrevious();
}

export function interact(): boolean {
  if (!currentElement) return false;

  const children = currentElement.querySelectorAll(':scope > .game-element');

  if (children.length > 0) {
    interactionStack.push(currentElement);
    currentElement.classList.add('interacting');
    interacting = true;

    moveTo(children[0] as HTMLElement);
    speech.announceAction('interact');
    callbacks.onInteract?.(true, currentElement);

    return true;
  }

  return false;
}

export function stopInteract(): boolean {
  if (interactionStack.length === 0) {
    speech.announceAction('boundary');
    return false;
  }

  const parent = interactionStack.pop()!;
  parent.classList.remove('interacting');
  interacting = interactionStack.length > 0;

  moveTo(parent);
  speech.announceAction('stopInteract');
  callbacks.onInteract?.(false, parent);

  return true;
}

export function activate(): boolean {
  if (!currentElement) return false;

  const type = currentElement.getAttribute('data-type') as ElementType;

  if (type === 'checkbox') {
    currentElement.classList.toggle('checked');
    speech.announceAction('toggle');
  } else if (type === 'button' || type === 'link') {
    currentElement.classList.add('activated');
    setTimeout(() => currentElement?.classList.remove('activated'), 200);
    speech.announceAction('activate');
  }

  callbacks.onActivate?.(currentElement);
  return true;
}

function nextOfType(type: string): boolean {
  const currentIndex = elements.indexOf(currentElement!);

  for (let i = currentIndex + 1; i < elements.length; i++) {
    if (elements[i].getAttribute('data-type') === type) {
      moveTo(elements[i]);
      return true;
    }
  }

  speech.announceAction('no-item');
  return false;
}

function previousOfType(type: string): boolean {
  const currentIndex = elements.indexOf(currentElement!);

  for (let i = currentIndex - 1; i >= 0; i--) {
    if (elements[i].getAttribute('data-type') === type) {
      moveTo(elements[i]);
      return true;
    }
  }

  speech.announceAction('no-item');
  return false;
}

export function nextHeading(): boolean {
  return nextOfType('heading');
}

export function previousHeading(): boolean {
  return previousOfType('heading');
}

export function nextLink(): boolean {
  return nextOfType('link');
}

export function previousLink(): boolean {
  return previousOfType('link');
}

export function nextFormControl(): boolean {
  const formTypes = ['input', 'checkbox', 'button', 'menu'];
  const currentIndex = elements.indexOf(currentElement!);

  for (let i = currentIndex + 1; i < elements.length; i++) {
    const type = elements[i].getAttribute('data-type');
    if (type && formTypes.includes(type)) {
      moveTo(elements[i]);
      return true;
    }
  }

  speech.announceAction('no-item');
  return false;
}

export function previousFormControl(): boolean {
  const formTypes = ['input', 'checkbox', 'button', 'menu'];
  const currentIndex = elements.indexOf(currentElement!);

  for (let i = currentIndex - 1; i >= 0; i--) {
    const type = elements[i].getAttribute('data-type');
    if (type && formTypes.includes(type)) {
      moveTo(elements[i]);
      return true;
    }
  }

  speech.announceAction('no-item');
  return false;
}

export function readAll(): boolean {
  const navigable = getNavigableElements();
  const currentIndex = navigable.indexOf(currentElement!);
  const toRead = navigable.slice(currentIndex);
  speech.announceReading(toRead);
  return true;
}

export function readFromBeginning(): boolean {
  const navigable = getNavigableElements();
  speech.announceReading(navigable);
  return true;
}

export function toggleQuickNav(): boolean {
  quickNavEnabled = !quickNavEnabled;
  keyboard.setQuickNav(quickNavEnabled);
  speech.announceAction(quickNavEnabled ? 'quicknav-on' : 'quicknav-off');
  return true;
}

function updateRotorItems(): void {
  const category = rotorCategories[currentRotorCategory];
  const typeMap: Record<RotorCategory, string | string[]> = {
    Headings: 'heading',
    Links: 'link',
    'Form Controls': ['input', 'checkbox', 'button', 'menu'],
    Tables: 'table',
    Lists: 'list',
  };

  const types = typeMap[category];
  const typeArray = Array.isArray(types) ? types : [types];

  rotorItems = elements
    .filter((el) => {
      const type = el.getAttribute('data-type');
      return type && typeArray.includes(type);
    })
    .map((el) => ({
      element: el,
      label: el.getAttribute('data-label') || el.textContent?.trim() || '',
      type: el.getAttribute('data-type') as ElementType,
    }));

  currentRotorItem = 0;
}

export function openRotor(): boolean {
  updateRotorItems();
  keyboard.setRotorOpen(true);
  speech.announceAction('rotor-open');
  speech.speak(rotorCategories[currentRotorCategory]);

  callbacks.onRotorChange?.({
    open: true,
    category: rotorCategories[currentRotorCategory],
    items: rotorItems,
    selectedIndex: currentRotorItem,
  });

  return true;
}

export function closeRotor(): boolean {
  keyboard.setRotorOpen(false);
  speech.announceAction('rotor-close');
  callbacks.onRotorChange?.({ open: false });
  return true;
}

export function rotorNextCategory(): boolean {
  currentRotorCategory = (currentRotorCategory + 1) % rotorCategories.length;
  updateRotorItems();
  speech.speak(rotorCategories[currentRotorCategory]);

  callbacks.onRotorChange?.({
    open: true,
    category: rotorCategories[currentRotorCategory],
    items: rotorItems,
    selectedIndex: currentRotorItem,
  });

  return true;
}

export function rotorPrevCategory(): boolean {
  currentRotorCategory =
    (currentRotorCategory - 1 + rotorCategories.length) % rotorCategories.length;
  updateRotorItems();
  speech.speak(rotorCategories[currentRotorCategory]);

  callbacks.onRotorChange?.({
    open: true,
    category: rotorCategories[currentRotorCategory],
    items: rotorItems,
    selectedIndex: currentRotorItem,
  });

  return true;
}

export function rotorNextItem(): boolean {
  if (rotorItems.length === 0) return false;

  currentRotorItem = (currentRotorItem + 1) % rotorItems.length;
  const item = rotorItems[currentRotorItem];
  speech.speak(`${item.label}, ${item.type}`);

  callbacks.onRotorChange?.({
    open: true,
    category: rotorCategories[currentRotorCategory],
    items: rotorItems,
    selectedIndex: currentRotorItem,
  });

  return true;
}

export function rotorPrevItem(): boolean {
  if (rotorItems.length === 0) return false;

  currentRotorItem = (currentRotorItem - 1 + rotorItems.length) % rotorItems.length;
  const item = rotorItems[currentRotorItem];
  speech.speak(`${item.label}, ${item.type}`);

  callbacks.onRotorChange?.({
    open: true,
    category: rotorCategories[currentRotorCategory],
    items: rotorItems,
    selectedIndex: currentRotorItem,
  });

  return true;
}

export function rotorSelect(): boolean {
  if (rotorItems.length === 0) return false;

  const item = rotorItems[currentRotorItem];
  closeRotor();
  moveTo(item.element);

  return true;
}

export function handleCommand(command: VOCommand): boolean {
  const handlers: Record<VOCommand, () => boolean> = {
    moveNext,
    movePrevious,
    moveDown,
    moveUp,
    interact,
    stopInteract,
    activate,
    readAll,
    readFromBeginning,
    nextHeading,
    previousHeading,
    nextLink,
    previousLink,
    nextFormControl,
    previousFormControl,
    toggleQuickNav,
    openRotor,
    rotorNextCategory,
    rotorPrevCategory,
    rotorNextItem,
    rotorPrevItem,
    rotorSelect,
    rotorClose: closeRotor,
  };

  const handler = handlers[command];
  return handler ? handler() : false;
}

export function getCurrentElement(): HTMLElement | null {
  return currentElement;
}

export function isInteracting(): boolean {
  return interacting;
}

export function isQuickNavEnabled(): boolean {
  return quickNavEnabled;
}
