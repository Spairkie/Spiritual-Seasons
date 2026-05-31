import type { RouteParams } from '../router/router';
import { router } from '../router/router';
import { ROUTES } from '../router/routes';
import { loadBookData } from '../content/loader';
import { getDay } from '../content/devotional';
import { getCurrentDay, getQuizResults } from '../store/user';
import { getCompletedDaysCount } from '../store/progress';
import { getJournalEntry } from '../store/journal';
import { getStreakData } from '../store/streaks';
import { getGreeting, formatTimeAgo } from '../utils/date';
import { escapeHtml, getMain } from '../utils/dom';
import { SEASON_LABELS, SEASON_EMOJIS, getDayInSeason } from '../types';

export async function renderHome(_params: RouteParams): Promise<void> {
  const main = getMain();
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner" aria-label="Loading…"></div></div>';

  const [book, currentDay, quizResults, completedCount, streakData] = await Promise.all([
    loadBookData(),
    getCurrentDay(),
    getQuizResults(),
    getCompletedDaysCount(),
    getStreakData(),
  ]);

  const dayData = getDay(book, currentDay);
  const journalEntry = await getJournalEntry(currentDay);

  const season = quizResults?.seasonId ?? 'winter';
  const seasonLabel = SEASON_LABELS[season];
  const seasonEmoji = SEASON_EMOJIS[season];
  const dayInSeason = getDayInSeason(currentDay);
  const progressPct = Math.round((completedCount / 120) * 100);
  const greeting = getGreeting();

  const journalNote = journalEntry
    ? `<p class="today-journal-note">✎ Last journaled ${formatTimeAgo(journalEntry.updatedAt)}</p>`
    : '';

  const streakNote = streakData.currentStreak > 1
    ? `<span class="season-badge streak-badge">🔥 ${streakData.currentStreak}-day streak</span>`
    : '';

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="home-layout">
          <!-- Left column: greeting + today's card -->
          <div class="home-left">
            <h1 class="home-greeting">${escapeHtml(greeting)}</h1>
            <p class="home-date">${escapeHtml(today)}</p>

            <div>
              <span class="season-badge">${seasonEmoji} ${escapeHtml(seasonLabel)} Season</span>
              ${streakNote}
            </div>

            <!-- Today's devotional card -->
            <div class="today-card u-mt-4">
              <div class="today-card-header">
                <div class="today-card-label">Today's Devotional</div>
                <div class="today-card-day">Day ${currentDay} of 120 &nbsp;·&nbsp; Day ${dayInSeason} of ${seasonLabel}</div>
              </div>
              <div class="today-card-body">
                <div class="today-scripture-ref">${escapeHtml(dayData.scriptureRef)}</div>
                <div class="today-scripture-text">"${escapeHtml(dayData.scriptureText)}"</div>

                <div class="progress-row">
                  <div class="progress-bar-track" role="progressbar" aria-valuenow="${progressPct}" aria-valuemin="0" aria-valuemax="100" aria-label="${completedCount} of 120 days complete">
                    <div class="progress-bar-fill" style="width:${progressPct}%"></div>
                  </div>
                  <span class="progress-label">${completedCount}/120 days</span>
                </div>

                ${journalNote}

                <button class="btn btn-primary btn-full" id="read-today-btn" aria-label="Read Day ${currentDay}">
                  Read Day ${currentDay} →
                </button>
              </div>
            </div>
          </div>

          <!-- Right column: wellness tools + quote -->
          <div class="home-right">
            <h2 class="section-title u-mb-3">Wellness Tools</h2>
            <div class="wellness-grid" role="list">
              <button class="wellness-card" id="btn-meditation" role="listitem" aria-label="Open meditation timer">
                <span class="wellness-icon">⏱</span>
                <span class="wellness-label">Meditation</span>
                <span class="wellness-desc">5-minute timer</span>
              </button>
              <button class="wellness-card" id="btn-breathing" role="listitem" aria-label="Open guided breathing">
                <span class="wellness-icon">🫁</span>
                <span class="wellness-label">Breathe</span>
                <span class="wellness-desc">Box breathing</span>
              </button>
              <button class="wellness-card" id="btn-sounds" role="listitem" aria-label="Open ambient sounds">
                <span class="wellness-icon">🎵</span>
                <span class="wellness-label">Sounds</span>
                <span class="wellness-desc">Ambient audio</span>
              </button>
              <button class="wellness-card" id="btn-favorites" role="listitem" aria-label="View favourites">
                <span class="wellness-icon">♥</span>
                <span class="wellness-label">Favourites</span>
                <span class="wellness-desc">Saved days</span>
              </button>
            </div>

            <div class="anchor-quote">
              <div class="anchor-quote-text">"${escapeHtml(dayData.scriptureText)}"</div>
              <div class="anchor-quote-ref">— ${escapeHtml(dayData.scriptureRef)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Event listeners — attached once, no inline handlers
  document.getElementById('read-today-btn')?.addEventListener('click', () => {
    void router.navigate(ROUTES.DEVOTIONAL, { day: currentDay });
  });

  document.getElementById('btn-favorites')?.addEventListener('click', () => {
    void router.navigate(ROUTES.FAVORITES);
  });

  document.getElementById('btn-meditation')?.addEventListener('click', (e) => {
    import('../ui/meditation').then(({ openMeditationModal }) => {
      openMeditationModal(e.currentTarget as HTMLElement);
    });
  });

  document.getElementById('btn-breathing')?.addEventListener('click', (e) => {
    import('../ui/breathing').then(({ openBreathingModal }) => {
      openBreathingModal(e.currentTarget as HTMLElement);
    });
  });

  document.getElementById('btn-sounds')?.addEventListener('click', (e) => {
    import('../ui/sounds').then(({ openSoundsModal }) => {
      openSoundsModal(e.currentTarget as HTMLElement);
    });
  });
}
