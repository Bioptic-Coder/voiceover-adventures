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
} from '@/components';

export function App() {
  const {
    currentLevelId,
    levelState,
    announcement,
    rotorState,
    quickNavEnabled,
    levelComplete,
    showHelp,
    showSettings,
    handleElementsReady,
    replayLevel,
    nextLevel,
    setShowHelp,
    setShowSettings,
    dismissLevelComplete,
    totalLevels,
  } = useGame();

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

      <Rotor state={rotorState} />

      <QuickNavIndicator enabled={quickNavEnabled} />

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

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
