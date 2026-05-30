import { describe, it, expect } from 'vitest';
import {
  getFavorite,
  isFavorite,
  addFavorite,
  removeFavorite,
  toggleFavorite,
  updateFavoriteNote,
  getAllFavorites,
  getFavoriteDays,
} from '../../../src/store/favorites';

describe('isFavorite', () => {
  it('returns false when not saved', async () => {
    expect(await isFavorite(1)).toBe(false);
  });

  it('returns true after adding', async () => {
    await addFavorite(1, 'winter', 'Psalm 46:10');
    expect(await isFavorite(1)).toBe(true);
  });
});

describe('toggleFavorite', () => {
  it('adds when not present and returns true', async () => {
    const added = await toggleFavorite(1, 'winter', 'Psalm 46:10');
    expect(added).toBe(true);
    expect(await isFavorite(1)).toBe(true);
  });

  it('removes when present and returns false', async () => {
    await addFavorite(1, 'winter', 'Psalm 46:10');
    const stillFave = await toggleFavorite(1, 'winter', 'Psalm 46:10');
    expect(stillFave).toBe(false);
    expect(await isFavorite(1)).toBe(false);
  });
});

describe('updateFavoriteNote', () => {
  it('updates the note on an existing favorite', async () => {
    await addFavorite(5, 'spring', 'John 3:16');
    await updateFavoriteNote(5, 'This verse really spoke to me.');
    const fav = await getFavorite(5);
    expect(fav?.note).toBe('This verse really spoke to me.');
  });

  it('is a no-op if the favorite does not exist', async () => {
    await expect(updateFavoriteNote(999, 'note')).resolves.toBeUndefined();
  });
});

describe('getAllFavorites', () => {
  it('returns favorites sorted by day number', async () => {
    await addFavorite(30, 'winter', 'Ref A');
    await addFavorite(5, 'winter', 'Ref B');
    await addFavorite(15, 'winter', 'Ref C');
    const all = await getAllFavorites();
    expect(all.map((f) => f.day)).toEqual([5, 15, 30]);
  });
});

describe('getFavoriteDays', () => {
  it('returns a Set of favorited day numbers', async () => {
    await addFavorite(10, 'winter', 'Ref');
    await addFavorite(20, 'winter', 'Ref');
    const days = await getFavoriteDays();
    expect(days.has(10)).toBe(true);
    expect(days.has(20)).toBe(true);
    expect(days.has(1)).toBe(false);
  });
});
