import type { RouteParams } from '../router/router';
import { router } from '../router/router';
import { ROUTES } from '../router/routes';
import { getCompletedDaysCount, getAllProgress } from '../store/progress';
import { getStreakData } from '../store/streaks';
import { getMain } from '../utils/dom';
import { SEASON_IDS, SEASON_LABELS, SEASON_EMOJIS, SEASON_DAY_RANGES } from '../types';

const MILESTONE_DAYS = [7, 14, 30, 60, 90, 120];
const MILESTONE_LABELS: Record<number, string> = {
  7: '1 Week',
  14: '2 Weeks',
  30: '1 Month',
  60: '2 Months',
  90: '3 Months',
  120: 'Full Journey',
};

export async function renderProgress(_params: RouteParams): Promise<void> {
  const main = getMain();
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner" aria-label="Loading…"></div></div>';

  const [completedCount, allProgress, streakData] = await Promise.all([
    getCompletedDaysCount(),
    getAllProgress(),
    getStreakData(),
  ]);

  const totalDays = 120;
  const overallPct = Math.round((completedCount / totalDays) * 100);

  const seasonCounts: Record<string, number> = {};
  for (const season of SEASON_IDS) {
    const range = SEASON_DAY_RANGES[season];
    seasonCounts[season] = allProgress.filter(
      p => p.completed && p.day >= range.start && p.day <= range.end
    ).length;
  }

  const seasonRingsHtml = SEASON_IDS.map(season => {
    const count = seasonCounts[season] ?? 0;
    const pct = Math.round((count / 30) * 100);
    return `
      <div class="season-ring-row">
        <span class="season-ring-label">${SEASON_EMOJIS[season]} ${SEASON_LABELS[season]}</span>
        <div class="season-ring-track" role="progressbar"
          aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
          aria-label="${SEASON_LABELS[season]}: ${count} of 30 days">
          <div class="season-ring-fill" style="width:${pct}%"></div>
        </div>
        <span class="season-ring-count">${count}/30</span>
      </div>`;
  }).join('');

  const milestonesHtml = MILESTONE_DAYS.map(m => {
    const earned = streakData.milestones.includes(m);
    return `
      <span class="milestone-badge ${earned ? 'earned' : 'unearned'}"
        aria-label="${MILESTONE_LABELS[m] ?? ''}${earned ? ' — earned' : ''}">
        ${earned ? '🏅' : '○'} ${MILESTONE_LABELS[m] ?? m}
      </span>`;
  }).join('');

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">My Journey</h1>
        </div>

        <div class="progress-layout">

          <div class="progress-stats">
            <div class="stat-card">
              <div class="stat-card-value">${completedCount}</div>
              <div class="stat-card-label">Days Done</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-value">${totalDays - completedCount}</div>
              <div class="stat-card-label">Days Left</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-value">${streakData.currentStreak}</div>
              <div class="stat-card-label">Current Streak</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-value">${streakData.longestStreak}</div>
              <div class="stat-card-label">Longest Streak</div>
            </div>
          </div>

          <div class="season-rings">
            <div class="section-heading">Overall — ${overallPct}%</div>
            <div class="season-ring-row">
              <span class="season-ring-label">All 120</span>
              <div class="season-ring-track" role="progressbar"
                aria-valuenow="${overallPct}" aria-valuemin="0" aria-valuemax="100"
                aria-label="${completedCount} of 120 days complete">
                <div class="season-ring-fill" style="width:${overallPct}%"></div>
              </div>
              <span class="season-ring-count">${completedCount}/120</span>
            </div>
          </div>

          <div class="season-rings">
            <div class="section-heading">By Season</div>
            <div class="season-ring-list">${seasonRingsHtml}</div>
          </div>

          ${streakData.currentStreak > 0 ? `
          <div class="streak-block">
            <div class="streak-flame">🔥</div>
            <div>
              <div class="streak-info-label">Current Streak</div>
              <div class="streak-info-value">${streakData.currentStreak} day${streakData.currentStreak !== 1 ? 's' : ''}</div>
            </div>
            <div style="margin-left:auto">
              <div class="streak-info-label">Best</div>
              <div class="streak-info-value">${streakData.longestStreak}</div>
            </div>
          </div>` : ''}

          <div class="milestones-block">
            <div class="section-heading">Milestones</div>
            <div class="milestone-list">${milestonesHtml}</div>
          </div>

          <div style="text-align:center;padding-bottom:var(--space-6)">
            <button class="btn btn-primary" id="btn-continue">Continue My Journey →</button>
          </div>

        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-continue')?.addEventListener('click', () => {
    void router.navigate(ROUTES.DEVOTIONAL);
  });
}
