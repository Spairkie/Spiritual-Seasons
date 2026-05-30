import type { SeasonId } from './common';

export interface QuizQuestion {
  id: string;
  text: string;
}

export interface QuizSeason {
  id: SeasonId;
  title: string;
  shortTitle: string;
  description: string;
  questions: QuizQuestion[];
}

export interface QuizScale {
  min: 1;
  max: 5;
  labels: Record<string, string>;
}

export interface QuizRules {
  minScore: 4;
  maxScore: 20;
  winnerLogic: string;
  tieBehavior: string;
}

export interface QuizResult {
  title: string;
  message: string;
  encouragement: string;
}

export interface QuizData {
  title: string;
  description: string;
  instructions: string;
  scale: QuizScale;
  rules: QuizRules;
  seasons: QuizSeason[];
  results: Record<SeasonId, QuizResult>;
}

export interface QuizScores {
  winter: number;
  spring: number;
  summer: number;
  autumn: number;
}

export interface QuizResults {
  seasonId: SeasonId;
  scores: QuizScores;
  completedAt: string; // ISO 8601
}
