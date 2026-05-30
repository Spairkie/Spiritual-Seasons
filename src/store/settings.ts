import { getDB } from './db';
import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

export async function getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
  const db = await getDB();
  const value = await db.get('settings', key);
  return (value as AppSettings[K]) ?? DEFAULT_SETTINGS[key];
}

export async function saveSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> {
  const db = await getDB();
  await db.put('settings', value, key);
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const keys = Object.keys(DEFAULT_SETTINGS) as (keyof AppSettings)[];
  const settings = { ...DEFAULT_SETTINGS };

  await Promise.all(
    keys.map(async (key) => {
      const value = await db.get('settings', key);
      if (value !== undefined) {
        (settings[key] as AppSettings[typeof key]) = value as AppSettings[typeof key];
      }
    })
  );

  return settings;
}

export async function resetSettings(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('settings', 'readwrite');
  await tx.store.clear();
  await tx.done;
}
