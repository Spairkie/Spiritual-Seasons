import type { RouteParams } from '../router/router';

export async function renderDevotional(params: RouteParams): Promise<void> {
  const main = document.getElementById('main-content');
  if (!main) return;

  const day = params.day ?? 1;

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">Day ${day}</h1>
        </div>
        <div class="page-placeholder">
          <div class="page-placeholder-icon">📖</div>
          <p class="page-placeholder-title">Daily Devotional</p>
          <p class="page-placeholder-desc">Scripture, reflection prompt, and journal for Day ${day}.</p>
          <p class="page-placeholder-desc" style="margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.6;">Coming in Phase 3</p>
        </div>
      </div>
    </div>
  `;
}
