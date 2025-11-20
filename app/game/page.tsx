"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  WORLDCOIN_SIGNAL_STORAGE_KEY,
  WORLDCOIN_VERIFIED_FLAG,
} from "@/lib/worldcoin";

export default function GamePage() {
  const router = useRouter();
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const verified =
      window.localStorage.getItem(WORLDCOIN_VERIFIED_FLAG) === "true";
    if (!verified) {
      router.replace("/verify");
    }
  }, [router]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        typeof window !== "undefined" &&
        event.origin !== window.location.origin
      ) {
        return;
      }

      if (!event.data || typeof event.data !== "object") {
        return;
      }

      const incomingScore = (event.data as { score?: unknown }).score;
      const score = Number(incomingScore);

      if (!Number.isFinite(score) || score < 0) {
        return;
      }

      if (hasSubmittedRef.current) {
        return;
      }

      hasSubmittedRef.current = true;

      void (async () => {
        try {
          const userId =
            typeof window !== "undefined"
              ? window.localStorage.getItem(WORLDCOIN_SIGNAL_STORAGE_KEY)
              : null;

          const response = await fetch("/api/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ score, userId }),
          });

          const payload = await response.json().catch(() => null);
          if (!response.ok || !payload?.ok) {
            throw new Error(
              (payload?.error as string | undefined) ||
                "Failed to submit score."
            );
          }

          router.push("/leaderboard");
        } catch (error) {
          console.error("Unable to submit score:", error);
          hasSubmittedRef.current = false;
        }
      })();
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#05070e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(10,17,40,0.85)",
          borderRadius: 16,
          padding: 16,
          border: "1px solid rgba(148,163,184,0.2)",
          boxShadow: "0 15px 40px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            color: "white",
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
              WORLD TIAOYITIAO
            </p>
            <h1 style={{ margin: 0, fontSize: 22 }}>Jump Challenge</h1>
          </div>
          <button
            onClick={() => router.push("/leaderboard")}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(99,102,241,0.8)",
              padding: "6px 12px",
              background: "transparent",
              color: "white",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            查看排行榜
          </button>
        </div>

        <iframe
          src="/tiaoyitiao/gameweb/index.html"
          style={{
            width: "100%",
            height: 640,
            border: "none",
            borderRadius: 12,
            backgroundColor: "black",
          }}
        />
      </section>
    </main>
  );
}
