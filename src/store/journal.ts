import { getDB } from './db';
import type { JournalEntry, SeasonId } from '../types';

export async function getJournalEntry(day: number): Promise<JournalEntry | null> {
  const db = await getDB();
  return (await db.get('journal', day)) ?? null;
}

export async function saveJournalEntry(
  day: number,
  content: string,
  season: SeasonId
): Promise<void> {
  const db = await getDB();
  const now = new Date().toISOString();
  const existing = await db.get('journal', day);

  await db.put('journal', {
    day,
    content,
    season,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });
}

export async function deleteJournalEntry(day: number): Promise<void> {
  const db = await getDB();
  await db.delete('journal', day);
}

export async function getAllJournalEntries(): Promise<JournalEntry[]> {
  const db = await getDB();
  return db.getAll('journal');
}

export async function getJournalDays(): Promise<Set<number>> {
  const db = await getDB();
  const keys = await db.getAllKeys('journal');
  return new Set(keys as number[]);
}
