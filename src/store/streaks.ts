import { getDB } from './db';
import type { StreakData } from '../types';

const STREAKS_KEY = 'streaks';

const DEFAULT_STREAKS: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: null,
  milestones: [],
};

const MILESTONE_DAYS = [7, 14, 30, 60, 90, 120];

export async function getStreakData(): Promise<StreakData> {
  const db = await getDB();
  return (await db.get('streaks', STREAKS_KEY)) ?? { ...DEFAULT_STREAKS };
}

export async function updateStreakOnCompletion(): Promise<StreakData> {
  const db = await getDB();
  const data = await getStreakData();

  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  if (data.lastCompletedDate === today) {
    // Already completed today — no change
    return data;
  }

  const isConsecutive = data.lastCompletedDate === yesterday;
  const newStreak = isConsecutive ? data.currentStreak + 1 : 1;
  const newLongest = Math.max(data.longestStreak, newStreak);

  const newMilestones = MILESTONE_DAYS.filter(
    (m) => newStreak >= m && !data.milestones.includes(m)
  );

  const updated: StreakData = {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastCompletedDate: today,
    milestones: [...data.milestones, ...newMilestones],
  };

  await db.put('streaks', updated, STREAKS_KEY);
  return updated;
}

export async function resetStreaks(): Promise<void> {
  const db = await getDB();
  await db.delete('streaks', STREAKS_KEY);
}
