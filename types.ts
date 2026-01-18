export enum GamePhase {
  MENU,
  LOADING,
  PLAYING,
  INTERROGATING,
  DEDUCING,
  SOLVED,
  FAILED,
  TIMEOUT,
}

export enum GameMode {
  DETECTIVE = 'DETECTIVE', // Player plays detective
  VICTIM = 'VICTIM',       // AI plays detective, player watches
  KILLER = 'KILLER',       // Player is the killer, AI is the detective
}

export enum Difficulty {
  EASY = 'ROOKIE',
  NORMAL = 'DETECTIVE',
  HARD = 'NOIR',
}

export enum Language {
  ENGLISH = 'English',
  ARABIC = 'Arabic',
  DUTCH = 'Dutch',
}

export interface Suspect {
  id: string;
  name: string;
  role: string;
  bio: string;
  isKiller: boolean;
  secret: string;
  visualDescription: string;
  portraitUrl?: string; 
}

export interface Clue {
  id: string;
  name: string;
  description: string;
  visualDescription: string;
  detail: string;
  analysisTimeCost: number;
  relatedSuspectId?: string; // ID of the suspect this clue points to (optional)
}

export interface Scenario {
  title: string;
  introduction: string;
  location: string;
  locationVisualDescription: string;
  sceneImageUrl?: string;
  victimName: string;
  causeOfDeath: string;
  suspects: Suspect[];
  clues: Clue[];
  solutionExplanation: string;
  startingTime: string;
}

export interface ChatMessage {
  sender: 'Detective' | 'Suspect' | 'System';
  text: string;
}

export interface AutoDetectiveAction {
  type: 'INSPECT' | 'INTERROGATE' | 'ACCUSE' | 'THINK';
  targetId?: string;
  thought: string;
  question?: string; // If interrogating
}