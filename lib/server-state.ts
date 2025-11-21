import { randomUUID } from "crypto";

export type VerifiedSession = {
  action: string;
  signal: string;
  createdAt: number;
};

export const VERIFIED_SESSIONS = new Map<string, VerifiedSession>();

export type ScoreMetadata = {
  walletBalance?: number;
  revivesPurchased?: number;
  powerUps?: Array<{ id: string; level?: number }>;
  skinsUnlocked?: string[];
  pointsSpent?: number;
  tasksCompleted?: string[];
  extra?: Record<string, unknown>;
};

export type ScoreEntry = {
  id: string;
  sessionToken: string;
  score: number;
  createdAt: number;
  metadata?: ScoreMetadata;
};

const MAX_LEADERBOARD_SIZE = 20;
const SCOREBOARD: ScoreEntry[] = [];

export function storeVerifiedSession(
  token: string,
  session: VerifiedSession
): void {
  VERIFIED_SESSIONS.set(token, session);
}

export function getVerifiedSession(token: string | null | undefined) {
  if (!token) return null;
  return VERIFIED_SESSIONS.get(token) ?? null;
}

export function addScore(
  sessionToken: string,
  score: number,
  metadata?: ScoreMetadata
): ScoreEntry {
  const entry: ScoreEntry = {
    id: randomUUID(),
    sessionToken,
    score,
    createdAt: Date.now(),
    metadata,
  };

  SCOREBOARD.push(entry);
  SCOREBOARD.sort((a, b) => b.score - a.score || a.createdAt - b.createdAt);

  if (SCOREBOARD.length > MAX_LEADERBOARD_SIZE) {
    SCOREBOARD.length = MAX_LEADERBOARD_SIZE;
  }

  return entry;
}

export type PublicScoreEntry = Omit<ScoreEntry, "sessionToken">;

export function getLeaderboard(): PublicScoreEntry[] {
  return SCOREBOARD.map(({ sessionToken, ...rest }) => rest);
}
