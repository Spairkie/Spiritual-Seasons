import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getStreakData, updateStreakOnCompletion, resetStreaks } from '../../../src/store/streaks';

// Only fake Date — faking all timers breaks fake-indexeddb's internal promises
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('getStreakData', () => {
  it('returns default streak data when no record exists', async () => {
    const data = await getStreakData();
    expect(data.currentStreak).toBe(0);
    expect(data.longestStreak).toBe(0);
    expect(data.lastCompletedDate).toBeNull();
    expect(data.milestones).toEqual([]);
  });
});

describe('updateStreakOnCompletion', () => {
  it('starts streak at 1 on first completion', async () => {
    vi.setSystemTime(new Date('2026-01-01'));
    const data = await updateStreakOnCompletion();
    expect(data.currentStreak).toBe(1);
    expect(data.longestStreak).toBe(1);
    expect(data.lastCompletedDate).toBe('2026-01-01');
  });

  it('increments streak on consecutive day', async () => {
    vi.setSystemTime(new Date('2026-01-01'));
    await updateStreakOnCompletion();

    vi.setSystemTime(new Date('2026-01-02'));
    const data = await updateStreakOnCompletion();
    expect(data.currentStreak).toBe(2);
  });

  it('resets streak on missed day', async () => {
    vi.setSystemTime(new Date('2026-01-01'));
    await updateStreakOnCompletion();

    vi.setSystemTime(new Date('2026-01-03')); // skipped Jan 2
    const data = await updateStreakOnCompletion();
    expect(data.currentStreak).toBe(1);
  });

  it('preserves longest streak', async () => {
    vi.setSystemTime(new Date('2026-01-01'));
    await updateStreakOnCompletion();
    vi.setSystemTime(new Date('2026-01-02'));
    await updateStreakOnCompletion();
    vi.setSystemTime(new Date('2026-01-03'));
    await updateStreakOnCompletion();
    // currentStreak = 3, longestStreak = 3

    vi.setSystemTime(new Date('2026-01-05')); // missed Jan 4
    const data = await updateStreakOnCompletion();
    expect(data.currentStreak).toBe(1);
    expect(data.longestStreak).toBe(3);
  });

  it('awards 7-day milestone on 7th consecutive day', async () => {
    for (let d = 1; d <= 7; d++) {
      vi.setSystemTime(new Date(2026, 0, d)); // Jan 1–7
      await updateStreakOnCompletion();
    }
    const data = await getStreakData();
    expect(data.milestones).toContain(7);
    expect(data.currentStreak).toBe(7);
  });

  it('is idempotent — two completions on same day keep streak at 1', async () => {
    vi.setSystemTime(new Date('2026-06-01'));
    await updateStreakOnCompletion();
    await updateStreakOnCompletion();
    const data = await getStreakData();
    expect(data.currentStreak).toBe(1);
  });
});

describe('resetStreaks', () => {
  it('clears streak data', async () => {
    vi.setSystemTime(new Date('2026-01-01'));
    await updateStreakOnCompletion();
    await resetStreaks();
    const data = await getStreakData();
    expect(data.currentStreak).toBe(0);
  });
});
