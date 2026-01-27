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
};

// VoiceOver commands (Ctrl+Option + keys)
const VO_COMMANDS: Record<string, SRCommand> = {
  'vo+right': 'moveNext',
  'vo+left': 'movePrevious',
  'vo+down': 'moveDown',
  'vo+up': 'moveUp',
  'vo+a': 'readAll',
  'vo+b': 'readFromBeginning',
  'vo+shift+down': 'interact',
  'vo+shift+up': 'stopInteract',
  'vo+space': 'activate',
  'vo+ ': 'activate',
  'vo+cmd+h': 'nextHeading',
  'vo+cmd+shift+h': 'previousHeading',
  'vo+cmd+l': 'nextLink',
  'vo+cmd+shift+l': 'previousLink',
  'vo+u': 'openRotor',
  'vo+q': 'toggleQuickNav',
  'vo+cmd+j': 'nextFormControl',
  'vo+cmd+shift+j': 'previousFormControl',
};

// Quick Nav commands (single keys when enabled)
const QUICK_NAV_COMMANDS: Record<string, SRCommand> = {
  right: 'moveNext',
  left: 'movePrevious',
  h: 'nextHeading',
  'shift+h': 'previousHeading',
  l: 'nextLink',
  'shift+l': 'previousLink',
  f: 'nextFormControl',
  'shift+f': 'previousFormControl',
};

// Rotor commands
const ROTOR_COMMANDS: Record<string, SRCommand> = {
  right: 'rotorNextCategory',
  left: 'rotorPrevCategory',
  down: 'rotorNextItem',
  up: 'rotorPrevItem',
  enter: 'rotorSelect',
  escape: 'rotorClose',
};

// Command display info
const COMMAND_INFO: Record<SRCommand, { key: string; description: string }> = {
  moveNext: { key: 'VO + \u2192', description: 'Move to next item' },
  movePrevious: { key: 'VO + \u2190', description: 'Move to previous item' },
  moveDown: { key: 'VO + \u2193', description: 'Move down' },
  moveUp: { key: 'VO + \u2191', description: 'Move up' },
  readAll: { key: 'VO + A', description: 'Read all from current position' },
  readFromBeginning: { key: 'VO + B', description: 'Read from beginning' },
  interact: { key: 'VO + Shift + \u2193', description: 'Interact (enter group)' },
  stopInteract: { key: 'VO + Shift + \u2191', description: 'Stop interacting (exit group)' },
  activate: { key: 'VO + Space', description: 'Activate/click' },
  nextHeading: { key: 'VO + Cmd + H', description: 'Next heading' },
  previousHeading: { key: 'VO + Cmd + Shift + H', description: 'Previous heading' },
  nextLink: { key: 'VO + Cmd + L', description: 'Next link' },
  previousLink: { key: 'VO + Cmd + Shift + L', description: 'Previous link' },
  openRotor: { key: 'VO + U', description: 'Open rotor' },
  toggleQuickNav: { key: 'VO + Q', description: 'Toggle Quick Nav' },
  nextFormControl: { key: 'VO + Cmd + J', description: 'Next form control' },
  previousFormControl: { key: 'VO + Cmd + Shift + J', description: 'Previous form control' },
  rotorNextCategory: { key: '\u2192', description: 'Next rotor category' },
  rotorPrevCategory: { key: '\u2190', description: 'Previous rotor category' },
  rotorNextItem: { key: '\u2193', description: 'Next rotor item' },
  rotorPrevItem: { key: '\u2191', description: 'Previous rotor item' },
  rotorSelect: { key: 'Enter', description: 'Select rotor item' },
  rotorClose: { key: 'Escape', description: 'Close rotor' },
  // NVDA/Orca specific - not used in VoiceOver but needed for type completeness
  toggleBrowseMode: { key: 'VO + Q', description: 'Toggle Quick Nav' },
  openElementsList: { key: 'VO + U', description: 'Open rotor' },
  elementsListNextCategory: { key: '\u2192', description: 'Next category' },
  elementsListPrevCategory: { key: '\u2190', description: 'Previous category' },
  elementsListNextItem: { key: '\u2193', description: 'Next item' },
  elementsListPrevItem: { key: '\u2191', description: 'Previous item' },
  elementsListSelect: { key: 'Enter', description: 'Select item' },
  elementsListClose: { key: 'Escape', description: 'Close' },
};

function parseVOCommand(event: KeyboardEvent): SRCommand | null {
  if (!event.ctrlKey || !event.altKey) return null;

  let commandKey = 'vo';
  if (event.shiftKey) commandKey += '+shift';
  if (event.metaKey) commandKey += '+cmd';

  const key = event.key.toLowerCase();
  commandKey += `+${key}`;

  return VO_COMMANDS[commandKey] || null;
}

function parseQuickNavCommand(event: KeyboardEvent): SRCommand | null {
  const key = event.key.toLowerCase();
  let commandKey = KEY_CODES[event.code] || key;

  if (event.shiftKey) {
    commandKey = `shift+${commandKey}`;
  }

  return QUICK_NAV_COMMANDS[commandKey] || null;
}

function parseRotorCommand(event: KeyboardEvent): SRCommand | null {
  const key = KEY_CODES[event.code] || event.key.toLowerCase();
  return ROTOR_COMMANDS[key] || null;
}

export const voiceoverAdapter: ScreenReaderAdapter = {
  type: 'voiceover',
  name: 'VoiceOver',
  modifierName: 'VO',
  modifierDisplay: 'Ctrl+Option',
  platform: 'macOS',

  commands: VO_COMMANDS,
  quickNavCommands: QUICK_NAV_COMMANDS,
  modalCommands: ROTOR_COMMANDS,

  commandInfo: COMMAND_INFO,

  features: {
    hasRotor: true,
    hasElementsList: false,
    hasBrowseMode: false,
    hasQuickNav: true,
  },

  parseCommand(event: KeyboardEvent, state: SRState): SRCommand | null {
    // Handle rotor commands when rotor is open
    if (state.rotorOpen) {
      return parseRotorCommand(event);
    }

    // Handle Quick Nav commands when enabled
    if (state.quickNavEnabled && !event.ctrlKey && !event.altKey && !event.metaKey) {
      return parseQuickNavCommand(event);
    }

    // Handle standard VO commands
    return parseVOCommand(event);
  },

  transformHint(hint: string): string {
    // VoiceOver hints are the default, no transformation needed
    return hint;
  },
};
