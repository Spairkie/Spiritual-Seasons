import { getDB } from './db';
import type { DayProgress, SeasonId } from '../types';

export async function getDayProgress(day: number): Promise<DayProgress | null> {
  const db = await getDB();
  return (await db.get('progress', day)) ?? null;
}

export async function markDayComplete(day: number, season: SeasonId): Promise<void> {
  const db = await getDB();
  await db.put('progress', {
    day,
    completed: true,
    completedAt: new Date().toISOString(),
    season,
  });
}

export async function markDayIncomplete(day: number, season: SeasonId): Promise<void> {
  const db = await getDB();
  await db.put('progress', {
    day,
    completed: false,
    completedAt: null,
    season,
  });
}

export async function getAllProgress(): Promise<DayProgress[]> {
  const db = await getDB();
  return db.getAll('progress');
}

export async function getCompletedDaysCount(): Promise<number> {
  const all = await getAllProgress();
  return all.filter((p) => p.completed).length;
}

export async function getCompletedDays(): Promise<Set<number>> {
  const all = await getAllProgress();
  return new Set(all.filter((p) => p.completed).map((p) => p.day));
}

export async function isDayComplete(day: number): Promise<boolean> {
  const p = await getDayProgress(day);
  return p?.completed ?? false;
}

export async function clearAllProgress(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('progress', 'readwrite');
  await tx.store.clear();
  await tx.done;
}
