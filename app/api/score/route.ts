import { NextRequest, NextResponse } from "next/server";

let scores: number[] = [];
const MAX_LEADERBOARD_SIZE = 10;

export const dynamic = "force-dynamic";

function getTopScores() {
  return [...scores].sort((a, b) => b - a).slice(0, MAX_LEADERBOARD_SIZE);
}

function validateScore(value: unknown) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return null;
  }
  return numericValue;
}

export async function GET() {
  return NextResponse.json({ ok: true, scores: getTopScores() });
}

export async function POST(req: NextRequest) {
  let body: { score?: unknown };
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

  scores.push(score);

  return NextResponse.json({ ok: true, scores: getTopScores() });
}
