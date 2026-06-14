/**
 * Utility functions for database operations
 * Local JSON persistence for development.
 * Swap for Supabase later without changing callers.
 */

import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { UserProfile } from '@/types/assessment';
import { CareerRecommendations } from '@/types/career';
import { EmployabilityScore } from '@/types/scoring';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  sessionId: string;
  userId: string;
  sessionName: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskProgress {
  completedTasks: string[];
  hoursStudied: number;
  lastUpdated: string;
}

interface AppDatabase {
  profiles: Record<string, UserProfile>;
  recommendations: Record<string, CareerRecommendations>;
  scores: Record<string, EmployabilityScore>;
  chatSessions: Record<string, ChatSession[]>;
  taskProgress: Record<string, TaskProgress>;
}

const dataDir = path.join(process.cwd(), '.data');
const dataFile = path.join(dataDir, 'app-data.json');

const emptyDB: AppDatabase = {
  profiles: {},
  recommendations: {},
  scores: {},
  chatSessions: {},
  taskProgress: {},
};

async function readDB(): Promise<AppDatabase> {
  try {
    const content = await readFile(dataFile, 'utf8');
    const parsed = JSON.parse(content) as Partial<AppDatabase>;
    return {
      profiles: parsed.profiles ?? {},
      recommendations: parsed.recommendations ?? {},
      scores: parsed.scores ?? {},
      chatSessions: parsed.chatSessions ?? {},
      taskProgress: parsed.taskProgress ?? {},
    };
  } catch {
    return { ...emptyDB };
  }
}

async function writeDB(db: AppDatabase): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(db, null, 2), 'utf8');
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const db = await readDB();
  db.profiles[profile.userId] = profile;
  await writeDB(db);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const db = await readDB();
  return db.profiles[userId] || null;
}

export async function saveCareerRecommendations(
  recommendations: CareerRecommendations
): Promise<void> {
  const db = await readDB();
  db.recommendations[recommendations.userId] = recommendations;
  await writeDB(db);
}

export async function getCareerRecommendations(
  userId: string
): Promise<CareerRecommendations | null> {
  const db = await readDB();
  return db.recommendations[userId] || null;
}

export async function saveEmployabilityScore(score: EmployabilityScore): Promise<void> {
  const db = await readDB();
  db.scores[score.userId] = score;
  await writeDB(db);
}

export async function getEmployabilityScore(userId: string): Promise<EmployabilityScore | null> {
  const db = await readDB();
  return db.scores[userId] || null;
}

export async function saveChatSession(session: ChatSession): Promise<void> {
  const db = await readDB();
  if (!db.chatSessions[session.userId]) {
    db.chatSessions[session.userId] = [];
  }
  const idx = db.chatSessions[session.userId].findIndex(s => s.sessionId === session.sessionId);
  if (idx >= 0) {
    db.chatSessions[session.userId][idx] = session;
  } else {
    db.chatSessions[session.userId].push(session);
  }
  await writeDB(db);
}

export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  const db = await readDB();
  return db.chatSessions[userId] || [];
}

export async function getChatSession(userId: string, sessionId: string): Promise<ChatSession | null> {
  const sessions = await getChatSessions(userId);
  return sessions.find(s => s.sessionId === sessionId) || null;
}

export async function saveTaskProgress(userId: string, progress: TaskProgress): Promise<void> {
  const db = await readDB();
  db.taskProgress[userId] = progress;
  await writeDB(db);
}

export async function getTaskProgress(userId: string): Promise<TaskProgress | null> {
  const db = await readDB();
  return db.taskProgress[userId] || null;
}

export async function deleteUserData(userId: string): Promise<void> {
  const db = await readDB();
  delete db.profiles[userId];
  delete db.recommendations[userId];
  delete db.scores[userId];
  delete db.chatSessions[userId];
  delete db.taskProgress[userId];
  await writeDB(db);
}
