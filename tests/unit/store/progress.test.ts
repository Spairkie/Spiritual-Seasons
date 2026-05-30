import { describe, it, expect } from 'vitest';
import {
  getDayProgress,
  markDayComplete,
  markDayIncomplete,
  getCompletedDaysCount,
  getCompletedDays,
  isDayComplete,
} from '../../../src/store/progress';

describe('getDayProgress', () => {
  it('returns null for a day with no record', async () => {
    expect(await getDayProgress(1)).toBeNull();
  });
});

describe('markDayComplete', () => {
  it('marks a day as complete', async () => {
    await markDayComplete(1, 'winter');
    const p = await getDayProgress(1);
    expect(p?.completed).toBe(true);
    expect(p?.completedAt).toBeTruthy();
    expect(p?.season).toBe('winter');
  });

  it('isDayComplete returns true after marking', async () => {
    await markDayComplete(5, 'spring');
    expect(await isDayComplete(5)).toBe(true);
  });
});

describe('markDayIncomplete', () => {
  it('sets completed to false', async () => {
    await markDayComplete(3, 'winter');
    await markDayIncomplete(3, 'winter');
    const p = await getDayProgress(3);
    expect(p?.completed).toBe(false);
    expect(p?.completedAt).toBeNull();
  });
});

describe('getCompletedDaysCount', () => {
  it('returns 0 with no completions', async () => {
    expect(await getCompletedDaysCount()).toBe(0);
  });

  it('counts only completed days', async () => {
    await markDayComplete(1, 'winter');
    await markDayComplete(2, 'winter');
    await markDayIncomplete(2, 'winter');
    expect(await getCompletedDaysCount()).toBe(1);
  });
});

describe('getCompletedDays', () => {
  it('returns a Set of completed day numbers', async () => {
    await markDayComplete(10, 'winter');
    await markDayComplete(20, 'winter');
    const days = await getCompletedDays();
    expect(days.has(10)).toBe(true);
    expect(days.has(20)).toBe(true);
    expect(days.has(1)).toBe(false);
  });
});
