import { getDB } from './db';
import type { AudioNote } from '../types';

export async function getAudioNote(day: number): Promise<AudioNote | null> {
  const db = await getDB();
  return (await db.get('audioNotes', day)) ?? null;
}

export async function saveAudioNote(
  day: number,
  blob: Blob,
  mimeType: string,
  duration: number
): Promise<void> {
  const db = await getDB();
  await db.put('audioNotes', {
    day,
    blob,
    mimeType,
    duration,
    createdAt: new Date().toISOString(),
  });
}

export async function deleteAudioNote(day: number): Promise<void> {
  const db = await getDB();
  await db.delete('audioNotes', day);
}

export async function getAllAudioNotes(): Promise<AudioNote[]> {
  const db = await getDB();
  return db.getAll('audioNotes');
}

export async function getAudioNoteDays(): Promise<Set<number>> {
  const db = await getDB();
  const keys = await db.getAllKeys('audioNotes');
  return new Set(keys as number[]);
}
