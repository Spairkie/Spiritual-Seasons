import type { SeasonId } from './common';
import type { QuizResults } from './quiz';

export interface UserRecord {
  quizResults: QuizResults | null;
  seasonId: SeasonId | null;
  startDate: string | null;
  currentDay: number;
}

export interface JournalEntry {
  day: number;
  content: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  season: SeasonId;
}

export interface DayProgress {
  day: number;
  completed: boolean;
  completedAt: string | null; // ISO 8601
  season: SeasonId;
}

export interface FavoriteEntry {
  day: number;
  season: SeasonId;
  scriptureRef: string;
  note: string;
  savedAt: string; // ISO 8601
}

export interface AudioNote {
  day: number;
  blob: Blob;
  mimeType: string;
  duration: number; // seconds
  createdAt: string; // ISO 8601
}

export interface WeeklyReflection {
  week: number;
  responses: string[];
  updatedAt: string; // ISO 8601
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // ISO date 'YYYY-MM-DD'
  milestones: number[]; // days earned: [7, 14, 30, ...]
}

export type DarkMode = 'system' | 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type LineSpacing = 'compact' | 'normal' | 'relaxed' | 'loose';
export type BibleTranslation = 'NLT' | 'NIV' | 'KJV' | 'NKJV' | 'ESV' | 'NASB' | 'MSG';
export type SeasonTheme = 'auto' | SeasonId;

export interface AppSettings {
  darkMode: DarkMode;
  fontSize: FontSize;
  lineSpacing: LineSpacing;
  bibleTranslation: BibleTranslation;
  seasonTheme: SeasonTheme;
  autoSave: boolean;
  ttsRate: number; // 0.5–2.0
  notificationsEnabled: boolean;
  notificationTime: string; // 'HH:MM'
}

export const DEFAULT_SETTINGS: AppSettings = {
  darkMode: 'system',
  fontSize: 'medium',
  lineSpacing: 'normal',
  bibleTranslation: 'NLT',
  seasonTheme: 'auto',
  autoSave: true,
  ttsRate: 1.0,
  notificationsEnabled: false,
  notificationTime: '07:00',
};
