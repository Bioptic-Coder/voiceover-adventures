// Element types in the game
export type ElementType =
  | 'button'
  | 'link'
  | 'heading'
  | 'text'
  | 'input'
  | 'checkbox'
  | 'group'
  | 'table'
  | 'list'
  | 'listitem'
  | 'cell'
  | 'image'
  | 'menu';

// VoiceOver commands
export type VOCommand =
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
  | 'openRotor'
  | 'toggleQuickNav'
  | 'rotorNextCategory'
  | 'rotorPrevCategory'
  | 'rotorNextItem'
  | 'rotorPrevItem'
  | 'rotorSelect'
  | 'rotorClose';

// Rotor categories
export type RotorCategory = 'Headings' | 'Links' | 'Form Controls' | 'Tables' | 'Lists';

// Game element definition (from level data)
export interface GameElementDef {
  id: string;
  type: ElementType;
  label: string;
  isStart?: boolean;
  isGoal?: boolean;
  children?: GameElementDef[];
  rows?: string[][];
  goalCell?: [number, number];
}

// Win condition types
export type WinConditionType = 'reach' | 'activate' | 'reachCell';

export interface WinCondition {
  type: WinConditionType;
  target: string;
  cell?: [number, number];
}

// Star thresholds
export interface StarThresholds {
  moves: [number, number, number]; // 1 star, 2 stars, 3 stars thresholds
}

// Level layout types
export type LevelLayout = 'linear' | 'grid' | 'document' | 'nested' | 'complex' | 'table' | 'form';

// Level definition
export interface LevelDef {
  id: number;
  title: string;
  description: string;
  objective: string;
  commands: VOCommand[];
  layout: LevelLayout;
  gridColumns?: number;
  elements: GameElementDef[];
  winCondition: WinCondition;
  starThresholds: StarThresholds;
  hints: string[];
}

// Level progress stored in localStorage
export interface LevelProgress {
  completed: boolean;
  stars: number;
  bestMoves: number | null;
  bestTime: number | null;
  attempts: number;
}

// Game settings
export interface GameSettings {
  speechEnabled: boolean;
  speechRate: number;
  highContrast: boolean;
  volume: number;
}

// Game stats
export interface GameStats {
  totalMoves: number;
  totalTime: number;
  levelsCompleted: number;
}

// Stored game data
export interface StoredData {
  version: number;
  currentLevel: number;
  levels: Record<number, LevelProgress>;
  settings: GameSettings;
  stats: GameStats;
  achievements: string[];
}

// Runtime level state
export interface LevelState {
  id: number;
  def: LevelDef;
  moveCount: number;
  startTime: number;
  endTime?: number;
  completed: boolean;
}

// Game state
export interface GameState {
  running: boolean;
  paused: boolean;
  currentLevelId: number;
  level: LevelState | null;
}

// Rotor item
export interface RotorItem {
  element: HTMLElement;
  label: string;
  type: ElementType;
}

// Rotor state
export interface RotorState {
  open: boolean;
  category?: RotorCategory;
  items?: RotorItem[];
  selectedIndex?: number;
}

// Level complete data
export interface LevelCompleteData {
  levelId: number;
  moves: number;
  time: number;
  stars: number;
  bestMoves: number | null;
  bestTime: number | null;
}

// Command descriptions for UI
export interface CommandInfo {
  command: VOCommand;
  key: string;
  description: string;
}

// Speech announcement options
export interface SpeakOptions {
  interrupt?: boolean;
  rate?: number;
  volume?: number;
  pitch?: number;
  immediate?: boolean;
}
