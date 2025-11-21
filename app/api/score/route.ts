import { NextRequest, NextResponse } from "next/server";
import {
  addScore,
  getLeaderboard,
  getVerifiedSession,
  type ScoreMetadata,
} from "@/lib/server-state";
import { readSessionToken } from "@/lib/session";

export const dynamic = "force-dynamic";

function parseScore(value: unknown) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }
  if (!Number.isInteger(numericValue)) {
    return null;
  }
  return numericValue;
}

export async function POST(req: NextRequest) {
  let body: { score?: unknown; metadata?: unknown };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const sessionToken = readSessionToken(req);
  if (!sessionToken) {
    return NextResponse.json(
      { ok: false, error: "Missing session token." },
      { status: 401 }
    );
  }

  const session = getVerifiedSession(sessionToken);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Invalid or expired session." },
      { status: 401 }
    );
  }

  const score = parseScore(body?.score);
  if (score === null) {
    return NextResponse.json(
      { ok: false, error: "Score must be a positive integer." },
      { status: 400 }
    );
  }

  const metadata =
    body?.metadata && typeof body.metadata === "object"
      ? (body.metadata as ScoreMetadata)
      : undefined;

  addScore(sessionToken, score, metadata);
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const sessionToken = readSessionToken(req);

  if (!sessionToken) {
    return NextResponse.json(
      { ok: false, error: "Missing session token." },
      { status: 401 }
    );
  }

  if (!getVerifiedSession(sessionToken)) {
    return NextResponse.json(
      { ok: false, error: "Invalid or expired session." },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true, leaderboard: getLeaderboard() });
}
