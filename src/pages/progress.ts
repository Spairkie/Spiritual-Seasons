import type { RouteParams } from '../router/router';

export async function renderProgress(_params: RouteParams): Promise<void> {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">Progress</h1>
        </div>
        <div class="page-placeholder">
          <div class="page-placeholder-icon">📊</div>
          <p class="page-placeholder-title">Progress Dashboard</p>
          <p class="page-placeholder-desc">Streaks, milestones, season rings, and weekly completion view.</p>
          <p class="page-placeholder-desc" style="margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.6;">Coming in Phase 5</p>
        </div>
      </div>
    </div>
  `;
}
