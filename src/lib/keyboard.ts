import type { VOCommand, CommandInfo } from '@/types';

type CommandHandler = (command: VOCommand, event: KeyboardEvent) => void;

let onCommand: CommandHandler | null = null;
let quickNavEnabled = false;
let rotorOpen = false;

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
const VO_COMMANDS: Record<string, VOCommand> = {
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
const QUICK_NAV_COMMANDS: Record<string, VOCommand> = {
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
const ROTOR_COMMANDS: Record<string, VOCommand> = {
  right: 'rotorNextCategory',
  left: 'rotorPrevCategory',
  down: 'rotorNextItem',
  up: 'rotorPrevItem',
  enter: 'rotorSelect',
  escape: 'rotorClose',
};

// Command display info
const COMMAND_INFO: Record<VOCommand, { key: string; description: string }> = {
  moveNext: { key: 'VO + →', description: 'Move to next item' },
  movePrevious: { key: 'VO + ←', description: 'Move to previous item' },
  moveDown: { key: 'VO + ↓', description: 'Move down' },
  moveUp: { key: 'VO + ↑', description: 'Move up' },
  readAll: { key: 'VO + A', description: 'Read all from current position' },
  readFromBeginning: { key: 'VO + B', description: 'Read from beginning' },
  interact: { key: 'VO + Shift + ↓', description: 'Interact (enter group)' },
  stopInteract: { key: 'VO + Shift + ↑', description: 'Stop interacting (exit group)' },
  activate: { key: 'VO + Space', description: 'Activate/click' },
  nextHeading: { key: 'VO + Cmd + H', description: 'Next heading' },
  previousHeading: { key: 'VO + Cmd + Shift + H', description: 'Previous heading' },
  nextLink: { key: 'VO + Cmd + L', description: 'Next link' },
  previousLink: { key: 'VO + Cmd + Shift + L', description: 'Previous link' },
  openRotor: { key: 'VO + U', description: 'Open rotor' },
  toggleQuickNav: { key: 'VO + Q', description: 'Toggle Quick Nav' },
  nextFormControl: { key: 'VO + Cmd + J', description: 'Next form control' },
  previousFormControl: { key: 'VO + Cmd + Shift + J', description: 'Previous form control' },
  rotorNextCategory: { key: '→', description: 'Next rotor category' },
  rotorPrevCategory: { key: '←', description: 'Previous rotor category' },
  rotorNextItem: { key: '↓', description: 'Next rotor item' },
  rotorPrevItem: { key: '↑', description: 'Previous rotor item' },
  rotorSelect: { key: 'Enter', description: 'Select rotor item' },
  rotorClose: { key: 'Escape', description: 'Close rotor' },
};

function parseVOCommand(event: KeyboardEvent): VOCommand | null {
  if (!event.ctrlKey || !event.altKey) return null;

  let commandKey = 'vo';
  if (event.shiftKey) commandKey += '+shift';
  if (event.metaKey) commandKey += '+cmd';

  const key = event.key.toLowerCase();
  commandKey += `+${key}`;

  return VO_COMMANDS[commandKey] || null;
}

function parseQuickNavCommand(event: KeyboardEvent): VOCommand | null {
  const key = event.key.toLowerCase();
  let commandKey = KEY_CODES[event.code] || key;

  if (event.shiftKey) {
    commandKey = `shift+${commandKey}`;
  }

  return QUICK_NAV_COMMANDS[commandKey] || null;
}

function parseRotorCommand(event: KeyboardEvent): VOCommand | null {
  const key = KEY_CODES[event.code] || event.key.toLowerCase();
  return ROTOR_COMMANDS[key] || null;
}

function parseCommand(event: KeyboardEvent): VOCommand | null {
  if (rotorOpen) {
    return parseRotorCommand(event);
  }

  if (quickNavEnabled && !event.ctrlKey && !event.altKey && !event.metaKey) {
    return parseQuickNavCommand(event);
  }

  return parseVOCommand(event);
}

function handleKeyDown(event: KeyboardEvent): void {
  const command = parseCommand(event);

  if (command) {
    event.preventDefault();
    event.stopPropagation();
    onCommand?.(command, event);
  }
}

function preventDefaults(event: KeyboardEvent): void {
  // Prevent defaults when VO modifiers are pressed
  if (event.ctrlKey && event.altKey) {
    event.preventDefault();
  }

  // Prevent defaults in Quick Nav mode
  if (quickNavEnabled && !event.ctrlKey && !event.altKey && !event.metaKey) {
    const key = event.key.toLowerCase();
    if (QUICK_NAV_COMMANDS[key] || QUICK_NAV_COMMANDS[`shift+${key}`] || KEY_CODES[event.code]) {
      event.preventDefault();
    }
  }

  // Prevent defaults when rotor is open
  if (rotorOpen) {
    event.preventDefault();
  }
}

export function init(callback: CommandHandler): void {
  onCommand = callback;
  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('keydown', preventDefaults, false);
}

export function destroy(): void {
  document.removeEventListener('keydown', handleKeyDown, true);
  document.removeEventListener('keydown', preventDefaults, false);
  onCommand = null;
}

export function setQuickNav(enabled: boolean): void {
  quickNavEnabled = enabled;
}

export function isQuickNavEnabled(): boolean {
  return quickNavEnabled;
}

export function setRotorOpen(open: boolean): void {
  rotorOpen = open;
}

export function isRotorOpen(): boolean {
  return rotorOpen;
}

export function getCommandInfo(command: VOCommand): CommandInfo {
  const info = COMMAND_INFO[command];
  return {
    command,
    key: info?.key || command,
    description: info?.description || command,
  };
}

export function getCommandKey(command: VOCommand): string {
  return COMMAND_INFO[command]?.key || command;
}

export function getCommandDescription(command: VOCommand): string {
  const info = COMMAND_INFO[command];
  return info ? `${info.key} : ${info.description}` : command;
}
