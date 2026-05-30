import type { RouteParams } from '../router/router';

export async function renderTOC(_params: RouteParams): Promise<void> {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">All 120 Days</h1>
          <p class="page-subtitle">Browse every devotional by season.</p>
        </div>
        <div class="page-placeholder">
          <div class="page-placeholder-icon">📋</div>
          <p class="page-placeholder-title">Table of Contents</p>
          <p class="page-placeholder-desc">120 days grouped by season, with completion, favourite, journal, and audio indicators.</p>
          <p class="page-placeholder-desc" style="margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.6;">Coming in Phase 3</p>
        </div>
      </div>
    </div>
  `;
}
