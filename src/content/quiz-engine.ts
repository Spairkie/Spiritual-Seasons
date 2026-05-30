import type { QuizData, QuizResults, QuizScores, SeasonId } from '../types';

export function calculateResults(_data: QuizData, scores: QuizScores): QuizResults | { tied: SeasonId[] } {
  const max = Math.max(...Object.values(scores));
  const winners = (Object.keys(scores) as SeasonId[]).filter((s) => scores[s] === max);

  if (winners.length > 1) {
    return { tied: winners };
  }

  return {
    seasonId: winners[0] as SeasonId,
    scores,
    completedAt: new Date().toISOString(),
  };
}

export function resolveTie(tiedSeason: SeasonId, scores: QuizScores): QuizResults {
  return {
    seasonId: tiedSeason,
    scores,
    completedAt: new Date().toISOString(),
  };
}

export function isTieResult(
  result: QuizResults | { tied: SeasonId[] }
): result is { tied: SeasonId[] } {
  return 'tied' in result;
}

export function getQuestionsForSeason(data: QuizData, seasonId: SeasonId) {
  const season = data.seasons.find((s) => s.id === seasonId);
  if (!season) throw new Error(`Season ${seasonId} not found in quiz data`);
  return season.questions;
}
