import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

type LeaderboardEntry = {
  id: string;
  score: number;
  createdAt: number;
  userId?: string | null;
};

const MAX_LEADERBOARD_SIZE = 20;
let leaderboard: LeaderboardEntry[] = [];

export const dynamic = "force-dynamic";

function validateScore(value: unknown): number | null {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return null;
  }
  return numericValue;
}

function normalizeUserId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function addToLeaderboard(entry: LeaderboardEntry) {
  leaderboard = [...leaderboard, entry]
    .sort((a, b) => b.score - a.score || a.createdAt - b.createdAt)
    .slice(0, MAX_LEADERBOARD_SIZE);
}

export async function GET() {
  return NextResponse.json({ ok: true, leaderboard });
}

export async function POST(req: NextRequest) {
  let body: { score?: unknown; userId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const score = validateScore(body?.score);
  if (score === null) {
    return NextResponse.json(
      { ok: false, error: "Score must be a non-negative number." },
      { status: 400 }
    );
  }

  const entry: LeaderboardEntry = {
    id: randomUUID(),
    score,
    createdAt: Date.now(),
    userId: normalizeUserId(body?.userId),
  };

  addToLeaderboard(entry);

  return NextResponse.json({ ok: true, leaderboard });
}
