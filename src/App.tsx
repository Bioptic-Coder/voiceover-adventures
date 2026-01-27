import { useGame } from '@/hooks/useGame';
import {
  Header,
  LevelBar,
  GameArea,
  AnnouncementBar,
  ObjectivePanel,
  HelpModal,
  SettingsModal,
  LevelCompleteModal,
  Rotor,
  QuickNavIndicator,
  BrowseModeIndicator,
  ElementsList,
} from '@/components';
import { getAdapter } from '@/lib/screenreaders';

export function App() {
  const {
    currentLevelId,
    levelState,
    announcement,
    rotorState,
    elementsListState,
    quickNavEnabled,
    browseMode,
    screenReader,
    levelComplete,
    showHelp,
    showSettings,
    handleElementsReady,
    handleScreenReaderChange,
    replayLevel,
    nextLevel,
    setShowHelp,
    setShowSettings,
    dismissLevelComplete,
    totalLevels,
  } = useGame();

  const adapter = getAdapter();

  if (!levelState) {
    return (
      <div id="app">
        <Header onSettingsClick={() => setShowSettings(true)} onHelpClick={() => setShowHelp(true)} />
        <div class="game-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="app">
      <Header
        onSettingsClick={() => setShowSettings(true)}
        onHelpClick={() => setShowHelp(true)}
      />

      <LevelBar level={levelState.def} />

      <GameArea level={levelState.def} onElementsReady={handleElementsReady} />

      <AnnouncementBar text={announcement} />

      <ObjectivePanel
        objective={levelState.def.objective}
        commands={levelState.def.commands}
      />

      {adapter.features.hasRotor && <Rotor state={rotorState} />}
      {adapter.features.hasElementsList && <ElementsList state={elementsListState} />}

      {adapter.features.hasQuickNav && <QuickNavIndicator enabled={quickNavEnabled} />}
      {adapter.features.hasBrowseMode && <BrowseModeIndicator enabled={browseMode} />}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} screenReader={screenReader} />}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onScreenReaderChange={handleScreenReaderChange}
        />
      )}

      {levelComplete && (
        <LevelCompleteModal
          data={levelComplete}
          hasNextLevel={currentLevelId < totalLevels}
          onReplay={() => {
            dismissLevelComplete();
            replayLevel();
          }}
          onNext={() => {
            dismissLevelComplete();
            nextLevel();
          }}
          onClose={dismissLevelComplete}
        />
      )}
    </div>
  );
}
