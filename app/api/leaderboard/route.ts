import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard, getVerifiedSession } from "@/lib/server-state";
import { readSessionToken } from "@/lib/session";

export const dynamic = "force-dynamic";

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
