import type { RouteParams } from '../router/router';
import { router } from '../router/router';
import { ROUTES } from '../router/routes';
import { loadBookData } from '../content/loader';
import {
  getDay,
  getPrevDay,
  getNextDay,
  isLastDayOfSeason,
  isLastDay,
  getNextSeasonId,
  buildBibleGatewayUrl,
} from '../content/devotional';
import { getCurrentDay, setCurrentDay } from '../store/user';
import { getJournalEntry, saveJournalEntry } from '../store/journal';
import { getDayProgress, markDayComplete } from '../store/progress';
import { toggleFavorite, isFavorite } from '../store/favorites';
import { updateStreakOnCompletion } from '../store/streaks';
import { getSetting } from '../store/settings';
import { escapeHtml, getMain } from '../utils/dom';
import { formatTimeAgo } from '../utils/date';
import { validateDay, clampDay } from '../utils/validation';
import { showToast } from '../ui/toast';
import { SEASON_LABELS, SEASON_EMOJIS, getSeasonForDay, getDayInSeason } from '../types';

let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

export async function renderDevotional(params: RouteParams): Promise<void> {
  // Clear any pending auto-save from a previous page
  if (autoSaveTimer !== null) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }

  const main = getMain();
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner" aria-label="Loading…"></div></div>';

  // Determine which day to show
  let day = typeof params.day === 'number' && validateDay(params.day)
    ? params.day
    : await getCurrentDay();
  day = clampDay(day);

  const [book, journalEntry, progress, fav, translation, autoSave] = await Promise.all([
    loadBookData(),
    getJournalEntry(day),
    getDayProgress(day),
    isFavorite(day),
    getSetting('bibleTranslation'),
    getSetting('autoSave'),
  ]);

  const dayData = getDay(book, day);
  const season = getSeasonForDay(day);
  const seasonLabel = SEASON_LABELS[season];
  const seasonEmoji = SEASON_EMOJIS[season];
  const dayInSeason = getDayInSeason(day);
  const isComplete = progress?.completed ?? false;

  const prevDay = getPrevDay(day);
  const nextDay = getNextDay(day);
  const atSeasonEnd = isLastDayOfSeason(day);
  const atEnd = isLastDay(day);
  const nextSeasonId = getNextSeasonId(day);
  const nextSeasonLabel = nextSeasonId ? SEASON_LABELS[nextSeasonId] : '';

  const bibleUrl = buildBibleGatewayUrl(dayData.scriptureRef, translation);
  const lastSavedNote = journalEntry
    ? `Saved ${formatTimeAgo(journalEntry.updatedAt)}`
    : '';

  const nextBtnLabel = atSeasonEnd
    ? `${nextSeasonLabel} Season →`
    : atEnd
    ? 'View Progress'
    : `Day ${nextDay} →`;

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="devotional-layout">

          <!-- Left column: scripture + reflection -->
          <div class="devotional-left">
            <div class="devotional-context">
              <span class="devotional-season-tag">${seasonEmoji} ${escapeHtml(seasonLabel)}</span>
              <span class="devotional-day-count">Day ${dayInSeason} of 30</span>
            </div>

            <div class="scripture-block">
              <h1 class="scripture-ref">${escapeHtml(dayData.scriptureRef)}</h1>
              <blockquote class="scripture-quote">
                "${escapeHtml(dayData.scriptureText)}"
              </blockquote>
            </div>

            <div class="devotional-actions">
              <a href="${bibleUrl}" target="_blank" rel="noopener noreferrer"
                 class="btn btn-secondary btn-sm" aria-label="Read full chapter on Bible Gateway (opens in new tab)">
                📖 Read Full Chapter
              </a>
              <button class="btn btn-secondary btn-sm" id="btn-tts" aria-label="Listen to scripture">
                🔊 Listen
              </button>
              <button class="btn btn-secondary btn-sm" id="btn-share" aria-label="Share this scripture">
                ↗ Share
              </button>
            </div>

            <div class="reflection-block">
              <div class="reflection-label">Today's Reflection</div>
              <p class="reflection-prompt">${escapeHtml(dayData.prompt)}</p>
            </div>
          </div>

          <!-- Right column: journal + nav -->
          <div class="devotional-right">
            <div class="journal-block">
              <div class="journal-header">
                <label class="journal-label" for="journal-textarea">Your Journal</label>
                <div class="journal-meta">
                  <span class="word-count" id="word-count" aria-live="polite"></span>
                  <span class="journal-save-indicator" id="save-indicator" aria-live="polite">
                    ${escapeHtml(lastSavedNote)}
                  </span>
                </div>
              </div>
              <textarea
                id="journal-textarea"
                class="journal-textarea"
                aria-label="Journal entry for Day ${day}"
                placeholder="Write your thoughts, prayers, and reflections here…"
                rows="8"
              >${escapeHtml(journalEntry?.content ?? '')}</textarea>
              <div class="journal-footer">
                <span></span>
                ${!autoSave
                  ? `<button class="btn btn-secondary btn-sm" id="btn-manual-save">Save</button>`
                  : ''}
              </div>
            </div>

            <!-- Navigation footer -->
            <div class="devotional-nav">
              <button class="btn btn-secondary btn-sm btn-prev"
                id="btn-prev"
                aria-label="Previous day"
                ${day === 1 ? 'disabled' : ''}>
                ← ${day === 1 ? 'Day 1' : `Day ${prevDay}`}
              </button>

              <button class="btn btn-ghost btn-sm btn-favorite ${fav ? 'is-favorite' : ''}"
                id="btn-favorite"
                aria-label="${fav ? 'Remove from favourites' : 'Add to favourites'}"
                aria-pressed="${fav}">
                ${fav ? '♥' : '♡'}
              </button>

              <button
                class="btn ${isComplete ? 'btn-primary' : 'btn-secondary'} btn-sm btn-complete"
                id="btn-complete"
                aria-pressed="${isComplete}"
                aria-label="${isComplete ? 'Completed' : 'Mark as complete'}">
                ${isComplete ? '✓ Completed' : 'Mark Complete'}
              </button>

              <button class="btn btn-secondary btn-sm btn-next"
                id="btn-next"
                aria-label="Next: ${nextBtnLabel}">
                ${escapeHtml(nextBtnLabel)}
              </button>
            </div>

            <!-- Completion card (shown after marking complete) -->
            <div id="completion-card" ${!isComplete ? 'hidden' : ''}>
              ${isComplete ? buildCompletionCard(day, nextDay, atSeasonEnd, atEnd, nextSeasonLabel, nextSeasonId) : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  attachListeners({ day, season, seasonLabel, dayData, autoSave, atSeasonEnd, atEnd, nextDay, nextSeasonId, nextSeasonLabel, isComplete });
}

interface ListenerContext {
  day: number;
  season: ReturnType<typeof getSeasonForDay>;
  seasonLabel: string;
  dayData: ReturnType<typeof getDay>;
  autoSave: boolean;
  atSeasonEnd: boolean;
  atEnd: boolean;
  nextDay: number;
  nextSeasonId: string | null;
  nextSeasonLabel: string;
  isComplete: boolean;
}

function attachListeners(ctx: ListenerContext): void {
  const { day, season, autoSave, atSeasonEnd, atEnd, nextDay, nextSeasonId } = ctx;

  const textarea = document.getElementById('journal-textarea') as HTMLTextAreaElement | null;
  const saveIndicator = document.getElementById('save-indicator');
  const wordCountEl = document.getElementById('word-count');

  // Live word count
  if (textarea && wordCountEl) {
    updateWordCount(textarea, wordCountEl);
    textarea.addEventListener('input', () => {
      updateWordCount(textarea, wordCountEl);
      if (autoSave) {
        scheduleAutoSave(textarea, day, season, saveIndicator);
      }
    });
  }

  // Manual save
  document.getElementById('btn-manual-save')?.addEventListener('click', async () => {
    if (!textarea) return;
    await performSave(textarea.value, day, season, saveIndicator);
  });

  // Prev day
  document.getElementById('btn-prev')?.addEventListener('click', () => {
    const prev = getPrevDay(day);
    if (prev !== day) void router.navigate(ROUTES.DEVOTIONAL, { day: prev });
  });

  // Next day
  document.getElementById('btn-next')?.addEventListener('click', () => {
    if (atSeasonEnd && nextSeasonId) {
      void router.navigate(ROUTES.INTRO, { page: nextSeasonId });
    } else if (atEnd) {
      void router.navigate(ROUTES.PROGRESS);
    } else {
      void router.navigate(ROUTES.DEVOTIONAL, { day: nextDay });
    }
  });

  // Favourite toggle
  document.getElementById('btn-favorite')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-favorite') as HTMLButtonElement;
    const book = await loadBookData();
    const dayData = getDay(book, day);
    const isNowFav = await toggleFavorite(day, season, dayData.scriptureRef);
    btn.classList.toggle('is-favorite', isNowFav);
    btn.setAttribute('aria-pressed', String(isNowFav));
    btn.setAttribute('aria-label', isNowFav ? 'Remove from favourites' : 'Add to favourites');
    btn.textContent = isNowFav ? '♥' : '♡';
    showToast(isNowFav ? 'Added to favourites' : 'Removed from favourites', { type: 'success', duration: 2000 });
  });

  // Mark complete
  document.getElementById('btn-complete')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-complete') as HTMLButtonElement;
    const alreadyDone = btn.getAttribute('aria-pressed') === 'true';
    if (alreadyDone) return;

    // Save journal before marking complete
    if (textarea?.value) {
      await performSave(textarea.value, day, season, saveIndicator);
    }

    await markDayComplete(day, season);
    await updateStreakOnCompletion();

    const nextCurrentDay = atEnd ? 120 : nextDay;
    await setCurrentDay(nextCurrentDay);

    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('aria-label', 'Completed');
    btn.textContent = '✓ Completed';
    btn.className = 'btn btn-primary btn-sm btn-complete';

    // Show completion card
    const card = document.getElementById('completion-card');
    if (card) {
      const { atSeasonEnd: atEnd2, atEnd: journey, nextDay: nd, nextSeasonLabel: nsl, nextSeasonId: nsi } = ctx;
      card.innerHTML = buildCompletionCard(day, nd, atEnd2, journey, nsl, nsi);
      card.hidden = false;
      attachCompletionCardListeners(day, nd, atEnd2, journey, nsi);
    }

    showToast('Day complete! Well done.', { type: 'success' });
  });

  // TTS — uses Web Speech API if available
  document.getElementById('btn-tts')?.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech not supported in this browser', { type: 'info' });
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(
      `${ctx.dayData.scriptureRef}. ${ctx.dayData.scriptureText}`
    );
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  });

  // Share
  document.getElementById('btn-share')?.addEventListener('click', (e) => {
    import('../ui/share').then(({ openShareModal }) => {
      openShareModal(
        { scriptureRef: ctx.dayData.scriptureRef, scriptureText: ctx.dayData.scriptureText, day: ctx.day },
        e.currentTarget as HTMLElement
      );
    });
  });

  // Completion card listeners if already complete on load
  if (ctx.isComplete) {
    attachCompletionCardListeners(day, nextDay, atSeasonEnd, atEnd, nextSeasonId);
  }
}

function updateWordCount(textarea: HTMLTextAreaElement, el: HTMLElement): void {
  const words = textarea.value.trim() ? textarea.value.trim().split(/\s+/).length : 0;
  el.textContent = `${words} word${words !== 1 ? 's' : ''}`;
}

function scheduleAutoSave(
  textarea: HTMLTextAreaElement,
  day: number,
  season: ReturnType<typeof getSeasonForDay>,
  indicator: HTMLElement | null
): void {
  if (autoSaveTimer !== null) clearTimeout(autoSaveTimer);
  if (indicator) {
    indicator.textContent = 'Unsaved…';
    indicator.className = 'journal-save-indicator';
  }
  autoSaveTimer = setTimeout(() => {
    void performSave(textarea.value, day, season, indicator);
  }, 2000);
}

async function performSave(
  content: string,
  day: number,
  season: ReturnType<typeof getSeasonForDay>,
  indicator: HTMLElement | null
): Promise<void> {
  if (indicator) {
    indicator.textContent = 'Saving…';
    indicator.className = 'journal-save-indicator is-saving';
  }
  await saveJournalEntry(day, content, season);
  if (indicator) {
    indicator.textContent = 'Saved';
    indicator.className = 'journal-save-indicator is-saved';
    setTimeout(() => {
      if (indicator.textContent === 'Saved') {
        indicator.textContent = 'Auto-saved';
        indicator.className = 'journal-save-indicator';
      }
    }, 3000);
  }
}

function buildCompletionCard(
  day: number,
  nextDay: number,
  atSeasonEnd: boolean,
  atEnd: boolean,
  nextSeasonLabel: string,
  nextSeasonId: string | null
): string {
  if (atEnd) {
    return `
      <div class="completion-card">
        <div class="completion-card-title">🎉 Journey Complete!</div>
        <div class="completion-card-desc">
          You have completed all 120 days of Spiritual Seasons. What an incredible journey.
        </div>
        <div class="u-flex-center">
          <button class="btn btn-primary" id="cc-progress">View My Journey</button>
        </div>
      </div>`;
  }

  if (atSeasonEnd && nextSeasonId) {
    return `
      <div class="completion-card">
        <div class="completion-card-title">Season Complete ✨</div>
        <div class="completion-card-desc">
          You have finished your ${SEASON_LABELS[getSeasonForDay(day)]} season.
          Your ${escapeHtml(nextSeasonLabel)} season awaits.
        </div>
        <button class="btn btn-primary" id="cc-next-season">
          Begin ${escapeHtml(nextSeasonLabel)} Season →
        </button>
      </div>`;
  }

  return `
    <div class="completion-card">
      <div class="completion-card-title">Well done! ✓</div>
      <div class="completion-card-desc">Day ${day} complete. Keep going — you're doing great.</div>
      <button class="btn btn-primary" id="cc-next-day">Continue to Day ${nextDay} →</button>
    </div>`;
}

function attachCompletionCardListeners(
  _day: number,
  nextDay: number,
  _atSeasonEnd: boolean,
  _atEnd: boolean,
  nextSeasonId: string | null
): void {
  document.getElementById('cc-progress')?.addEventListener('click', () => {
    void router.navigate(ROUTES.PROGRESS);
  });

  document.getElementById('cc-next-season')?.addEventListener('click', () => {
    if (nextSeasonId) void router.navigate(ROUTES.INTRO, { page: nextSeasonId });
  });

  document.getElementById('cc-next-day')?.addEventListener('click', () => {
    void router.navigate(ROUTES.DEVOTIONAL, { day: nextDay });
  });
}
