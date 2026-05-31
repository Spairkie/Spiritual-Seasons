import type { RouteParams } from '../router/router';
import { router } from '../router/router';
import { ROUTES } from '../router/routes';
import { loadBookData } from '../content/loader';
import { getDay } from '../content/devotional';
import { getAllJournalEntries } from '../store/journal';
import { escapeHtml, getMain } from '../utils/dom';
import { SEASON_LABELS, SEASON_EMOJIS, getSeasonForDay } from '../types';
import type { BookData } from '../types';
import type { JournalEntry } from '../types';

type FilterType = 'all' | 'scripture' | 'reflection' | 'journal';

interface SearchResult {
  day: number;
  type: 'scripture' | 'reflection' | 'journal';
  ref: string;
  snippet: string;
  matchedOn: string;
}

let bookCache: BookData | null = null;
let journalCache: JournalEntry[] | null = null;
let activeFilter: FilterType = 'all';
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export async function renderSearch(_params: RouteParams): Promise<void> {
  const main = getMain();
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner" aria-label="Loading…"></div></div>';

  const [book, journalEntries] = await Promise.all([
    loadBookData(),
    getAllJournalEntries(),
  ]);
  bookCache = book;
  journalCache = journalEntries;
  activeFilter = 'all';

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">Search</h1>
        </div>

        <div class="search-layout">
          <div class="search-input-wrap">
            <span class="search-icon" aria-hidden="true">🔍</span>
            <input
              id="search-input"
              class="search-input"
              type="search"
              placeholder="Search scripture, reflections, journal…"
              aria-label="Search devotionals and journal entries"
              autocomplete="off"
            />
          </div>

          <div class="search-filters" role="group" aria-label="Filter search results">
            ${(['all', 'scripture', 'reflection', 'journal'] as FilterType[]).map(f => `
              <button class="filter-chip${f === 'all' ? ' is-active' : ''}"
                data-filter="${f}"
                aria-pressed="${f === 'all'}">
                ${f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>`).join('')}
          </div>

          <div id="search-results-area">
            <div class="search-empty">
              <div class="search-empty-icon">🔍</div>
              <p>Start typing to search 120 days of devotionals${journalEntries.length > 0 ? ' and your journal' : ''}.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const input = document.getElementById('search-input') as HTMLInputElement | null;
  const resultsArea = document.getElementById('search-results-area');

  // Filter chips
  main.querySelectorAll<HTMLButtonElement>('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeFilter = (chip.dataset['filter'] ?? 'all') as FilterType;
      main.querySelectorAll<HTMLButtonElement>('.filter-chip').forEach(c => {
        const active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      if (input && input.value.trim()) runSearch(input.value.trim(), resultsArea);
    });
  });

  // Search input with debounce + loading indicator
  input?.addEventListener('input', () => {
    const q = input.value.trim();
    if (debounceTimer !== null) clearTimeout(debounceTimer);

    if (q.length >= 2 && resultsArea) {
      resultsArea.innerHTML = '<div class="search-loading"><div class="loading-spinner" aria-label="Searching…"></div></div>';
    }

    debounceTimer = setTimeout(() => {
      if (q.length >= 2) {
        runSearch(q, resultsArea);
      } else if (resultsArea) {
        resultsArea.innerHTML = `
          <div class="search-empty">
            <div class="search-empty-icon">🔍</div>
            <p>Start typing to search 120 days of devotionals.</p>
          </div>`;
      }
    }, 250);
  });

  // Result click via delegation
  resultsArea?.addEventListener('click', e => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('[data-day]');
    if (!card) return;
    const day = parseInt(card.dataset['day'] ?? '', 10);
    if (!isNaN(day)) void router.navigate(ROUTES.DEVOTIONAL, { day });
  });
}

function runSearch(query: string, resultsArea: HTMLElement | null): void {
  if (!resultsArea || !bookCache) return;
  const results = buildResults(query);

  if (results.length === 0) {
    resultsArea.innerHTML = `
      <div class="search-empty">
        <div class="search-empty-icon">🔍</div>
        <p>No results for "<strong>${escapeHtml(query)}</strong>".</p>
      </div>`;
    return;
  }

  const countHtml = `<p class="search-results-count">${results.length} result${results.length !== 1 ? 's' : ''}</p>`;
  const cardsHtml = results.map(r => {
    const season = getSeasonForDay(r.day);
    return `
      <button class="search-result-card" data-day="${r.day}">
        <div class="search-result-meta">
          <span class="search-result-day">Day ${r.day}</span>
          <span class="search-result-season">${SEASON_EMOJIS[season]} ${SEASON_LABELS[season]}</span>
          <span class="search-result-type">${r.type}</span>
        </div>
        <div class="search-result-ref">${escapeHtml(r.ref)}</div>
        <div class="search-result-snippet">${highlightSnippet(r.snippet, query)}</div>
      </button>`;
  }).join('');

  resultsArea.innerHTML = `
    <div class="search-results">
      ${countHtml}
      ${cardsHtml}
    </div>`;
}

function buildResults(query: string): SearchResult[] {
  if (!bookCache) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (let day = 1; day <= 120; day++) {
    const dayData = getDay(bookCache, day);

    if (activeFilter === 'all' || activeFilter === 'scripture') {
      const haystack = `${dayData.scriptureRef} ${dayData.scriptureText}`.toLowerCase();
      if (haystack.includes(q)) {
        results.push({ day, type: 'scripture', ref: dayData.scriptureRef, snippet: dayData.scriptureText, matchedOn: 'scripture' });
      }
    }

    if (activeFilter === 'all' || activeFilter === 'reflection') {
      if (dayData.prompt.toLowerCase().includes(q)) {
        results.push({ day, type: 'reflection', ref: dayData.scriptureRef, snippet: dayData.prompt, matchedOn: 'reflection' });
      }
    }
  }

  if ((activeFilter === 'all' || activeFilter === 'journal') && journalCache) {
    for (const entry of journalCache) {
      if (entry.content.toLowerCase().includes(q)) {
        const dayData = getDay(bookCache, entry.day);
        results.push({
          day: entry.day,
          type: 'journal',
          ref: dayData.scriptureRef,
          snippet: entry.content,
          matchedOn: 'journal',
        });
      }
    }
  }

  // Sort by day then type priority
  results.sort((a, b) => a.day - b.day || a.type.localeCompare(b.type));
  return results;
}

function highlightSnippet(text: string, query: string): string {
  const escaped = escapeHtml(text);
  const qEscaped = escapeHtml(query);
  // Case-insensitive highlight
  const re = new RegExp(`(${qEscaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return escaped.replace(re, '<mark>$1</mark>');
}
