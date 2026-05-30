import type { RouteParams } from '../router/router';

export async function renderHome(_params: RouteParams): Promise<void> {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">Good morning</h1>
          <p class="page-subtitle">Ready for today's devotional?</p>
        </div>
        <div class="page-placeholder">
          <div class="page-placeholder-icon">🏠</div>
          <p class="page-placeholder-title">Home</p>
          <p class="page-placeholder-desc">Dashboard with today's devotional, progress, and wellness tools.</p>
          <p class="page-placeholder-desc" style="margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.6;">Coming in Phase 3</p>
        </div>
      </div>
    </div>
  `;
}
