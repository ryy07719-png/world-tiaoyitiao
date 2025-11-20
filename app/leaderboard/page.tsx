import Link from "next/link";

type LeaderboardEntry = {
  id: string;
  score: number;
  createdAt: number;
  userId?: string | null;
};

type ScoreResponse = {
  ok: boolean;
  leaderboard?: LeaderboardEntry[];
  error?: string;
};

type LeaderboardResult = {
  leaderboard: LeaderboardEntry[];
  error?: string;
};

async function fetchLeaderboard(): Promise<LeaderboardResult> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/score`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch leaderboard (${res.status}).`);
    }

    const json = (await res.json()) as ScoreResponse;
    if (!json.ok || !Array.isArray(json.leaderboard)) {
      throw new Error(json.error || "Leaderboard data is unavailable.");
    }

    return { leaderboard: json.leaderboard };
  } catch (error) {
    return {
      leaderboard: [],
      error:
        error instanceof Error
          ? error.message
          : "Unable to load leaderboard.",
    };
  }
}

function formatUserId(userId?: string | null) {
  if (!userId) return "匿名玩家";
  if (userId.length <= 8) return userId;
  return `${userId.slice(0, 4)}…${userId.slice(-4)}`;
}

export default async function LeaderboardPage() {
  const { leaderboard, error } = await fetchLeaderboard();

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#020617",
        color: "white",
        padding: "40px 16px",
      }}
    >
      <section
        style={{
          maxWidth: 520,
          margin: "0 auto",
          background: "rgba(15,23,42,0.85)",
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.25)",
          padding: 24,
          boxShadow: "0 20px 45px rgba(0,0,0,0.45)",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
              WORLD TIAOYITIAO
            </p>
            <h1 style={{ margin: 0, fontSize: 26 }}>排行榜</h1>
          </div>
          <Link
            href="/game"
            style={{
              borderRadius: 999,
              border: "1px solid rgba(99,102,241,0.8)",
              color: "white",
              textDecoration: "none",
              padding: "8px 16px",
              fontSize: 14,
            }}
          >
            返回游戏
          </Link>
        </header>

        {error ? (
          <p style={{ color: "#f87171", margin: "16px 0" }}>{error}</p>
        ) : leaderboard.length === 0 ? (
          <p style={{ opacity: 0.7, margin: "16px 0" }}>
            还没有成绩，快去挑战第一名吧！
          </p>
        ) : (
          <ol
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {leaderboard.map((entry, index) => (
              <li
                key={entry.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: 12,
                  background:
                    index === 0
                      ? "linear-gradient(90deg,#fbbf24,#f97316)"
                      : "rgba(15,23,42,0.9)",
                  color: index === 0 ? "#111827" : "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: "1px solid rgba(148,163,184,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: 16,
                      backgroundColor:
                        index === 0 ? "rgba(255,255,255,0.35)" : "transparent",
                    }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>
                      {formatUserId(entry.userId)}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>
                      {new Date(entry.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {entry.score.toFixed(0)}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
