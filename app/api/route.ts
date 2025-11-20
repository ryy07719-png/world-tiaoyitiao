import { NextRequest, NextResponse } from "next/server";

type ScoreItem = {
  id: number;
  score: number;
  createdAt: number;
};

let SCORES: ScoreItem[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const rawScore = body?.score;

    if (typeof rawScore !== "number" || !Number.isFinite(rawScore)) {
      return NextResponse.json(
        { ok: false, error: "Invalid score" },
        { status: 400 }
      );
    }

    const score = Math.max(0, Math.floor(rawScore));

    const item: ScoreItem = {
      id: Date.now(),
      score,
      createdAt: Date.now(),
    };

    SCORES.push(item);

    // 简单限制最大条数
    if (SCORES.length > 200) {
      SCORES = SCORES.slice(-200);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Failed to save score" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // 按分数从高到低排序，取前 20 条
  const data = [...SCORES]
    .sort((a, b) => b.score - a.score || a.createdAt - b.createdAt)
    .slice(0, 20);

  return NextResponse.json({ ok: true, data });
}