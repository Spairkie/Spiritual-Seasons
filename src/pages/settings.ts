import type { RouteParams } from '../router/router';

export async function renderSettings(_params: RouteParams): Promise<void> {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">Settings</h1>
        </div>
        <div class="page-placeholder">
          <div class="page-placeholder-icon">⚙️</div>
          <p class="page-placeholder-title">Settings</p>
          <p class="page-placeholder-desc">Dark mode, font size, Bible translation, notifications, and data management.</p>
          <p class="page-placeholder-desc" style="margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.6;">Coming in Phase 6</p>
        </div>
      </div>
    </div>
  `;
}
