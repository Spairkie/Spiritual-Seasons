import type { RouteParams } from '../router/router';
import { getWeeklyReflection, saveWeeklyReflection, getAllReflections } from '../store/reflections';
import { getCurrentDay } from '../store/user';
import { escapeHtml, getMain } from '../utils/dom';
import { formatTimeAgo } from '../utils/date';

const WEEKLY_PROMPTS = [
  'What was God teaching you this week through scripture and your daily readings?',
  'Where did you sense God\'s presence most clearly? What was happening?',
  'What are you grateful for this week? Name at least three specific things.',
  'Is there anything you need to release or surrender to God right now?',
  'How have you grown spiritually in the past seven days?',
  'What prayer has God been answering — even partially or unexpectedly?',
  'Who in your life needs prayer this week, and what do they need?',
  'What truth from this week\'s devotionals has stayed with you the most?',
  'Where do you feel called to step out in faith right now?',
  'How is your season of life reflected in how you experience God right now?',
  'What habit or practice is helping your faith grow this season?',
  'What feels unfinished or unresolved? Bring it before God in prayer.',
  'Looking back over this week, where did you see grace at work?',
  'What word or phrase from scripture has echoed in your mind this week?',
  'As you end this week, what do you want to carry into the next one?',
  'What has been hard this week, and how has faith helped you through it?',
  'Where have you experienced joy, beauty, or wonder this week?',
];

function getPromptForWeek(week: number): string {
  const idx = (week - 1) % WEEKLY_PROMPTS.length;
  return WEEKLY_PROMPTS[idx] ?? WEEKLY_PROMPTS[0]!;
}

let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
let currentWeekGlobal = 1;
let viewWeekGlobal = 1;

export async function renderReflections(_params: RouteParams): Promise<void> {
  if (autoSaveTimer !== null) { clearTimeout(autoSaveTimer); autoSaveTimer = null; }

  const main = getMain();
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner" aria-label="Loading…"></div></div>';

  const currentDay = await getCurrentDay();
  currentWeekGlobal = Math.max(1, Math.ceil(currentDay / 7));
  viewWeekGlobal = currentWeekGlobal;

  await renderWeekView(main, currentWeekGlobal, currentWeekGlobal);
}

async function renderWeekView(main: HTMLElement, viewWeek: number, currentWeek: number): Promise<void> {
  if (autoSaveTimer !== null) { clearTimeout(autoSaveTimer); autoSaveTimer = null; }

  const [reflection, allReflections] = await Promise.all([
    getWeeklyReflection(viewWeek),
    getAllReflections(),
  ]);

  const prompt = getPromptForWeek(viewWeek);
  const existing = reflection?.responses[0] ?? '';
  const saved = reflection ? `Saved ${formatTimeAgo(reflection.updatedAt)}` : '';
  const isCurrentWeek = viewWeek === currentWeek;

  // Weeks that have saved data (excluding the viewed week)
  const savedWeeks = allReflections
    .filter(r => r.week !== viewWeek && r.responses[0])
    .sort((a, b) => b.week - a.week)
    .slice(0, 5);

  const pastHtml = savedWeeks.map(r => {
    const weekPrompt = getPromptForWeek(r.week);
    return `
      <div class="reflection-history-item">
        <div class="reflection-history-week">Week ${r.week}</div>
        <div class="reflection-history-prompt">${escapeHtml(weekPrompt)}</div>
        <div class="reflection-history-text">${escapeHtml(r.responses[0] ?? '')}</div>
        <div class="reflection-history-meta">${formatTimeAgo(r.updatedAt)}</div>
      </div>`;
  }).join('');

  const weekLabel = isCurrentWeek
    ? `Week ${viewWeek} · Current`
    : `Week ${viewWeek}`;

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">Weekly Reflection</h1>
        </div>

        <div class="reflection-week-nav" role="navigation" aria-label="Week navigation">
          <button class="btn btn-ghost btn-sm reflection-week-prev" id="btn-week-prev"
            aria-label="Previous week"
            ${viewWeek <= 1 ? 'disabled' : ''}>
            ← Prev
          </button>
          <span class="reflection-week-label">${escapeHtml(weekLabel)}</span>
          <button class="btn btn-ghost btn-sm reflection-week-next" id="btn-week-next"
            aria-label="Next week"
            ${viewWeek >= currentWeek ? 'disabled' : ''}>
            Next →
          </button>
        </div>

        <div class="reflection-current-block">
          <div class="reflection-label">This Week's Question</div>
          <p class="reflection-prompt u-mb-4">${escapeHtml(prompt)}</p>

          <div class="journal-header">
            <label class="journal-label" for="reflection-textarea">Your Reflection</label>
            <span class="journal-save-indicator" id="refl-save-indicator" aria-live="polite">${escapeHtml(saved)}</span>
          </div>
          <textarea
            id="reflection-textarea"
            class="journal-textarea"
            aria-label="Weekly reflection for week ${viewWeek}"
            placeholder="Write your thoughts here…"
            rows="6"
          >${escapeHtml(existing)}</textarea>
        </div>

        ${pastHtml ? `
        <div class="u-mt-8">
          <div class="section-heading">Past Reflections</div>
          <div class="reflection-history">
            ${pastHtml}
          </div>
        </div>` : ''}
      </div>
    </div>
  `;

  document.getElementById('btn-week-prev')?.addEventListener('click', () => {
    if (viewWeek <= 1) return;
    viewWeekGlobal = viewWeek - 1;
    void renderWeekView(main, viewWeekGlobal, currentWeek);
  });

  document.getElementById('btn-week-next')?.addEventListener('click', () => {
    if (viewWeek >= currentWeek) return;
    viewWeekGlobal = viewWeek + 1;
    void renderWeekView(main, viewWeekGlobal, currentWeek);
  });

  const textarea = document.getElementById('reflection-textarea') as HTMLTextAreaElement | null;
  const indicator = document.getElementById('refl-save-indicator');

  textarea?.addEventListener('input', () => {
    if (indicator) { indicator.textContent = 'Unsaved…'; indicator.className = 'journal-save-indicator'; }
    if (autoSaveTimer !== null) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(async () => {
      if (!textarea) return;
      if (indicator) { indicator.textContent = 'Saving…'; indicator.className = 'journal-save-indicator is-saving'; }
      await saveWeeklyReflection(viewWeek, [textarea.value]);
      if (indicator) { indicator.textContent = 'Saved'; indicator.className = 'journal-save-indicator is-saved'; }
    }, 2000);
  });
}
