import type { ScreenReaderAdapter, SRCommand, SRState } from './types';

const KEY_CODES: Record<string, string> = {
  ArrowRight: 'right',
  ArrowLeft: 'left',
  ArrowUp: 'up',
  ArrowDown: 'down',
  Enter: 'enter',
  Space: 'space',
  Escape: 'escape',
  Tab: 'tab',
  Insert: 'insert',
};

// NVDA commands (Insert + keys)
// Note: In browser, Insert key detection can be unreliable
// We also support ` (backtick) as an alternative modifier
const NVDA_COMMANDS: Record<string, SRCommand> = {
  'nvda+right': 'moveNext',
  'nvda+left': 'movePrevious',
  'nvda+down': 'moveDown',
  'nvda+up': 'moveUp',
  'nvda+a': 'readAll',
  'nvda+b': 'readFromBeginning',
  'nvda+shift+down': 'interact',
  'nvda+shift+up': 'stopInteract',
  'nvda+enter': 'activate',
  'nvda+space': 'toggleBrowseMode',
  'nvda+f7': 'openElementsList',
  'nvda+h': 'nextHeading',
  'nvda+shift+h': 'previousHeading',
  'nvda+k': 'nextLink',
  'nvda+shift+k': 'previousLink',
  'nvda+f': 'nextFormControl',
  'nvda+shift+f': 'previousFormControl',
};

// Browse mode commands (single keys when in browse mode - default on)
const BROWSE_COMMANDS: Record<string, SRCommand> = {
  right: 'moveNext',
  left: 'movePrevious',
  down: 'moveNext',
  up: 'movePrevious',
  h: 'nextHeading',
  'shift+h': 'previousHeading',
  k: 'nextLink',
  'shift+k': 'previousLink',
  f: 'nextFormControl',
  'shift+f': 'previousFormControl',
  enter: 'activate',
  space: 'activate',
};

// Elements List commands (F7)
const ELEMENTS_LIST_COMMANDS: Record<string, SRCommand> = {
  right: 'elementsListNextCategory',
  left: 'elementsListPrevCategory',
  down: 'elementsListNextItem',
  up: 'elementsListPrevItem',
  enter: 'elementsListSelect',
  escape: 'elementsListClose',
  tab: 'elementsListNextCategory',
  'shift+tab': 'elementsListPrevCategory',
};

// Command display info
const COMMAND_INFO: Record<SRCommand, { key: string; description: string }> = {
  moveNext: { key: 'NVDA + \u2192', description: 'Move to next item' },
  movePrevious: { key: 'NVDA + \u2190', description: 'Move to previous item' },
  moveDown: { key: 'NVDA + \u2193', description: 'Move down' },
  moveUp: { key: 'NVDA + \u2191', description: 'Move up' },
  readAll: { key: 'NVDA + A', description: 'Read all from current position' },
  readFromBeginning: { key: 'NVDA + B', description: 'Read from beginning' },
  interact: { key: 'NVDA + Shift + \u2193', description: 'Enter focus mode' },
  stopInteract: { key: 'NVDA + Shift + \u2191', description: 'Exit focus mode' },
  activate: { key: 'Enter', description: 'Activate/click' },
  nextHeading: { key: 'H', description: 'Next heading (Browse Mode)' },
  previousHeading: { key: 'Shift + H', description: 'Previous heading (Browse Mode)' },
  nextLink: { key: 'K', description: 'Next link (Browse Mode)' },
  previousLink: { key: 'Shift + K', description: 'Previous link (Browse Mode)' },
  nextFormControl: { key: 'F', description: 'Next form control (Browse Mode)' },
  previousFormControl: { key: 'Shift + F', description: 'Previous form control (Browse Mode)' },
  toggleBrowseMode: { key: 'NVDA + Space', description: 'Toggle Browse/Focus Mode' },
  openElementsList: { key: 'NVDA + F7', description: 'Open Elements List' },
  // VoiceOver commands mapped to NVDA equivalents
  toggleQuickNav: { key: 'NVDA + Space', description: 'Toggle Browse/Focus Mode' },
  openRotor: { key: 'NVDA + F7', description: 'Open Elements List' },
  rotorNextCategory: { key: 'Tab', description: 'Next category' },
  rotorPrevCategory: { key: 'Shift + Tab', description: 'Previous category' },
  rotorNextItem: { key: '\u2193', description: 'Next item' },
  rotorPrevItem: { key: '\u2191', description: 'Previous item' },
  rotorSelect: { key: 'Enter', description: 'Select item' },
  rotorClose: { key: 'Escape', description: 'Close' },
  // Elements List specific
  elementsListNextCategory: { key: 'Tab', description: 'Next category' },
  elementsListPrevCategory: { key: 'Shift + Tab', description: 'Previous category' },
  elementsListNextItem: { key: '\u2193', description: 'Next item' },
  elementsListPrevItem: { key: '\u2191', description: 'Previous item' },
  elementsListSelect: { key: 'Enter', description: 'Activate and close' },
  elementsListClose: { key: 'Escape', description: 'Close' },
};

function isNVDAModifier(event: KeyboardEvent): boolean {
  // Insert key or backtick (`) as alternative
  return event.key === 'Insert' || event.code === 'Insert' || event.key === '`';
}

function parseNVDACommand(event: KeyboardEvent, isNVDAPressed: boolean): SRCommand | null {
  if (!isNVDAPressed) return null;

  let commandKey = 'nvda';
  if (event.shiftKey) commandKey += '+shift';

  const key = event.key.toLowerCase();

  // Handle special keys
  if (event.code.startsWith('F') && event.code.length <= 3) {
    commandKey += `+${event.code.toLowerCase()}`;
  } else {
    commandKey += `+${KEY_CODES[event.code] || key}`;
  }

  return NVDA_COMMANDS[commandKey] || null;
}

function parseBrowseCommand(event: KeyboardEvent): SRCommand | null {
  const key = event.key.toLowerCase();
  let commandKey = KEY_CODES[event.code] || key;

  if (event.shiftKey) {
    commandKey = `shift+${commandKey}`;
  }

  return BROWSE_COMMANDS[commandKey] || null;
}

function parseElementsListCommand(event: KeyboardEvent): SRCommand | null {
  const key = KEY_CODES[event.code] || event.key.toLowerCase();
  let commandKey = key;

  if (event.shiftKey) {
    commandKey = `shift+${commandKey}`;
  }

  return ELEMENTS_LIST_COMMANDS[commandKey] || null;
}

// Track NVDA modifier state (Insert key or backtick)
let nvdaModifierPressed = false;

export function setNVDAModifierPressed(pressed: boolean): void {
  nvdaModifierPressed = pressed;
}

export const nvdaAdapter: ScreenReaderAdapter = {
  type: 'nvda',
  name: 'NVDA',
  modifierName: 'NVDA',
  modifierDisplay: 'Insert (or `)',
  platform: 'Windows',

  commands: NVDA_COMMANDS,
  browseCommands: BROWSE_COMMANDS,
  modalCommands: ELEMENTS_LIST_COMMANDS,

  commandInfo: COMMAND_INFO,

  features: {
    hasRotor: false,
    hasElementsList: true,
    hasBrowseMode: true,
    hasQuickNav: false,
  },

  parseCommand(event: KeyboardEvent, state: SRState): SRCommand | null {
    // Track NVDA modifier
    if (isNVDAModifier(event)) {
      nvdaModifierPressed = true;
      // Don't return a command for just pressing the modifier
      return null;
    }

    // Handle Elements List commands when open
    if (state.elementsListOpen) {
      return parseElementsListCommand(event);
    }

    // Check for NVDA+key commands first
    if (nvdaModifierPressed) {
      const cmd = parseNVDACommand(event, true);
      if (cmd) return cmd;
    }

    // Handle Browse Mode commands when enabled (default on for NVDA)
    if (state.browseMode && !event.ctrlKey && !event.altKey && !event.metaKey) {
      return parseBrowseCommand(event);
    }

    return null;
  },

  transformHint(hint: string): string {
    return hint
      // Replace VoiceOver modifier references
      .replace(/Control\s*\+\s*Option/gi, 'Insert (or `)')
      .replace(/Ctrl\s*\+\s*Option/gi, 'Insert (or `)')
      .replace(/\bVO\b/g, 'NVDA')
      // Replace Cmd with Ctrl for Windows
      .replace(/\bCmd\b/gi, 'Ctrl')
      .replace(/\bCommand\b/gi, 'Ctrl')
      // Replace Quick Nav with Browse Mode
      .replace(/Quick Nav/gi, 'Browse Mode')
      // Replace Rotor with Elements List
      .replace(/Rotor/gi, 'Elements List')
      .replace(/VO \+ U/gi, 'NVDA + F7')
      .replace(/VO \+ Q/gi, 'NVDA + Space');
  },
};

// Handle keyup to track modifier release
export function handleNVDAKeyUp(event: KeyboardEvent): void {
  if (isNVDAModifier(event)) {
    nvdaModifierPressed = false;
  }
}
