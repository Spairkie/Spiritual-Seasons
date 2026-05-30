import { describe, it, expect } from 'vitest';
import {
  getJournalEntry,
  saveJournalEntry,
  deleteJournalEntry,
  getAllJournalEntries,
  getJournalDays,
} from '../../../src/store/journal';

describe('getJournalEntry', () => {
  it('returns null for a day with no entry', async () => {
    expect(await getJournalEntry(1)).toBeNull();
  });
});

describe('saveJournalEntry', () => {
  it('saves and retrieves an entry', async () => {
    await saveJournalEntry(1, 'My reflection', 'winter');
    const entry = await getJournalEntry(1);
    expect(entry?.content).toBe('My reflection');
    expect(entry?.season).toBe('winter');
    expect(entry?.day).toBe(1);
  });

  it('preserves createdAt on subsequent saves', async () => {
    await saveJournalEntry(1, 'First', 'winter');
    const first = await getJournalEntry(1);

    await new Promise((r) => setTimeout(r, 5)); // ensure time passes
    await saveJournalEntry(1, 'Second', 'winter');
    const second = await getJournalEntry(1);

    expect(second?.createdAt).toBe(first?.createdAt);
    expect(second?.content).toBe('Second');
  });

  it('updates updatedAt on subsequent saves', async () => {
    await saveJournalEntry(1, 'First', 'winter');
    const first = await getJournalEntry(1);

    await new Promise((r) => setTimeout(r, 5));
    await saveJournalEntry(1, 'Second', 'winter');
    const second = await getJournalEntry(1);

    expect(second?.updatedAt).not.toBe(first?.updatedAt);
  });
});

describe('deleteJournalEntry', () => {
  it('removes an entry', async () => {
    await saveJournalEntry(5, 'hello', 'spring');
    await deleteJournalEntry(5);
    expect(await getJournalEntry(5)).toBeNull();
  });

  it('is a no-op for a non-existent entry', async () => {
    await expect(deleteJournalEntry(999)).resolves.toBeUndefined();
  });
});

describe('getAllJournalEntries', () => {
  it('returns empty array when no entries exist', async () => {
    expect(await getAllJournalEntries()).toEqual([]);
  });

  it('returns all saved entries', async () => {
    await saveJournalEntry(1, 'one', 'winter');
    await saveJournalEntry(2, 'two', 'winter');
    const all = await getAllJournalEntries();
    expect(all).toHaveLength(2);
  });
});

describe('getJournalDays', () => {
  it('returns a Set of days with entries', async () => {
    await saveJournalEntry(10, 'text', 'winter');
    await saveJournalEntry(20, 'text', 'winter');
    const days = await getJournalDays();
    expect(days.has(10)).toBe(true);
    expect(days.has(20)).toBe(true);
    expect(days.has(1)).toBe(false);
  });
});
