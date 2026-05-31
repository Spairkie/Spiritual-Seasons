import type { RouteParams } from '../router/router';
import { router } from '../router/router';
import { ROUTES } from '../router/routes';
import { loadBookData } from '../content/loader';
import { getDay } from '../content/devotional';
import { getAllFavorites, removeFavorite, updateFavoriteNote } from '../store/favorites';
import { escapeHtml, getMain } from '../utils/dom';
import { SEASON_LABELS, SEASON_EMOJIS, getSeasonForDay } from '../types';
import { showToast } from '../ui/toast';

let noteTimers: Map<number, ReturnType<typeof setTimeout>> = new Map();

export async function renderFavorites(_params: RouteParams): Promise<void> {
  noteTimers = new Map();
  const main = getMain();
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner" aria-label="Loading…"></div></div>';

  const [book, favorites] = await Promise.all([
    loadBookData(),
    getAllFavorites(),
  ]);

  if (favorites.length === 0) {
    main.innerHTML = `
      <div class="page">
        <div class="page-content">
          <div class="page-header">
            <h1 class="page-title">Favourites</h1>
          </div>
          <div class="favorites-empty">
            <div class="favorites-empty-icon">♡</div>
            <div class="favorites-empty-title">No favourites yet</div>
            <div class="favorites-empty-desc">
              Tap the ♡ heart on any devotional day to save it here.
            </div>
          </div>
        </div>
      </div>`;
    return;
  }

  const cardsHtml = favorites.map(fav => {
    const dayData = getDay(book, fav.day);
    const season = getSeasonForDay(fav.day);
    return `
      <div class="favorite-card" data-day="${fav.day}">
        <div class="favorite-card-header">
          <div class="favorite-card-meta">
            <span class="favorite-card-day">Day ${fav.day}</span>
            <span class="favorite-card-season">${SEASON_EMOJIS[season]} ${SEASON_LABELS[season]}</span>
          </div>
          <button class="favorite-card-remove" data-remove="${fav.day}" aria-label="Remove Day ${fav.day} from favourites">✕</button>
        </div>
        <div class="favorite-card-body" data-nav="${fav.day}" role="button" tabindex="0" aria-label="Open Day ${fav.day}">
          <div class="favorite-card-ref">${escapeHtml(dayData.scriptureRef)}</div>
          <div class="favorite-card-text">"${escapeHtml(dayData.scriptureText)}"</div>
          <div class="favorite-note-wrap">
            <textarea
              class="favorite-note-input"
              data-note="${fav.day}"
              aria-label="Personal note for Day ${fav.day}"
              placeholder="Add a personal note…"
              rows="2"
            >${escapeHtml(fav.note ?? '')}</textarea>
          </div>
        </div>
      </div>`;
  }).join('');

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">Favourites</h1>
          <p class="page-subtitle">${favorites.length} saved day${favorites.length !== 1 ? 's' : ''}</p>
        </div>
        <div class="favorites-layout">
          ${cardsHtml}
        </div>
      </div>
    </div>
  `;

  // Remove buttons
  main.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const day = parseInt(btn.dataset['remove'] ?? '', 10);
      if (isNaN(day)) return;
      if (!window.confirm(`Remove Day ${day} from favourites?`)) return;
      await removeFavorite(day);
      const card = main.querySelector<HTMLElement>(`.favorite-card[data-day="${day}"]`);
      card?.remove();
      showToast('Removed from favourites', { type: 'success', duration: 2000 });

      // If no cards left, show empty state
      if (!main.querySelector('.favorite-card')) {
        const layout = main.querySelector('.favorites-layout');
        if (layout) {
          layout.innerHTML = `
            <div class="favorites-empty">
              <div class="favorites-empty-icon">♡</div>
              <div class="favorites-empty-title">No favourites yet</div>
              <div class="favorites-empty-desc">Tap the ♡ heart on any devotional day to save it here.</div>
            </div>`;
        }
      }
    });
  });

  // Navigate to day (card body click / keyboard)
  main.querySelectorAll<HTMLElement>('[data-nav]').forEach(el => {
    el.addEventListener('click', e => {
      // Don't navigate if clicking the textarea
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
      const day = parseInt(el.dataset['nav'] ?? '', 10);
      if (!isNaN(day)) void router.navigate(ROUTES.DEVOTIONAL, { day });
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const day = parseInt(el.dataset['nav'] ?? '', 10);
        if (!isNaN(day)) void router.navigate(ROUTES.DEVOTIONAL, { day });
      }
    });
  });

  // Note auto-save (1.5s debounce)
  // Stop click/mousedown from bubbling to the [data-nav] parent so focusing
  // the textarea doesn't trigger navigation.
  main.querySelectorAll<HTMLTextAreaElement>('[data-note]').forEach(textarea => {
    textarea.addEventListener('click', e => e.stopPropagation());
    textarea.addEventListener('mousedown', e => e.stopPropagation());
    textarea.addEventListener('input', () => {
      const day = parseInt(textarea.dataset['note'] ?? '', 10);
      if (isNaN(day)) return;
      const existing = noteTimers.get(day);
      if (existing !== undefined) clearTimeout(existing);
      noteTimers.set(day, setTimeout(() => {
        void updateFavoriteNote(day, textarea.value);
      }, 1500));
    });
  });
}
