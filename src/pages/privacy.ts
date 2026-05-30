import type { RouteParams } from '../router/router';

export async function renderPrivacy(_params: RouteParams): Promise<void> {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">Privacy &amp; Data</h1>
        </div>
        <div class="page-placeholder">
          <div class="page-placeholder-icon">🔒</div>
          <p class="page-placeholder-title">Your Data</p>
          <p class="page-placeholder-desc">Export, import, and manage your devotional data. All data stays on your device.</p>
          <p class="page-placeholder-desc" style="margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.6;">Coming in Phase 6</p>
        </div>
      </div>
    </div>
  `;
}
