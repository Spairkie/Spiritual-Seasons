import { describe, it, expect } from 'vitest';
import {
  getQuizResults,
  saveQuizResults,
  getCurrentDay,
  setCurrentDay,
  getCurrentSeason,
  resetUserData,
} from '../../../src/store/user';
import type { QuizResults } from '../../../src/types';

const mockResults: QuizResults = {
  seasonId: 'spring',
  scores: { winter: 10, spring: 18, summer: 12, autumn: 8 },
  completedAt: '2026-01-01T00:00:00.000Z',
};

describe('getQuizResults', () => {
  it('returns null before any quiz is taken', async () => {
    expect(await getQuizResults()).toBeNull();
  });
});

describe('saveQuizResults', () => {
  it('saves and retrieves quiz results', async () => {
    await saveQuizResults(mockResults);
    const r = await getQuizResults();
    expect(r?.seasonId).toBe('spring');
    expect(r?.scores.spring).toBe(18);
  });

  it('sets currentDay to the first day of the result season', async () => {
    // spring starts at day 31 — user should begin reading there, not day 1 (Winter)
    await saveQuizResults(mockResults);
    expect(await getCurrentDay()).toBe(31);
    expect(await getCurrentSeason()).toBe('spring');
  });
});

describe('setCurrentDay', () => {
  it('updates the current day', async () => {
    await saveQuizResults(mockResults);
    await setCurrentDay(15);
    expect(await getCurrentDay()).toBe(15);
  });

  it('clamps to 1 minimum', async () => {
    await saveQuizResults(mockResults);
    await setCurrentDay(-5);
    expect(await getCurrentDay()).toBe(1);
  });

  it('clamps to 120 maximum', async () => {
    await saveQuizResults(mockResults);
    await setCurrentDay(999);
    expect(await getCurrentDay()).toBe(120);
  });
});

describe('resetUserData', () => {
  it('clears saved user record', async () => {
    await saveQuizResults(mockResults);
    await resetUserData();
    expect(await getQuizResults()).toBeNull();
    expect(await getCurrentDay()).toBe(1);
  });
});
