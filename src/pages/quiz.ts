import type { RouteParams } from '../router/router';
import { router } from '../router/router';
import { ROUTES } from '../router/routes';
import { loadQuizData } from '../content/loader';
import { calculateResults, resolveTie, isTieResult } from '../content/quiz-engine';
import { saveQuizResults } from '../store/user';
import { escapeHtml, getMain } from '../utils/dom';
import { SEASON_LABELS, SEASON_EMOJIS, type SeasonId } from '../types';
import type { QuizData, QuizScores } from '../types';

interface QuizState {
  data: QuizData;
  questions: Array<{ seasonId: SeasonId; text: string }>;
  answers: Array<number | null>;
  currentQ: number;
}

let state: QuizState | null = null;

export async function renderQuiz(_params: RouteParams): Promise<void> {
  const main = getMain();
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner" aria-label="Loading…"></div></div>';

  const data = await loadQuizData();

  const questions: QuizState['questions'] = [];
  for (const season of data.seasons) {
    for (const q of season.questions) {
      questions.push({ seasonId: season.id as SeasonId, text: q.text });
    }
  }

  state = {
    data,
    questions,
    answers: new Array(questions.length).fill(null) as Array<number | null>,
    currentQ: 0,
  };

  renderQuestion(main);
}

function computeScores(s: QuizState): QuizScores {
  const scores: QuizScores = { winter: 0, spring: 0, summer: 0, autumn: 0 };
  for (let i = 0; i < s.questions.length; i++) {
    const q = s.questions[i];
    const a = s.answers[i];
    if (q && a !== null) {
      scores[q.seasonId] += a;
    }
  }
  return scores;
}

function renderQuestion(main: HTMLElement): void {
  if (!state) return;
  const { questions, currentQ, data, answers } = state;
  const total = questions.length;
  const q = questions[currentQ];
  if (!q) return;

  const progress = Math.round((currentQ / total) * 100);
  const currentAnswer = answers[currentQ];
  const isLast = currentQ === total - 1;

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="quiz-layout">
          <div class="quiz-progress-bar" role="progressbar"
            aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"
            aria-label="${currentQ} of ${total} questions answered">
            <div class="quiz-progress-fill" style="width:${progress}%"></div>
          </div>
          <div class="quiz-step-label">${currentQ + 1} of ${total}</div>

          <div class="quiz-season-heading">${SEASON_EMOJIS[q.seasonId]} ${escapeHtml(SEASON_LABELS[q.seasonId])}</div>

          <div class="quiz-question-block">
            <p class="quiz-question-text">${escapeHtml(q.text)}</p>
            <div class="likert-scale" role="radiogroup" aria-label="${escapeHtml(q.text)}">
              ${Object.entries(data.scale.labels).map(([val, label]) => {
                const selected = currentAnswer === parseInt(val, 10);
                return `
                  <button class="likert-option${selected ? ' is-selected' : ''}"
                    data-value="${val}" role="radio" aria-checked="${selected}"
                    aria-label="${val} — ${escapeHtml(label)}">
                    <span class="likert-value">${val}</span>
                    <span class="likert-label">${escapeHtml(label)}</span>
                  </button>`;
              }).join('')}
            </div>
          </div>

          <div class="quiz-nav">
            ${currentQ > 0
              ? '<button class="btn btn-ghost btn-sm" id="btn-back">← Back</button>'
              : '<span></span>'}
            ${currentAnswer !== null ? `
              <button class="btn btn-secondary btn-sm" id="btn-next">
                ${isLast ? 'See Results →' : 'Next →'}
              </button>` : '<span></span>'}
          </div>
        </div>
      </div>
    </div>
  `;

  main.querySelectorAll<HTMLButtonElement>('.likert-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!state) return;
      const value = parseInt(btn.dataset['value'] ?? '0', 10);
      state.answers[currentQ] = value;

      // Highlight selection immediately
      main.querySelectorAll<HTMLButtonElement>('.likert-option').forEach(b => {
        const selected = b === btn;
        b.classList.toggle('is-selected', selected);
        b.setAttribute('aria-checked', String(selected));
      });

      // Auto-advance after brief visual feedback
      setTimeout(() => {
        if (!state) return;
        state.currentQ++;
        if (state.currentQ >= state.questions.length) {
          finishQuiz(main);
        } else {
          renderQuestion(main);
        }
      }, 280);
    });
  });

  document.getElementById('btn-back')?.addEventListener('click', () => {
    if (!state || state.currentQ === 0) return;
    state.currentQ--;
    renderQuestion(main);
  });

  document.getElementById('btn-next')?.addEventListener('click', () => {
    if (!state) return;
    state.currentQ++;
    if (state.currentQ >= state.questions.length) {
      finishQuiz(main);
    } else {
      renderQuestion(main);
    }
  });
}

function finishQuiz(main: HTMLElement): void {
  if (!state) return;
  const scores = computeScores(state);
  const result = calculateResults(state.data, scores);

  if (isTieResult(result)) {
    renderTiebreaker(main, result.tied, scores, state.data);
  } else {
    void saveQuizResults(result).then(() => {
      renderResults(main, result.seasonId, state?.data ?? null);
    });
  }
}

function renderTiebreaker(main: HTMLElement, tied: SeasonId[], scores: QuizScores, data: QuizData): void {
  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="quiz-layout">
          <h1 class="tiebreaker-heading">It's a tie!</h1>
          <p class="tiebreaker-desc">
            You resonate equally with a few seasons. Choose the one that feels most true to where you are right now.
          </p>
          <div class="tiebreaker-options">
            ${tied.map(s => {
              const seasonData = data.seasons.find(d => d.id === s);
              return `
                <button class="tiebreaker-btn" data-season="${s}">
                  <span class="tiebreaker-icon">${SEASON_EMOJIS[s]}</span>
                  <span>
                    <div class="tiebreaker-name">${escapeHtml(SEASON_LABELS[s])}</div>
                    <div class="tiebreaker-season-desc">${escapeHtml(seasonData?.description ?? '')}</div>
                  </span>
                </button>`;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  main.querySelectorAll<HTMLButtonElement>('.tiebreaker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const season = btn.dataset['season'] as SeasonId;
      const result = resolveTie(season, scores);
      void saveQuizResults(result).then(() => {
        renderResults(main, season, data);
      });
    });
  });
}

function renderResults(main: HTMLElement, seasonId: SeasonId, data: QuizData | null): void {
  const result = data?.results[seasonId];

  main.innerHTML = `
    <div class="page">
      <div class="page-content">
        <div class="quiz-result-layout">
          <div class="quiz-result-icon">${SEASON_EMOJIS[seasonId]}</div>
          <h1 class="quiz-result-title">${escapeHtml(result?.title ?? `${SEASON_LABELS[seasonId]} Season`)}</h1>
          <p class="quiz-result-message">${escapeHtml(result?.message ?? '')}</p>
          <blockquote class="quiz-result-encouragement">${escapeHtml(result?.encouragement ?? '')}</blockquote>
          <div class="quiz-result-actions">
            <button class="btn btn-primary" id="btn-begin-journey">Begin My Journey →</button>
            <button class="btn btn-ghost" id="btn-retake">Retake Quiz</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-begin-journey')?.addEventListener('click', () => {
    void router.navigate(ROUTES.INTRO, { page: seasonId });
  });

  document.getElementById('btn-retake')?.addEventListener('click', () => {
    void router.navigate(ROUTES.QUIZ);
  });
}
