import type { RouteParams } from '../router/router';
import { router } from '../router/router';
import { ROUTES } from '../router/routes';
import { getQuizResults } from '../store/user';
import { escapeHtml, getMain } from '../utils/dom';
import { SEASON_LABELS, SEASON_EMOJIS, SEASON_IDS, type SeasonId } from '../types';

const SEASON_DESCRIPTIONS: Record<SeasonId, string> = {
  winter: "A season of waiting, rest, and deep trust in God's unseen work.",
  spring: 'A season of fresh starts, growth, and planting seeds of faith.',
  summer: "A season of flourishing, gratitude, and overflowing joy in God's goodness.",
  autumn: 'A season of harvest, release, and wise preparation for what comes next.',
};

const SEASON_VERSES: Record<SeasonId, string> = {
  winter: '"Be still, and know that I am God." — Psalm 46:10',
  spring: '"See, I am doing a new thing! Now it springs up; do you not perceive it?" — Isaiah 43:19',
  summer: '"The joy of the Lord is your strength." — Nehemiah 8:10',
  autumn: '"There is a time for everything, and a season for every activity under the heavens." — Ecclesiastes 3:1',
};

export async function renderIntro(params: RouteParams): Promise<void> {
  const main = getMain();
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner" aria-label="Loading…"></div></div>';

  // If a season page ID is passed, show the per-season intro
  if (typeof params.page === 'string' && (SEASON_IDS as readonly string[]).includes(params.page)) {
    renderSeasonIntro(main, params.page as SeasonId);
    return;
  }

  // Otherwise show the welcome intro
  const quizResults = await getQuizResults();
  const alreadyDone = quizResults !== null;

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="intro-layout">
          <div class="intro-hero">
            <div class="intro-hero-icon">🌿</div>
            <h1 class="intro-hero-title">Spiritual Seasons</h1>
            <p class="intro-hero-subtitle">
              A 120-day devotional journey through the rhythms of the spiritual life.
            </p>
          </div>

          <div class="intro-body">
            <p>
              Just as creation moves through winter, spring, summer, and autumn,
              our souls move through seasons too. This devotional walks alongside you —
              wherever you find yourself today.
            </p>
            <p>
              You'll begin with a short quiz to discover your current spiritual season,
              then journey through 30 days of scripture, reflection, and journaling
              tailored to that season.
            </p>
          </div>

          <div class="intro-season-grid">
            ${SEASON_IDS.map(s => `
              <div class="intro-season-card">
                <div class="intro-season-card-icon">${SEASON_EMOJIS[s]}</div>
                <div class="intro-season-card-name">${escapeHtml(SEASON_LABELS[s])}</div>
                <div class="intro-season-card-desc">${escapeHtml(SEASON_DESCRIPTIONS[s])}</div>
              </div>`).join('')}
          </div>

          <div class="intro-actions">
            <button class="btn btn-primary btn-full" id="btn-start-quiz">
              Discover My Season →
            </button>
            ${alreadyDone ? `
              <button class="btn btn-ghost btn-full" id="btn-go-home">
                Continue My Journey
              </button>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-start-quiz')?.addEventListener('click', () => {
    void router.navigate(ROUTES.QUIZ);
  });

  document.getElementById('btn-go-home')?.addEventListener('click', () => {
    void router.navigate(ROUTES.HOME);
  });
}

function renderSeasonIntro(main: HTMLElement, season: SeasonId): void {
  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="season-intro-layout">
          <div class="season-intro-icon">${SEASON_EMOJIS[season]}</div>
          <h1 class="season-intro-title">${escapeHtml(SEASON_LABELS[season])} Season</h1>
          <p class="season-intro-desc">${escapeHtml(SEASON_DESCRIPTIONS[season])}</p>
          <blockquote class="season-intro-verse">${escapeHtml(SEASON_VERSES[season])}</blockquote>
          <button class="btn btn-primary" id="btn-begin-season">
            Begin ${escapeHtml(SEASON_LABELS[season])} Season →
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-begin-season')?.addEventListener('click', () => {
    void router.navigate(ROUTES.DEVOTIONAL);
  });
}
