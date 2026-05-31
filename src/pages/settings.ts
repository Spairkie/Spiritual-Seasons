import type { RouteParams } from '../router/router';
import { router } from '../router/router';
import { ROUTES } from '../router/routes';
import { getSettings, saveSetting } from '../store/settings';
import { getMain } from '../utils/dom';
import { themeManager } from '../ui/theme-manager';
import { showToast } from '../ui/toast';
import { getCurrentDay } from '../store/user';
import type { DarkMode, FontSize, LineSpacing, BibleTranslation, SeasonTheme } from '../types';
import { SEASON_IDS, SEASON_LABELS } from '../types';

const TRANSLATIONS: BibleTranslation[] = ['NLT', 'NIV', 'KJV', 'NKJV', 'ESV', 'NASB', 'MSG'];

export async function renderSettings(_params: RouteParams): Promise<void> {
  const main = getMain();
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner" aria-label="Loading…"></div></div>';

  const settings = await getSettings();

  const themeOptions: Array<{ value: SeasonTheme; label: string }> = [
    { value: 'auto', label: 'Auto (follow day)' },
    ...SEASON_IDS.map(s => ({ value: s as SeasonTheme, label: SEASON_LABELS[s] })),
  ];

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">Settings</h1>
        </div>

        <div class="settings-layout">

          <!-- Appearance -->
          <div class="settings-group-label">Appearance</div>
          <div class="settings-group">

            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-label">Colour Mode</div>
              </div>
              <div class="segment-control" role="group" aria-label="Colour mode">
                ${(['system', 'light', 'dark'] as DarkMode[]).map(m => `
                  <button class="segment-btn${settings.darkMode === m ? ' is-active' : ''}"
                    data-dark-mode="${m}" aria-pressed="${settings.darkMode === m}">
                    ${m === 'system' ? 'Auto' : m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>`).join('')}
              </div>
            </div>

            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-label">Season Theme</div>
                <div class="settings-row-desc">Colours used throughout the app</div>
              </div>
              <select class="settings-select" id="select-season-theme" aria-label="Season theme">
                ${themeOptions.map(o => `
                  <option value="${o.value}"${settings.seasonTheme === o.value ? ' selected' : ''}>${o.label}</option>`).join('')}
              </select>
            </div>

            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-label">Font Size</div>
              </div>
              <select class="settings-select" id="select-font-size" aria-label="Font size">
                ${(['small', 'medium', 'large', 'extra-large'] as FontSize[]).map(s => `
                  <option value="${s}"${settings.fontSize === s ? ' selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
              </select>
            </div>

            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-label">Line Spacing</div>
              </div>
              <select class="settings-select" id="select-line-spacing" aria-label="Line spacing">
                ${(['compact', 'normal', 'relaxed', 'loose'] as LineSpacing[]).map(s => `
                  <option value="${s}"${settings.lineSpacing === s ? ' selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
              </select>
            </div>

          </div>

          <!-- Reading -->
          <div class="settings-group-label">Reading</div>
          <div class="settings-group">

            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-label">Bible Translation</div>
              </div>
              <select class="settings-select" id="select-translation" aria-label="Bible translation">
                ${TRANSLATIONS.map(t => `
                  <option value="${t}"${settings.bibleTranslation === t ? ' selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>

            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-label">Auto-save Journal</div>
                <div class="settings-row-desc">Save while you type (2-second delay)</div>
              </div>
              <label class="toggle-wrap" aria-label="Auto-save journal">
                <input type="checkbox" class="toggle-input" id="toggle-autosave"${settings.autoSave ? ' checked' : ''} />
                <span class="toggle-track"></span>
              </label>
            </div>

          </div>

          <!-- Data -->
          <div class="settings-group-label">Data</div>
          <div class="settings-group">
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-label">Privacy &amp; Data Management</div>
                <div class="settings-row-desc">Export, import, and manage your data</div>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-go-privacy">Manage →</button>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-label">Retake Season Quiz</div>
                <div class="settings-row-desc">Discover a new season — your journal and progress are kept</div>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-retake-quiz">Retake →</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  // Dark mode segment
  main.querySelectorAll<HTMLButtonElement>('[data-dark-mode]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const mode = btn.dataset['darkMode'] as DarkMode;
      await saveSetting('darkMode', mode);
      themeManager.applyDarkMode(mode);
      main.querySelectorAll<HTMLButtonElement>('[data-dark-mode]').forEach(b => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      showToast('Colour mode updated', { type: 'success', duration: 1500 });
    });
  });

  // Season theme
  const seasonSelect = document.getElementById('select-season-theme') as HTMLSelectElement | null;
  seasonSelect?.addEventListener('change', async () => {
    const theme = seasonSelect.value as SeasonTheme;
    await saveSetting('seasonTheme', theme);
    const currentDay = await getCurrentDay();
    themeManager.applySeasonTheme(theme, currentDay);
    showToast('Theme updated', { type: 'success', duration: 1500 });
  });

  // Font size
  const fontSelect = document.getElementById('select-font-size') as HTMLSelectElement | null;
  fontSelect?.addEventListener('change', async () => {
    const size = fontSelect.value as FontSize;
    await saveSetting('fontSize', size);
    themeManager.applyFontSize(size);
    showToast('Font size updated', { type: 'success', duration: 1500 });
  });

  // Line spacing
  const spacingSelect = document.getElementById('select-line-spacing') as HTMLSelectElement | null;
  spacingSelect?.addEventListener('change', async () => {
    const spacing = spacingSelect.value as LineSpacing;
    await saveSetting('lineSpacing', spacing);
    themeManager.applyLineSpacing(spacing);
    showToast('Line spacing updated', { type: 'success', duration: 1500 });
  });

  // Bible translation
  const translationSelect = document.getElementById('select-translation') as HTMLSelectElement | null;
  translationSelect?.addEventListener('change', async () => {
    const translation = translationSelect.value as BibleTranslation;
    await saveSetting('bibleTranslation', translation);
    showToast('Translation updated', { type: 'success', duration: 1500 });
  });

  // Auto-save toggle
  const autosaveToggle = document.getElementById('toggle-autosave') as HTMLInputElement | null;
  autosaveToggle?.addEventListener('change', async () => {
    await saveSetting('autoSave', autosaveToggle.checked);
    showToast(autosaveToggle.checked ? 'Auto-save enabled' : 'Auto-save disabled', { type: 'success', duration: 1500 });
  });

  // Retake quiz (keeps journal/progress)
  document.getElementById('btn-retake-quiz')?.addEventListener('click', () => {
    void router.navigate(ROUTES.QUIZ);
  });

  // Privacy link
  document.getElementById('btn-go-privacy')?.addEventListener('click', () => {
    void router.navigate(ROUTES.PRIVACY);
  });
}
