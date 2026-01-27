import type { ScreenReaderAdapter, ScreenReaderType, SRCommand, SRCommandInfo } from './types';
import { voiceoverAdapter } from './voiceover';
import { nvdaAdapter } from './nvda';
import { orcaAdapter } from './orca';

export type { ScreenReaderAdapter, ScreenReaderType, SRCommand, SRCommandInfo, SRState } from './types';

// Registry of all adapters
const adapters: Record<ScreenReaderType, ScreenReaderAdapter> = {
  voiceover: voiceoverAdapter,
  nvda: nvdaAdapter,
  orca: orcaAdapter,
};

// Current active adapter
let currentAdapter: ScreenReaderAdapter = voiceoverAdapter;

// Change listener
type ChangeListener = (adapter: ScreenReaderAdapter) => void;
let changeListener: ChangeListener | null = null;

/**
 * Set the active screen reader adapter
 */
export function setScreenReader(type: ScreenReaderType): void {
  const adapter = adapters[type];
  if (adapter && adapter !== currentAdapter) {
    currentAdapter = adapter;
    changeListener?.(adapter);
  }
}

/**
 * Get the current active adapter
 */
export function getAdapter(): ScreenReaderAdapter {
  return currentAdapter;
}

/**
 * Get adapter by type
 */
export function getAdapterByType(type: ScreenReaderType): ScreenReaderAdapter {
  return adapters[type];
}

/**
 * Get all available adapters
 */
export function getAllAdapters(): ScreenReaderAdapter[] {
  return Object.values(adapters);
}

/**
 * Get all screen reader types
 */
export function getAllTypes(): ScreenReaderType[] {
  return Object.keys(adapters) as ScreenReaderType[];
}

/**
 * Set a listener for screen reader changes
 */
export function onScreenReaderChange(listener: ChangeListener | null): void {
  changeListener = listener;
}

/**
 * Get command info using the current adapter
 */
export function getCommandInfo(command: SRCommand): SRCommandInfo {
  const info = currentAdapter.commandInfo[command];
  return {
    command,
    key: info?.key || command,
    description: info?.description || command,
  };
}

/**
 * Get command key display string
 */
export function getCommandKey(command: SRCommand): string {
  return currentAdapter.commandInfo[command]?.key || command;
}

/**
 * Transform a hint for the current screen reader
 */
export function transformHint(hint: string): string {
  return currentAdapter.transformHint(hint);
}
