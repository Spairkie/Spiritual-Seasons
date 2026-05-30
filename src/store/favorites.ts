import { getDB } from './db';
import type { FavoriteEntry, SeasonId } from '../types';

export async function getFavorite(day: number): Promise<FavoriteEntry | null> {
  const db = await getDB();
  return (await db.get('favorites', day)) ?? null;
}

export async function isFavorite(day: number): Promise<boolean> {
  return (await getFavorite(day)) !== null;
}

export async function addFavorite(
  day: number,
  season: SeasonId,
  scriptureRef: string
): Promise<void> {
  const db = await getDB();
  await db.put('favorites', {
    day,
    season,
    scriptureRef,
    note: '',
    savedAt: new Date().toISOString(),
  });
}

export async function removeFavorite(day: number): Promise<void> {
  const db = await getDB();
  await db.delete('favorites', day);
}

export async function toggleFavorite(
  day: number,
  season: SeasonId,
  scriptureRef: string
): Promise<boolean> {
  const existing = await getFavorite(day);
  if (existing) {
    await removeFavorite(day);
    return false;
  }
  await addFavorite(day, season, scriptureRef);
  return true;
}

export async function updateFavoriteNote(day: number, note: string): Promise<void> {
  const db = await getDB();
  const existing = await db.get('favorites', day);
  if (!existing) return;
  await db.put('favorites', { ...existing, note });
}

export async function getAllFavorites(): Promise<FavoriteEntry[]> {
  const db = await getDB();
  const all = await db.getAll('favorites');
  return all.sort((a, b) => a.day - b.day);
}

export async function getFavoriteDays(): Promise<Set<number>> {
  const db = await getDB();
  const keys = await db.getAllKeys('favorites');
  return new Set(keys as number[]);
}
