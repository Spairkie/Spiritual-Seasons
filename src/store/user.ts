import { getDB } from './db';
import type { UserRecord, SeasonId, QuizResults } from '../types';

const USER_KEY = 'user';

const DEFAULT_USER: UserRecord = {
  quizResults: null,
  seasonId: null,
  startDate: null,
  currentDay: 1,
};

async function getUser(): Promise<UserRecord> {
  const db = await getDB();
  return (await db.get('user', USER_KEY)) ?? { ...DEFAULT_USER };
}

async function saveUser(record: UserRecord): Promise<void> {
  const db = await getDB();
  await db.put('user', record, USER_KEY);
}

export async function getQuizResults(): Promise<QuizResults | null> {
  const user = await getUser();
  return user.quizResults;
}

export async function saveQuizResults(results: QuizResults): Promise<void> {
  const user = await getUser();
  await saveUser({
    ...user,
    quizResults: results,
    seasonId: results.seasonId,
    startDate: user.startDate ?? new Date().toISOString(),
    currentDay: 1,
  });
}

export async function getCurrentDay(): Promise<number> {
  const user = await getUser();
  return user.currentDay;
}

export async function setCurrentDay(day: number): Promise<void> {
  const user = await getUser();
  await saveUser({ ...user, currentDay: Math.max(1, Math.min(120, day)) });
}

export async function getCurrentSeason(): Promise<SeasonId | null> {
  const user = await getUser();
  return user.seasonId;
}

export async function resetUserData(): Promise<void> {
  const db = await getDB();
  await db.delete('user', USER_KEY);
}
