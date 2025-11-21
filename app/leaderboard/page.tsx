"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  WORLDCOIN_SESSION_TOKEN_KEY,
  WORLDCOIN_VERIFIED_FLAG,
  SESSION_HEADER,
} from "@/lib/worldcoin";
import type { PublicScoreEntry } from "@/lib/server-state";

type LeaderboardEntry = PublicScoreEntry;

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem(WORLDCOIN_SESSION_TOKEN_KEY);
    const verified =
      window.localStorage.getItem(WORLDCOIN_VERIFIED_FLAG) === "true";

    if (!token || !verified) {
      router.replace("/verify");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/leaderboard`, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        [SESSION_HEADER]: token,
      },
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (res.status === 401) {
          throw new Error("SESSION_EXPIRED");
        }
        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || `Failed to fetch leaderboard (${res.status}).`);
        }
        setLeaderboard(json.leaderboard ?? []);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (err instanceof Error && err.message === "SESSION_EXPIRED") {
          setError("Session expired, please go back and start the game again.");
          return;
        }
        setError(err instanceof Error ? err.message : "加载排行榜失败");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [router]);

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
          <button
            onClick={() => router.push("/game")}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(99,102,241,0.8)",
              color: "white",
              background: "transparent",
              padding: "8px 16px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            返回游戏
          </button>
        </header>

        {loading && <p>排行榜加载中…</p>}

        {error && (
          <p style={{ color: "#f87171", margin: "16px 0" }}>{error}</p>
        )}

        {!loading && !error && leaderboard.length === 0 && (
          <p style={{ opacity: 0.7, margin: "16px 0" }}>
            还没有成绩，快去挑战第一名吧！
          </p>
        )}

        {!loading && !error && leaderboard.length > 0 && (
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
                      玩家 #{index + 1}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>
                      {new Date(entry.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {entry.score.toFixed(0)}
                </div>
                {entry.metadata?.walletBalance !== undefined && (
                  <div
                    style={{
                      fontSize: 11,
                      opacity: 0.8,
                      marginLeft: 12,
                      textAlign: "right",
                    }}
                  >
                    钱包余额：{entry.metadata.walletBalance}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
