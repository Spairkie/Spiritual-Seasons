import type { RouteParams } from '../router/router';

export async function renderIntro(_params: RouteParams): Promise<void> {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">Welcome</h1>
          <p class="page-subtitle">Introduction to Spiritual Seasons</p>
        </div>
        <div class="page-placeholder">
          <div class="page-placeholder-icon">✨</div>
          <p class="page-placeholder-title">Introduction</p>
          <p class="page-placeholder-desc">Multi-page intro carousel with welcome, author bio, and season overviews.</p>
          <p class="page-placeholder-desc" style="margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.6;">Coming in Phase 4</p>
        </div>
      </div>
    </div>
  `;
}
