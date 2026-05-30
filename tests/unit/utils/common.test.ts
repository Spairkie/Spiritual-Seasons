import { describe, it, expect } from 'vitest';
import { getSeasonForDay, getDayInSeason } from '../../../src/types/common';

describe('getSeasonForDay', () => {
  it('returns winter for days 1–30', () => {
    expect(getSeasonForDay(1)).toBe('winter');
    expect(getSeasonForDay(15)).toBe('winter');
    expect(getSeasonForDay(30)).toBe('winter');
  });

  it('returns spring for days 31–60', () => {
    expect(getSeasonForDay(31)).toBe('spring');
    expect(getSeasonForDay(60)).toBe('spring');
  });

  it('returns summer for days 61–90', () => {
    expect(getSeasonForDay(61)).toBe('summer');
    expect(getSeasonForDay(90)).toBe('summer');
  });

  it('returns autumn for days 91–120', () => {
    expect(getSeasonForDay(91)).toBe('autumn');
    expect(getSeasonForDay(120)).toBe('autumn');
  });
});

describe('getDayInSeason', () => {
  it('returns 1 for first day of each season', () => {
    expect(getDayInSeason(1)).toBe(1);   // winter day 1
    expect(getDayInSeason(31)).toBe(1);  // spring day 1
    expect(getDayInSeason(61)).toBe(1);  // summer day 1
    expect(getDayInSeason(91)).toBe(1);  // autumn day 1
  });

  it('returns 30 for last day of each season', () => {
    expect(getDayInSeason(30)).toBe(30);
    expect(getDayInSeason(60)).toBe(30);
    expect(getDayInSeason(90)).toBe(30);
    expect(getDayInSeason(120)).toBe(30);
  });

  it('returns correct mid-season values', () => {
    expect(getDayInSeason(15)).toBe(15); // winter day 15
    expect(getDayInSeason(45)).toBe(15); // spring day 15
    expect(getDayInSeason(75)).toBe(15); // summer day 15
    expect(getDayInSeason(105)).toBe(15); // autumn day 15
  });
});
