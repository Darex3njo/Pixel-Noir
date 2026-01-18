import { GameStats } from '../types';

const STATS_KEY = 'pixel_noir_stats_v1';

export const getStats = (): GameStats => {
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load stats", e);
  }
  
  return {
    casesSolved: 0,
    casesFailed: 0,
    totalPlaytimeMinutes: 0,
    rank: "Rookie"
  };
};

export const saveStats = (stats: GameStats) => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to save stats", e);
  }
};

export const updateStats = (isWin: boolean, minutesSpent: number): GameStats => {
  const current = getStats();
  
  if (isWin) current.casesSolved++;
  else current.casesFailed++;
  
  current.totalPlaytimeMinutes += minutesSpent;

  // Calculate Rank
  const score = (current.casesSolved * 100) - (current.casesFailed * 50);
  if (score < 0) current.rank = "Disgraced";
  else if (score < 200) current.rank = "Rookie";
  else if (score < 500) current.rank = "Private Eye";
  else if (score < 1000) current.rank = "Detective";
  else if (score < 2000) current.rank = "Inspector";
  else current.rank = "Chief of Police";

  saveStats(current);
  return current;
};
