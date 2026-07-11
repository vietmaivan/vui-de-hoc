export type ShapeType = 'square' | 'rectangle' | 'unknown';

export interface Question {
  question: string;
  answers: string[];
  correct: number;
  shapeType: ShapeType;
  side?: number;       // For square
  width?: number;      // For rectangle length
  height?: number;     // For rectangle width
  unit?: string;       // m, cm, dm, etc.
}

export type AnswerStatus = 'idle' | 'correct' | 'incorrect' | 'timeout';

export interface TeamState {
  score: number;
  currentStreak: number;
  answeredStatus: AnswerStatus;
  selectedAnswerIndex: number | null;
  progress: number; // 0 to 100
  isSparkling: boolean; // For 🔥 Speed Up / Tăng tốc
}

export type GameState = 'menu' | 'countdown' | 'playing' | 'ended';

export interface GameSummary {
  blueScore: number;
  redScore: number;
  blueCorrect: number;
  blueIncorrect: number;
  redCorrect: number;
  redIncorrect: number;
  durationSeconds: number;
  winner: 'blue' | 'red' | 'draw';
}
