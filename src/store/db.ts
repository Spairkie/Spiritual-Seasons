import { openDB, type IDBPDatabase } from 'idb';
import type {
  UserRecord,
  JournalEntry,
  DayProgress,
  FavoriteEntry,
  AudioNote,
  WeeklyReflection,
  StreakData,
  AppSettings,
} from '../types';

// DB schema interface for idb — keys must match the actual IDB store names exactly
export interface SpiritualSeasonsDB {
  user: {
    key: string;
    value: UserRecord;
  };
  journal: {
    key: number;
    value: JournalEntry;
  };
  progress: {
    key: number;
    value: DayProgress;
  };
  favorites: {
    key: number;
    value: FavoriteEntry;
  };
  settings: {
    key: string;
    value: AppSettings[keyof AppSettings];
  };
  audioNotes: {
    key: number;
    value: AudioNote;
  };
  weeklyReflections: {
    key: number;
    value: WeeklyReflection;
  };
  streaks: {
    key: string;
    value: StreakData;
  };
}

const DB_NAME = 'spiritual-seasons-db';
const DB_VERSION = 1; // Must stay at 1 — existing user data depends on this

let dbPromise: Promise<IDBPDatabase<SpiritualSeasonsDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<SpiritualSeasonsDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SpiritualSeasonsDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // All stores must use exactly these names — they match the original app schema
        if (!db.objectStoreNames.contains('user')) {
          db.createObjectStore('user');
        }
        if (!db.objectStoreNames.contains('journal')) {
          db.createObjectStore('journal', { keyPath: 'day' });
        }
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'day' });
        }
        if (!db.objectStoreNames.contains('favorites')) {
          db.createObjectStore('favorites', { keyPath: 'day' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('audioNotes')) {
          db.createObjectStore('audioNotes', { keyPath: 'day' });
        }
        if (!db.objectStoreNames.contains('weeklyReflections')) {
          db.createObjectStore('weeklyReflections', { keyPath: 'week' });
        }
        if (!db.objectStoreNames.contains('streaks')) {
          db.createObjectStore('streaks');
        }
      },
    });
  }
  return dbPromise;
}

// Allows tests to reset the DB between test runs
export function resetDB(): void {
  dbPromise = null;
}
