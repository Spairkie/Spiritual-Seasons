export type SeasonId = 'winter' | 'spring' | 'summer' | 'autumn';

export const SEASON_IDS: readonly SeasonId[] = ['winter', 'spring', 'summer', 'autumn'];

export const SEASON_DAY_RANGES: Record<SeasonId, { start: number; end: number }> = {
  winter: { start: 1,  end: 30 },
  spring: { start: 31, end: 60 },
  summer: { start: 61, end: 90 },
  autumn: { start: 91, end: 120 },
};

export const SEASON_LABELS: Record<SeasonId, string> = {
  winter: 'Winter',
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
};

export const SEASON_EMOJIS: Record<SeasonId, string> = {
  winter: '❄️',
  spring: '🌸',
  summer: '☀️',
  autumn: '🍂',
};

/** Get the season for a given day (1–120) */
export function getSeasonForDay(day: number): SeasonId {
  if (day <= 30) return 'winter';
  if (day <= 60) return 'spring';
  if (day <= 90) return 'summer';
  return 'autumn';
}

/** Get the day-within-season (1–30) for a given day (1–120) */
export function getDayInSeason(day: number): number {
  const season = getSeasonForDay(day);
  return day - SEASON_DAY_RANGES[season].start + 1;
}
