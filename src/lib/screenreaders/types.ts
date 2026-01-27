// Screen reader commands (superset of all screen reader commands)
export type SRCommand =
  // Navigation commands (shared)
  | 'moveNext'
  | 'movePrevious'
  | 'moveDown'
  | 'moveUp'
  | 'readAll'
  | 'readFromBeginning'
  | 'interact'
  | 'stopInteract'
  | 'activate'
  | 'nextHeading'
  | 'previousHeading'
  | 'nextLink'
  | 'previousLink'
  | 'nextFormControl'
  | 'previousFormControl'
  // VoiceOver Quick Nav
  | 'toggleQuickNav'
  // VoiceOver Rotor
  | 'openRotor'
  | 'rotorNextCategory'
  | 'rotorPrevCategory'
  | 'rotorNextItem'
  | 'rotorPrevItem'
  | 'rotorSelect'
  | 'rotorClose'
  // NVDA/Orca Browse Mode
  | 'toggleBrowseMode'
  // NVDA/Orca Elements List
  | 'openElementsList'
  | 'elementsListNextCategory'
  | 'elementsListPrevCategory'
  | 'elementsListNextItem'
  | 'elementsListPrevItem'
  | 'elementsListSelect'
  | 'elementsListClose';

// Screen reader types
export type ScreenReaderType = 'voiceover' | 'nvda' | 'orca';

// State passed to parseCommand for context
export interface SRState {
  quickNavEnabled: boolean;
  browseMode: boolean;
  rotorOpen: boolean;
  elementsListOpen: boolean;
}

// Screen reader adapter interface
export interface ScreenReaderAdapter {
  type: ScreenReaderType;
  name: string;                    // "VoiceOver", "NVDA", "Orca"
  modifierName: string;            // "VO", "NVDA", "Orca"
  modifierDisplay: string;         // "Ctrl+Option", "Insert", etc.
  platform: string;                // "macOS", "Windows", "Linux"

  // Main commands with modifier (e.g., VO+key, Insert+key)
  commands: Record<string, SRCommand>;

  // VoiceOver Quick Nav (single keys when enabled)
  quickNavCommands?: Record<string, SRCommand>;

  // NVDA/Orca Browse Mode commands (single keys in browse mode)
  browseCommands?: Record<string, SRCommand>;

  // Modal commands (Rotor or Elements List navigation)
  modalCommands: Record<string, SRCommand>;

  // Command display info for UI
  commandInfo: Record<SRCommand, { key: string; description: string }>;

  // Features supported by this screen reader
  features: {
    hasRotor: boolean;         // VoiceOver
    hasElementsList: boolean;  // NVDA/Orca
    hasBrowseMode: boolean;    // NVDA/Orca
    hasQuickNav: boolean;      // VoiceOver
  };

  // Parse keyboard event to command
  parseCommand(event: KeyboardEvent, state: SRState): SRCommand | null;

  // Transform VoiceOver-style hints to this reader's terminology
  transformHint(hint: string): string;
}

// Command info for UI display
export interface SRCommandInfo {
  command: SRCommand;
  key: string;
  description: string;
}
