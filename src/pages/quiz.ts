import type { RouteParams } from '../router/router';

export async function renderQuiz(_params: RouteParams): Promise<void> {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">Discover Your Season</h1>
          <p class="page-subtitle">A short quiz to find your spiritual season.</p>
        </div>
        <div class="page-placeholder">
          <div class="page-placeholder-icon">🌿</div>
          <p class="page-placeholder-title">Season Quiz</p>
          <p class="page-placeholder-desc">Likert-scale questions across four seasons with tiebreaker flow.</p>
          <p class="page-placeholder-desc" style="margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.6;">Coming in Phase 4</p>
        </div>
      </div>
    </div>
  `;
}
