import type { StoredData, LevelProgress, GameSettings, GameStats } from '@/types';

const STORAGE_KEY = 'voiceover-adventures';

const defaultData: StoredData = {
  version: 1,
  currentLevel: 1,
  levels: {},
  settings: {
    speechEnabled: true,
    speechRate: 1.0,
    highContrast: false,
    volume: 1.0,
    screenReader: 'voiceover',
  },
  stats: {
    totalMoves: 0,
    totalTime: 0,
    levelsCompleted: 0,
  },
  achievements: [],
};

function mergeDeep(target: StoredData, source: Partial<StoredData>): StoredData {
  return {
    version: source.version ?? target.version,
    currentLevel: source.currentLevel ?? target.currentLevel,
    levels: { ...target.levels, ...source.levels },
    settings: { ...target.settings, ...source.settings },
    stats: { ...target.stats, ...source.stats },
    achievements: source.achievements ?? target.achievements,
  };
}

export function load(): StoredData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as Partial<StoredData>;
      return mergeDeep(defaultData, data);
    }
  } catch (e) {
    console.error('Failed to load storage:', e);
  }
  return { ...defaultData };
}

export function save(data: StoredData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed to save storage:', e);
    return false;
  }
}

export function getLevelProgress(levelId: number): LevelProgress {
  const data = load();
  return (
    data.levels[levelId] || {
      completed: false,
      stars: 0,
      bestMoves: null,
      bestTime: null,
      attempts: 0,
    }
  );
}

export function saveLevelProgress(
  levelId: number,
  progress: { completed?: boolean; stars?: number; moves?: number; time?: number }
): LevelProgress {
  const data = load();
  const existing = data.levels[levelId] || {
    completed: false,
    stars: 0,
    bestMoves: null,
    bestTime: null,
    attempts: 0,
  };

  data.levels[levelId] = {
    completed: progress.completed || existing.completed,
    stars: Math.max(progress.stars || 0, existing.stars),
    bestMoves:
      existing.bestMoves === null
        ? progress.moves ?? null
        : progress.moves !== undefined
          ? Math.min(progress.moves, existing.bestMoves)
          : existing.bestMoves,
    bestTime:
      existing.bestTime === null
        ? progress.time ?? null
        : progress.time !== undefined
          ? Math.min(progress.time, existing.bestTime)
          : existing.bestTime,
    attempts: existing.attempts + 1,
  };

  // Update current level if completed
  if (progress.completed && levelId >= data.currentLevel) {
    data.currentLevel = levelId + 1;
  }

  // Update stats
  data.stats.totalMoves += progress.moves || 0;
  data.stats.totalTime += progress.time || 0;
  if (progress.completed && !existing.completed) {
    data.stats.levelsCompleted++;
  }

  save(data);
  return data.levels[levelId];
}

export function getCurrentLevel(): number {
  return load().currentLevel;
}

export function setCurrentLevel(levelId: number): void {
  const data = load();
  data.currentLevel = levelId;
  save(data);
}

export function getSettings(): GameSettings {
  return load().settings;
}

export function saveSettings(settings: Partial<GameSettings>): GameSettings {
  const data = load();
  data.settings = { ...data.settings, ...settings };
  save(data);
  return data.settings;
}

export function getAllLevels(): Record<number, LevelProgress> {
  return load().levels;
}

export function getStats(): GameStats {
  return load().stats;
}

export function addAchievement(achievementId: string): boolean {
  const data = load();
  if (!data.achievements.includes(achievementId)) {
    data.achievements.push(achievementId);
    save(data);
    return true;
  }
  return false;
}

export function getAchievements(): string[] {
  return load().achievements;
}

export function reset(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Failed to reset storage:', e);
    return false;
  }
}

export function isLevelUnlocked(levelId: number): boolean {
  return levelId <= load().currentLevel;
}
