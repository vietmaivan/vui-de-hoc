export type LevelId = 1 | 2 | 3;

export interface LevelProgress {
  id: LevelId;
  title: string;
  subtitle: string;
  status: "locked" | "unlocked" | "completed";
  score: number;
  maxScore: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}
