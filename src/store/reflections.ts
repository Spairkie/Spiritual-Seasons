import { getDB } from './db';
import type { WeeklyReflection } from '../types';

export async function getWeeklyReflection(week: number): Promise<WeeklyReflection | null> {
  const db = await getDB();
  return (await db.get('weeklyReflections', week)) ?? null;
}

export async function saveWeeklyReflection(
  week: number,
  responses: string[]
): Promise<void> {
  const db = await getDB();
  await db.put('weeklyReflections', {
    week,
    responses,
    updatedAt: new Date().toISOString(),
  });
}

export async function getAllReflections(): Promise<WeeklyReflection[]> {
  const db = await getDB();
  const all = await db.getAll('weeklyReflections');
  return all.sort((a, b) => b.week - a.week);
}

export async function clearAllReflections(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('weeklyReflections', 'readwrite');
  await tx.store.clear();
  await tx.done;
}
