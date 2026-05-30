import type { DarkMode, SeasonId, SeasonTheme } from '../types';
import { getSeasonForDay } from '../types';

const DARK_MODES: DarkMode[] = ['system', 'light', 'dark'];

class ThemeManager {
  private systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  private currentDarkMode: DarkMode = 'system';
  private currentSeasonTheme: SeasonTheme = 'auto';
  private currentDay = 1;

  init(darkMode: DarkMode, seasonTheme: SeasonTheme, currentDay: number): void {
    this.currentDay = currentDay;
    this.applyDarkMode(darkMode);
    this.applySeasonTheme(seasonTheme, currentDay);

    // React to system preference changes
    this.systemDarkQuery.addEventListener('change', () => {
      if (this.currentDarkMode === 'system') {
        this.applyDarkMode('system');
      }
    });
  }

  applyDarkMode(mode: DarkMode): void {
    if (!DARK_MODES.includes(mode)) return;
    this.currentDarkMode = mode;

    const isDark =
      mode === 'dark' || (mode === 'system' && this.systemDarkQuery.matches);

    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  applySeasonTheme(theme: SeasonTheme, currentDay?: number): void {
    this.currentSeasonTheme = theme;
    if (currentDay !== undefined) this.currentDay = currentDay;

    const season: SeasonId =
      theme === 'auto' ? getSeasonForDay(this.currentDay) : theme;

    document.documentElement.setAttribute('data-season', season);
  }

  applyFontSize(size: string): void {
    const sizes: Record<string, string> = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px',
    };
    document.documentElement.style.fontSize = sizes[size] ?? '16px';
  }

  applyLineSpacing(spacing: string): void {
    const map: Record<string, string> = {
      compact: '1.3',
      normal: '1.5',
      relaxed: '1.7',
      loose: '2.0',
    };
    document.documentElement.style.setProperty('--leading-body', map[spacing] ?? '1.5');
  }

  getCurrentSeason(): SeasonId {
    return this.currentSeasonTheme === 'auto'
      ? getSeasonForDay(this.currentDay)
      : this.currentSeasonTheme;
  }
}

export const themeManager = new ThemeManager();
