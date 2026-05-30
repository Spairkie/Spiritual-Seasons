import type { RouteParams } from '../router/router';

export async function renderSearch(_params: RouteParams): Promise<void> {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">Search</h1>
        </div>
        <div class="page-placeholder">
          <div class="page-placeholder-icon">🔍</div>
          <p class="page-placeholder-title">Search</p>
          <p class="page-placeholder-desc">Full-text search across scripture, prompts, and journal entries with filter chips.</p>
          <p class="page-placeholder-desc" style="margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.6;">Coming in Phase 5</p>
        </div>
      </div>
    </div>
  `;
}
