import type { RouteParams } from '../router/router';
import { router } from '../router/router';
import { ROUTES } from '../router/routes';
import { loadBookData } from '../content/loader';
import { getDay } from '../content/devotional';
import { getCurrentDay } from '../store/user';
import { getCompletedDays } from '../store/progress';
import { getJournalDays } from '../store/journal';
import { getFavoriteDays } from '../store/favorites';
import { escapeHtml, getMain } from '../utils/dom';
import { SEASON_IDS, SEASON_LABELS, SEASON_EMOJIS, SEASON_DAY_RANGES } from '../types';

export async function renderTOC(_params: RouteParams): Promise<void> {
  const main = getMain();
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner" aria-label="Loading…"></div></div>';

  const [book, currentDay, completedDays, journalDays, favDays] = await Promise.all([
    loadBookData(),
    getCurrentDay(),
    getCompletedDays(),
    getJournalDays(),
    getFavoriteDays(),
  ]);

  const sectionsHtml = SEASON_IDS.map(season => {
    const range = SEASON_DAY_RANGES[season];
    const label = SEASON_LABELS[season];
    const emoji = SEASON_EMOJIS[season];
    const completedInSeason = Array.from(completedDays).filter(d => d >= range.start && d <= range.end).length;
    const totalInSeason = range.end - range.start + 1;

    const daysHtml = Array.from({ length: totalInSeason }, (_, i) => {
      const day = range.start + i;
      const dayData = getDay(book, day);
      const isCurrent = day === currentDay;
      const isComplete = completedDays.has(day);
      const hasJournal = journalDays.has(day);
      const isFav = favDays.has(day);

      const classes = [
        'toc-day-btn',
        isCurrent ? 'is-current' : '',
        isComplete ? 'is-complete' : '',
      ].filter(Boolean).join(' ');

      const indicators = [
        isComplete ? '<span class="toc-indicator" aria-label="Completed">✓</span>' : '',
        isFav     ? '<span class="toc-indicator" aria-label="Favourited">♥</span>' : '',
        hasJournal ? '<span class="toc-indicator" aria-label="Journal entry">✎</span>' : '',
      ].filter(Boolean).join('');

      return `
        <button class="${classes}" data-day="${day}" aria-label="Day ${day}: ${escapeHtml(dayData.scriptureRef)}${isCurrent ? ' (current)' : ''}${isComplete ? ', completed' : ''}">
          <span class="toc-day-num">Day ${day}</span>
          <span class="toc-day-ref">${escapeHtml(dayData.scriptureRef)}</span>
          ${indicators ? `<div class="toc-indicators">${indicators}</div>` : ''}
        </button>`;
    }).join('');

    return `
      <section class="toc-season-section" aria-label="${label} season">
        <div class="toc-season-header">
          <span class="toc-season-title">${emoji} ${escapeHtml(label)}</span>
          <span class="toc-season-progress">${completedInSeason}/${totalInSeason} complete</span>
        </div>
        <div class="toc-grid" role="list">
          ${daysHtml}
        </div>
      </section>`;
  }).join('');

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">All 120 Days</h1>
        </div>
        ${sectionsHtml}
      </div>
    </div>
  `;

  main.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-day]') as HTMLElement | null;
    if (!btn) return;
    const day = parseInt(btn.dataset['day'] ?? '', 10);
    if (!isNaN(day)) {
      void router.navigate(ROUTES.DEVOTIONAL, { day });
    }
  });
}
