import type { VOCommand, CommandInfo } from '@/types';
import { getAdapter, getCommandInfo as getAdapterCommandInfo } from './screenreaders';
import * as audio from './audio';
import type { SRState } from './screenreaders';
import { handleNVDAKeyUp } from './screenreaders/nvda';
import { handleOrcaKeyUp } from './screenreaders/orca';

type CommandHandler = (command: VOCommand, event: KeyboardEvent) => void;

let onCommand: CommandHandler | null = null;
let quickNavEnabled = false;
let browseMode = true; // NVDA/Orca default to browse mode on
let rotorOpen = false;
let elementsListOpen = false;

function getState(): SRState {
  return {
    quickNavEnabled,
    browseMode,
    rotorOpen,
    elementsListOpen,
  };
}

function parseCommand(event: KeyboardEvent): VOCommand | null {
  const adapter = getAdapter();
  return adapter.parseCommand(event, getState());
}

function handleKeyDown(event: KeyboardEvent): void {
  const command = parseCommand(event);

  if (command) {
    event.preventDefault();
    event.stopPropagation();
    onCommand?.(command, event);
  } else if (event.ctrlKey && event.altKey) {
    // If VO modifiers are held but command is invalid, play bonk
    audio.playBoundary();
  }
}

function handleKeyUp(event: KeyboardEvent): void {
  const adapter = getAdapter();

  // Handle modifier key releases for NVDA/Orca
  if (adapter.type === 'nvda') {
    handleNVDAKeyUp(event);
  } else if (adapter.type === 'orca') {
    handleOrcaKeyUp(event);
  }
}

function preventDefaults(event: KeyboardEvent): void {
  const adapter = getAdapter();

  // Prevent defaults when VoiceOver modifiers are pressed
  if (adapter.type === 'voiceover' && event.ctrlKey && event.altKey) {
    event.preventDefault();
  }

  // Prevent defaults in Quick Nav mode (VoiceOver)
  if (adapter.features.hasQuickNav && quickNavEnabled && !event.ctrlKey && !event.altKey && !event.metaKey) {
    const key = event.key.toLowerCase();
    if (adapter.quickNavCommands && (adapter.quickNavCommands[key] || adapter.quickNavCommands[`shift+${key}`])) {
      event.preventDefault();
    }
  }

  // Prevent defaults in Browse Mode (NVDA/Orca)
  if (adapter.features.hasBrowseMode && browseMode && !event.ctrlKey && !event.altKey && !event.metaKey) {
    const key = event.key.toLowerCase();
    if (adapter.browseCommands && (adapter.browseCommands[key] || adapter.browseCommands[`shift+${key}`])) {
      event.preventDefault();
    }
  }

  // Prevent defaults when rotor/elements list is open
  if (rotorOpen || elementsListOpen) {
    event.preventDefault();
  }
}

export function init(callback: CommandHandler): void {
  onCommand = callback;
  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('keydown', preventDefaults, false);
  document.addEventListener('keyup', handleKeyUp, true);
}

export function destroy(): void {
  document.removeEventListener('keydown', handleKeyDown, true);
  document.removeEventListener('keydown', preventDefaults, false);
  document.removeEventListener('keyup', handleKeyUp, true);
  onCommand = null;
}

export function setQuickNav(enabled: boolean): void {
  quickNavEnabled = enabled;
}

export function isQuickNavEnabled(): boolean {
  return quickNavEnabled;
}

export function setBrowseMode(enabled: boolean): void {
  browseMode = enabled;
}

export function isBrowseModeEnabled(): boolean {
  return browseMode;
}

export function setRotorOpen(open: boolean): void {
  rotorOpen = open;
}

export function isRotorOpen(): boolean {
  return rotorOpen;
}

export function setElementsListOpen(open: boolean): void {
  elementsListOpen = open;
}

export function isElementsListOpen(): boolean {
  return elementsListOpen;
}

export function getCommandInfo(command: VOCommand): CommandInfo {
  const info = getAdapterCommandInfo(command);
  return {
    command,
    key: info.key,
    description: info.description,
  };
}

export function getCommandKey(command: VOCommand): string {
  return getAdapterCommandInfo(command).key;
}

export function getCommandDescription(command: VOCommand): string {
  const info = getAdapterCommandInfo(command);
  return `${info.key} : ${info.description}`;
}
