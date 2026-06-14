/**
 * localStorage utility for client-side data persistence.
 * This is the primary storage for Vercel deployment (serverless functions don't have persistent file systems).
 * Local JSON file storage in lib/db/queries.ts is used as a server-side cache during development.
 */

const KEYS = {
  profile: (userId: string) => `shestarts_profile_${userId}`,
  recommendations: (userId: string) => `shestarts_recs_${userId}`,
  score: (userId: string) => `shestarts_score_${userId}`,
  completedTasks: (userId: string) => `roadmap_tasks_${userId}`,
  studyLog: (userId: string) => `study_log_${userId}`,
};

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function saveProfileLocally(userId: string, profile: unknown): void {
  safeSet(KEYS.profile(userId), profile);
}

export function getProfileLocally(userId: string): unknown | null {
  return safeGet(KEYS.profile(userId));
}

export function saveRecommendationsLocally(userId: string, recs: unknown): void {
  safeSet(KEYS.recommendations(userId), recs);
}

export function getRecommendationsLocally(userId: string): unknown | null {
  return safeGet(KEYS.recommendations(userId));
}

export function saveScoreLocally(userId: string, score: unknown): void {
  safeSet(KEYS.score(userId), score);
}

export function getScoreLocally(userId: string): unknown | null {
  return safeGet(KEYS.score(userId));
}
