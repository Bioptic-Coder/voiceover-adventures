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
  CapsLock: 'capslock',
};

// Orca commands (Insert or CapsLock + keys)
// Note: In browser, these key detections can be unreliable
// We also support ` (backtick) as an alternative modifier
const ORCA_COMMANDS: Record<string, SRCommand> = {
  'orca+right': 'moveNext',
  'orca+left': 'movePrevious',
  'orca+down': 'moveDown',
  'orca+up': 'moveUp',
  'orca+a': 'readAll',
  'orca+b': 'readFromBeginning',
  'orca+shift+down': 'interact',
  'orca+shift+up': 'stopInteract',
  'orca+enter': 'activate',
  'orca+space': 'toggleBrowseMode',
  'orca+f7': 'openElementsList',
  'orca+h': 'nextHeading',
  'orca+shift+h': 'previousHeading',
  'orca+l': 'nextLink',
  'orca+shift+l': 'previousLink',
  'orca+f': 'nextFormControl',
  'orca+shift+f': 'previousFormControl',
};

// Browse mode commands (single keys when in browse mode - default on)
const BROWSE_COMMANDS: Record<string, SRCommand> = {
  right: 'moveNext',
  left: 'movePrevious',
  down: 'moveNext',
  up: 'movePrevious',
  h: 'nextHeading',
  'shift+h': 'previousHeading',
  l: 'nextLink',
  'shift+l': 'previousLink',
  f: 'nextFormControl',
  'shift+f': 'previousFormControl',
  enter: 'activate',
  space: 'activate',
};

// Elements List commands
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
  moveNext: { key: 'Orca + \u2192', description: 'Move to next item' },
  movePrevious: { key: 'Orca + \u2190', description: 'Move to previous item' },
  moveDown: { key: 'Orca + \u2193', description: 'Move down' },
  moveUp: { key: 'Orca + \u2191', description: 'Move up' },
  readAll: { key: 'Orca + A', description: 'Read all from current position' },
  readFromBeginning: { key: 'Orca + B', description: 'Read from beginning' },
  interact: { key: 'Orca + Shift + \u2193', description: 'Enter focus mode' },
  stopInteract: { key: 'Orca + Shift + \u2191', description: 'Exit focus mode' },
  activate: { key: 'Enter', description: 'Activate/click' },
  nextHeading: { key: 'H', description: 'Next heading (Browse Mode)' },
  previousHeading: { key: 'Shift + H', description: 'Previous heading (Browse Mode)' },
  nextLink: { key: 'L', description: 'Next link (Browse Mode)' },
  previousLink: { key: 'Shift + L', description: 'Previous link (Browse Mode)' },
  nextFormControl: { key: 'F', description: 'Next form control (Browse Mode)' },
  previousFormControl: { key: 'Shift + F', description: 'Previous form control (Browse Mode)' },
  toggleBrowseMode: { key: 'Orca + Space', description: 'Toggle Browse/Focus Mode' },
  openElementsList: { key: 'Orca + F7', description: 'Open Elements List' },
  // VoiceOver commands mapped to Orca equivalents
  toggleQuickNav: { key: 'Orca + Space', description: 'Toggle Browse/Focus Mode' },
  openRotor: { key: 'Orca + F7', description: 'Open Elements List' },
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

function isOrcaModifier(event: KeyboardEvent): boolean {
  // Insert key, CapsLock, or backtick (`) as alternative
  return event.key === 'Insert' || event.code === 'Insert' ||
         event.key === 'CapsLock' || event.code === 'CapsLock' ||
         event.key === '`';
}

function parseOrcaCommand(event: KeyboardEvent, isOrcaPressed: boolean): SRCommand | null {
  if (!isOrcaPressed) return null;

  let commandKey = 'orca';
  if (event.shiftKey) commandKey += '+shift';

  const key = event.key.toLowerCase();

  // Handle special keys
  if (event.code.startsWith('F') && event.code.length <= 3) {
    commandKey += `+${event.code.toLowerCase()}`;
  } else {
    commandKey += `+${KEY_CODES[event.code] || key}`;
  }

  return ORCA_COMMANDS[commandKey] || null;
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

// Track Orca modifier state
let orcaModifierPressed = false;

export function setOrcaModifierPressed(pressed: boolean): void {
  orcaModifierPressed = pressed;
}

export const orcaAdapter: ScreenReaderAdapter = {
  type: 'orca',
  name: 'Orca',
  modifierName: 'Orca',
  modifierDisplay: 'Insert/CapsLock (or `)',
  platform: 'Linux',

  commands: ORCA_COMMANDS,
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
    // Track Orca modifier
    if (isOrcaModifier(event)) {
      orcaModifierPressed = true;
      return null;
    }

    // Handle Elements List commands when open
    if (state.elementsListOpen) {
      return parseElementsListCommand(event);
    }

    // Check for Orca+key commands first
    if (orcaModifierPressed) {
      const cmd = parseOrcaCommand(event, true);
      if (cmd) return cmd;
    }

    // Handle Browse Mode commands when enabled (default on for Orca)
    if (state.browseMode && !event.ctrlKey && !event.altKey && !event.metaKey) {
      return parseBrowseCommand(event);
    }

    return null;
  },

  transformHint(hint: string): string {
    return hint
      // Replace VoiceOver modifier references
      .replace(/Control\s*\+\s*Option/gi, 'Insert/CapsLock (or `)')
      .replace(/Ctrl\s*\+\s*Option/gi, 'Insert/CapsLock (or `)')
      .replace(/\bVO\b/g, 'Orca')
      // Replace Cmd with Ctrl for Linux
      .replace(/\bCmd\b/gi, 'Ctrl')
      .replace(/\bCommand\b/gi, 'Ctrl')
      // Replace Quick Nav with Browse Mode
      .replace(/Quick Nav/gi, 'Browse Mode')
      // Replace Rotor with Elements List
      .replace(/Rotor/gi, 'Elements List')
      .replace(/VO \+ U/gi, 'Orca + F7')
      .replace(/VO \+ Q/gi, 'Orca + Space');
  },
};

// Handle keyup to track modifier release
export function handleOrcaKeyUp(event: KeyboardEvent): void {
  if (isOrcaModifier(event)) {
    orcaModifierPressed = false;
  }
}
