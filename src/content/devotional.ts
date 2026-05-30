import type { BookData, BookSeason, DayEntry, SeasonId } from '../types';
import { getSeasonForDay, getDayInSeason, SEASON_IDS } from '../types';

export function getDay(book: BookData, day: number): DayEntry {
  const seasonId = getSeasonForDay(day);
  const season = book.seasons.find((s) => s.id === seasonId);
  if (!season) throw new Error(`Season not found for day ${day}`);

  const dayInSeason = getDayInSeason(day);
  const entry = season.days.find((d) => d.day === day);
  if (!entry) throw new Error(`Day ${day} (day ${dayInSeason} of ${seasonId}) not found`);

  return entry;
}

export function getSeason(book: BookData, seasonId: SeasonId): BookSeason {
  const season = book.seasons.find((s) => s.id === seasonId);
  if (!season) throw new Error(`Season ${seasonId} not found`);
  return season;
}

export function getSeasons(book: BookData): BookSeason[] {
  // Return in canonical order
  return SEASON_IDS.map((id) => getSeason(book, id));
}

export function getNextDay(day: number): number {
  return Math.min(day + 1, 120);
}

export function getPrevDay(day: number): number {
  return Math.max(day - 1, 1);
}

export function isLastDayOfSeason(day: number): boolean {
  return day === 30 || day === 60 || day === 90;
}

export function isLastDay(day: number): boolean {
  return day === 120;
}

export function getNextSeasonId(day: number): SeasonId | null {
  if (day === 30) return 'spring';
  if (day === 60) return 'summer';
  if (day === 90) return 'autumn';
  return null;
}

export function buildBibleGatewayUrl(ref: string, translation: string): string {
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(ref)}&version=${translation}`;
}
