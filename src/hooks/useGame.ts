import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import type { LevelDef, LevelState, RotorState, VOCommand, LevelCompleteData, ElementsListState, ScreenReaderType } from '@/types';
import { TOTAL_LEVELS, getLevel } from '@/data/levels';
import * as storage from '@/lib/storage';
import * as speech from '@/lib/speech';
import * as keyboard from '@/lib/keyboard';
import * as navigation from '@/lib/navigation';
import { setScreenReader, getAdapter } from '@/lib/screenreaders';

interface GameHookState {
  currentLevelId: number;
  levelState: LevelState | null;
  announcement: string;
  rotorState: RotorState;
  elementsListState: ElementsListState;
  quickNavEnabled: boolean;
  browseMode: boolean;
  screenReader: ScreenReaderType;
  levelComplete: LevelCompleteData | null;
  showHelp: boolean;
  showSettings: boolean;
}

export function useGame() {
  const settings = storage.getSettings();
  const [state, setState] = useState<GameHookState>({
    currentLevelId: storage.getCurrentLevel(),
    levelState: null,
    announcement: 'Press any key to start',
    rotorState: { open: false },
    elementsListState: { open: false },
    quickNavEnabled: false,
    browseMode: settings.screenReader !== 'voiceover', // NVDA/Orca default to browse mode on
    screenReader: settings.screenReader,
    levelComplete: null,
    showHelp: false,
    showSettings: false,
  });

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<HTMLElement[]>([]);

  // Initialize game
  useEffect(() => {
    // Initialize screen reader from saved settings
    const savedSettings = storage.getSettings();
    setScreenReader(savedSettings.screenReader);
    keyboard.setBrowseMode(savedSettings.screenReader !== 'voiceover');

    speech.init((text) => {
      setState((s) => ({ ...s, announcement: text }));
    });

    navigation.init({
      onCursorMove: handleCursorMove,
      onActivate: handleActivate,
      onRotorChange: handleRotorChange,
    });

    keyboard.init(handleCommand);

    // Load initial level
    loadLevel(state.currentLevelId);

    // Welcome message based on screen reader
    setTimeout(() => {
      const adapter = getAdapter();
      const welcomeMsg = adapter.type === 'voiceover'
        ? 'Welcome to VoiceOver Adventures. Press Control Option Right Arrow to begin.'
        : `Welcome to Screen Reader Adventures. Press ${adapter.modifierDisplay} Right Arrow to begin, or use arrow keys in Browse Mode.`;
      speech.speak(welcomeMsg);
    }, 500);

    return () => {
      keyboard.destroy();
    };
  }, []);

  const loadLevel = useCallback((levelId: number) => {
    const levelDef = getLevel(levelId);
    if (!levelDef) return;

    navigation.reset();
    keyboard.setQuickNav(false);
    keyboard.setRotorOpen(false);
    keyboard.setElementsListOpen(false);

    setState((s) => {
      // NVDA/Orca default to browse mode on, VoiceOver defaults to off
      const defaultBrowseMode = s.screenReader !== 'voiceover';
      keyboard.setBrowseMode(defaultBrowseMode);

      return {
        ...s,
        currentLevelId: levelId,
        levelState: {
          id: levelId,
          def: levelDef,
          moveCount: 0,
          startTime: Date.now(),
          completed: false,
        },
        levelComplete: null,
        quickNavEnabled: false,
        browseMode: defaultBrowseMode,
        rotorState: { open: false },
        elementsListState: { open: false },
      };
    });

    // Announce level after render
    setTimeout(() => {
      speech.speak(`Level ${levelId}: ${levelDef.title}. ${levelDef.objective}`);
    }, 300);
  }, []);

  const handleElementsReady = useCallback((elements: HTMLElement[]) => {
    elementsRef.current = elements;
    navigation.setElements(elements);

    // Focus start element
    const startElement = elements.find((el) => el.classList.contains('start'));
    if (startElement) {
      navigation.moveTo(startElement);
    }
  }, []);

  const handleCommand = useCallback((command: VOCommand) => {
    setState((s) => {
      if (!s.levelState || s.levelState.completed) return s;

      // Check if command is allowed
      const allowedCommands = s.levelState.def.commands;
      if (!isCommandAllowed(command, allowedCommands)) {
        speech.speak('Command not available in this level');
        return s;
      }

      // Execute command
      const result = navigation.handleCommand(command);

      if (result && isMoveCommand(command)) {
        return {
          ...s,
          levelState: {
            ...s.levelState,
            moveCount: s.levelState.moveCount + 1,
          },
          quickNavEnabled: command === 'toggleQuickNav' ? !s.quickNavEnabled : s.quickNavEnabled,
        };
      }

      // Handle Quick Nav toggle (VoiceOver)
      if (command === 'toggleQuickNav') {
        return { ...s, quickNavEnabled: !s.quickNavEnabled };
      }

      // Handle Browse Mode toggle (NVDA/Orca)
      if (command === 'toggleBrowseMode') {
        const newBrowseMode = !s.browseMode;
        keyboard.setBrowseMode(newBrowseMode);
        return { ...s, browseMode: newBrowseMode };
      }

      return s;
    });
  }, []);

  const handleCursorMove = useCallback((element: HTMLElement) => {
    setState((s) => {
      if (!s.levelState || s.levelState.completed) return s;

      const won = checkWinCondition(s.levelState.def, element, 'move');
      if (won) {
        return completeLevel(s);
      }
      return s;
    });
  }, []);

  const handleActivate = useCallback((element: HTMLElement) => {
    setState((s) => {
      if (!s.levelState || s.levelState.completed) return s;

      const newState = {
        ...s,
        levelState: {
          ...s.levelState,
          moveCount: s.levelState.moveCount + 1,
        },
      };

      const won = checkWinCondition(s.levelState.def, element, 'activate');
      if (won) {
        return completeLevel(newState);
      }
      return newState;
    });
  }, []);

  const handleRotorChange = useCallback((rotorState: RotorState) => {
    setState((s) => {
      const adapter = getAdapter();
      // For NVDA/Orca, also update elementsListState
      if (adapter.features.hasElementsList) {
        keyboard.setElementsListOpen(rotorState.open);
        return {
          ...s,
          rotorState,
          elementsListState: {
            open: rotorState.open,
            category: rotorState.category,
            items: rotorState.items,
            selectedIndex: rotorState.selectedIndex,
          },
        };
      }
      keyboard.setRotorOpen(rotorState.open);
      return { ...s, rotorState };
    });
  }, []);

  const handleScreenReaderChange = useCallback((type: ScreenReaderType) => {
    setScreenReader(type);
    const defaultBrowseMode = type !== 'voiceover';
    keyboard.setBrowseMode(defaultBrowseMode);
    keyboard.setQuickNav(false);
    keyboard.setRotorOpen(false);
    keyboard.setElementsListOpen(false);

    setState((s) => ({
      ...s,
      screenReader: type,
      browseMode: defaultBrowseMode,
      quickNavEnabled: false,
      rotorState: { open: false },
      elementsListState: { open: false },
    }));
  }, []);

  const completeLevel = (s: GameHookState): GameHookState => {
    if (!s.levelState) return s;

    const endTime = Date.now();
    const timeElapsed = endTime - s.levelState.startTime;
    const moves = s.levelState.moveCount;
    const stars = calculateStars(s.levelState.def, moves);

    const progress = storage.saveLevelProgress(s.levelState.id, {
      completed: true,
      stars,
      moves,
      time: timeElapsed,
    });

    speech.announceAction('level-complete');

    return {
      ...s,
      levelState: {
        ...s.levelState,
        completed: true,
        endTime,
      },
      levelComplete: {
        levelId: s.levelState.id,
        moves,
        time: timeElapsed,
        stars,
        bestMoves: progress.bestMoves,
        bestTime: progress.bestTime,
      },
    };
  };

  const replayLevel = useCallback(() => {
    loadLevel(state.currentLevelId);
  }, [state.currentLevelId, loadLevel]);

  const nextLevel = useCallback(() => {
    if (state.currentLevelId < TOTAL_LEVELS) {
      loadLevel(state.currentLevelId + 1);
    }
  }, [state.currentLevelId, loadLevel]);

  const setShowHelp = useCallback((show: boolean) => {
    setState((s) => ({ ...s, showHelp: show }));
  }, []);

  const setShowSettings = useCallback((show: boolean) => {
    setState((s) => ({ ...s, showSettings: show }));
  }, []);

  const dismissLevelComplete = useCallback(() => {
    setState((s) => ({ ...s, levelComplete: null }));
  }, []);

  return {
    ...state,
    gameAreaRef,
    loadLevel,
    handleElementsReady,
    handleScreenReaderChange,
    replayLevel,
    nextLevel,
    setShowHelp,
    setShowSettings,
    dismissLevelComplete,
    totalLevels: TOTAL_LEVELS,
  };
}

function isCommandAllowed(command: VOCommand, allowedCommands: VOCommand[]): boolean {
  const alwaysAllowed: VOCommand[] = ['moveNext', 'movePrevious'];
  if (alwaysAllowed.includes(command)) return true;

  const commandMap: Record<string, VOCommand> = {
    moveDown: 'moveDown',
    moveUp: 'moveUp',
    readAll: 'readAll',
    readFromBeginning: 'readFromBeginning',
    interact: 'interact',
    stopInteract: 'stopInteract',
    activate: 'activate',
    nextHeading: 'nextHeading',
    previousHeading: 'previousHeading',
    nextLink: 'nextLink',
    previousLink: 'previousLink',
    openRotor: 'openRotor',
    rotorNextCategory: 'openRotor',
    rotorPrevCategory: 'openRotor',
    rotorNextItem: 'openRotor',
    rotorPrevItem: 'openRotor',
    rotorSelect: 'openRotor',
    rotorClose: 'openRotor',
    toggleQuickNav: 'toggleQuickNav',
    nextFormControl: 'nextFormControl',
    previousFormControl: 'previousFormControl',
    // NVDA/Orca equivalents
    toggleBrowseMode: 'toggleQuickNav', // Maps to toggleQuickNav permission
    openElementsList: 'openRotor', // Maps to openRotor permission
    elementsListNextCategory: 'openRotor',
    elementsListPrevCategory: 'openRotor',
    elementsListNextItem: 'openRotor',
    elementsListPrevItem: 'openRotor',
    elementsListSelect: 'openRotor',
    elementsListClose: 'openRotor',
  };

  const requiredCommand = commandMap[command];
  return !requiredCommand || allowedCommands.includes(requiredCommand);
}

function isMoveCommand(command: VOCommand): boolean {
  const moveCommands: VOCommand[] = [
    'moveNext',
    'movePrevious',
    'moveDown',
    'moveUp',
    'nextHeading',
    'previousHeading',
    'nextLink',
    'previousLink',
    'nextFormControl',
    'previousFormControl',
    'interact',
    'stopInteract',
    'rotorSelect',
    'elementsListSelect', // NVDA/Orca equivalent
  ];
  return moveCommands.includes(command);
}

function checkWinCondition(levelDef: LevelDef, element: HTMLElement, action: string): boolean {
  const condition = levelDef.winCondition;

  switch (condition.type) {
    case 'reach':
      return element.getAttribute('data-id') === condition.target;

    case 'activate':
      return action === 'activate' && element.getAttribute('data-id') === condition.target;

    case 'reachCell':
      if (condition.cell) {
        const expectedId = `${condition.target}-${condition.cell[0]}-${condition.cell[1]}`;
        return element.getAttribute('data-id') === expectedId;
      }
      return false;

    default:
      return false;
  }
}

function calculateStars(levelDef: LevelDef, moves: number): number {
  const thresholds = levelDef.starThresholds.moves;

  if (moves <= thresholds[2]) return 5;
  if (moves <= thresholds[1]) return 4;
  if (moves <= thresholds[0]) return 3;
  if (moves <= thresholds[0] * 1.5) return 2;
  return 1;
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
