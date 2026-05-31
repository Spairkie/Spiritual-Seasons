import type { RouteParams } from '../router/router';
import { getAllJournalEntries, clearAllJournal } from '../store/journal';
import { getAllProgress, clearAllProgress } from '../store/progress';
import { getAllFavorites, clearAllFavorites } from '../store/favorites';
import { getStreakData, resetStreaks } from '../store/streaks';
import { getSettings, resetSettings } from '../store/settings';
import { getQuizResults, resetUserData } from '../store/user';
import { getMain } from '../utils/dom';
import { showToast } from '../ui/toast';

interface ExportData {
  exportedAt: string;
  version: 1;
  journal: Awaited<ReturnType<typeof getAllJournalEntries>>;
  progress: Awaited<ReturnType<typeof getAllProgress>>;
  favorites: Awaited<ReturnType<typeof getAllFavorites>>;
  streaks: Awaited<ReturnType<typeof getStreakData>>;
  settings: Awaited<ReturnType<typeof getSettings>>;
  quizResults: Awaited<ReturnType<typeof getQuizResults>>;
}

export async function renderPrivacy(_params: RouteParams): Promise<void> {
  const main = getMain();
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner" aria-label="Loading…"></div></div>';

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">Privacy &amp; Data</h1>
        </div>

        <div class="privacy-layout">

          <div class="privacy-notice">
            <div class="privacy-notice-icon">🔒</div>
            <div class="privacy-notice-text">
              <strong>All your data stays on your device.</strong> Spiritual Seasons stores
              your journal entries, progress, and settings in your browser's local storage
              (IndexedDB). Nothing is sent to any server.
            </div>
          </div>

          <div class="data-action-card">
            <div class="data-action-info">
              <h3>Export My Data</h3>
              <p>Download all your journal entries, progress, favourites, and settings as a JSON file.</p>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-export">Export</button>
          </div>

          <div class="data-action-card">
            <div class="data-action-info">
              <h3>Import Data</h3>
              <p>Restore from a previously exported JSON file. This will merge with existing data.</p>
            </div>
            <label class="btn btn-secondary btn-sm" style="cursor:pointer">
              Import
              <input type="file" id="input-import" accept=".json" style="display:none" aria-label="Import data file" />
            </label>
          </div>

          <div class="settings-danger">
            <div class="settings-group-label">Danger Zone</div>

            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-label">Clear Journal</div>
                <div class="settings-row-desc">Delete all journal entries permanently</div>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-clear-journal">Clear</button>
            </div>

            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-label">Reset Progress</div>
                <div class="settings-row-desc">Clear all day completions and streaks</div>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-reset-progress">Reset</button>
            </div>

            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-label">Reset Everything</div>
                <div class="settings-row-desc">Delete all data and start fresh — cannot be undone</div>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-reset-all">Reset All</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-export')?.addEventListener('click', async () => {
    const [journal, progress, favorites, streaks, settings, quizResults] = await Promise.all([
      getAllJournalEntries(),
      getAllProgress(),
      getAllFavorites(),
      getStreakData(),
      getSettings(),
      getQuizResults(),
    ]);

    const data: ExportData = {
      exportedAt: new Date().toISOString(),
      version: 1,
      journal,
      progress,
      favorites,
      streaks,
      settings,
      quizResults,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spiritual-seasons-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported', { type: 'success' });
  });

  const importInput = document.getElementById('input-import') as HTMLInputElement | null;
  importInput?.addEventListener('change', () => {
    const file = importInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as ExportData;
        if (data.version !== 1) throw new Error('Unknown backup version');
        showToast(`Import file loaded (version ${data.version}) — full restore coming in a future update`, { type: 'info', duration: 4000 });
      } catch {
        showToast('Could not read backup file — make sure it was exported from this app', { type: 'error' });
      }
      importInput.value = '';
    };
    reader.readAsText(file);
  });

  document.getElementById('btn-clear-journal')?.addEventListener('click', async () => {
    if (!confirm('Delete all journal entries? This cannot be undone.')) return;
    await clearAllJournal();
    showToast('Journal cleared', { type: 'success' });
  });

  document.getElementById('btn-reset-progress')?.addEventListener('click', async () => {
    if (!confirm('Reset all progress and streaks? This cannot be undone.')) return;
    await Promise.all([clearAllProgress(), resetStreaks()]);
    showToast('Progress and streaks reset', { type: 'success' });
  });

  document.getElementById('btn-reset-all')?.addEventListener('click', async () => {
    if (!confirm('Delete ALL data and start over? This cannot be undone.')) return;
    await Promise.all([
      clearAllJournal(),
      clearAllProgress(),
      clearAllFavorites(),
      resetStreaks(),
      resetSettings(),
      resetUserData(),
    ]);
    showToast('All data cleared — reloading…', { type: 'info' });
    setTimeout(() => window.location.reload(), 1500);
  });
}
