"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  WORLDCOIN_SESSION_TOKEN_KEY,
  WORLDCOIN_VERIFIED_FLAG,
  SESSION_HEADER,
} from "@/lib/worldcoin";

type GameMessage =
  | { type: "GAME_OVER"; score?: unknown }
  | Record<string, unknown>;

export default function GamePage() {
  const router = useRouter();
  const sessionTokenRef = useRef<string | null>(null);
  const submittingRef = useRef(false);
  const [status, setStatus] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem(WORLDCOIN_SESSION_TOKEN_KEY);
    const verified =
      window.localStorage.getItem(WORLDCOIN_VERIFIED_FLAG) === "true";

    if (!token || !verified) {
      router.replace("/verify");
      return;
    }

    sessionTokenRef.current = token;
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const original = {
      margin: document.body.style.margin,
      padding: document.body.style.padding,
      overflow: document.body.style.overflow,
    };
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.margin = original.margin;
      document.body.style.padding = original.padding;
      document.body.style.overflow = original.overflow || "auto";
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    const handleMessage = (event: MessageEvent<GameMessage>) => {
      if (
        typeof window !== "undefined" &&
        event.origin !== window.location.origin
      ) {
        return;
      }

      if (!event.data || typeof event.data !== "object") {
        return;
      }

      if ((event.data as GameMessage).type !== "GAME_OVER") {
        return;
      }

      const score = Number((event.data as GameMessage).score);
      if (!Number.isFinite(score) || score <= 0) {
        return;
      }

      const sessionToken = sessionTokenRef.current;
      if (!sessionToken) {
        router.replace("/verify");
        return;
      }

      if (submittingRef.current) return;
      submittingRef.current = true;
      setStatus("上传分数中...");

      void (async () => {
        try {
          const response = await fetch("/api/score", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              [SESSION_HEADER]: sessionToken,
            },
            body: JSON.stringify({ score }),
          });

          const payload = (await response.json().catch(() => null)) as
            | { ok?: boolean; error?: string }
            | null;

          if (!response.ok || !payload?.ok) {
            throw new Error(payload?.error || "Failed to submit score.");
          }

          setStatus(`分数 ${score} 已提交！`);
          router.push("/leaderboard");
        } catch (error) {
          console.error("[Game] score submit failed", error);
          setStatus("分数上传失败，请重试。");
        } finally {
          submittingRef.current = false;
        }
      })();
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [ready, router]);

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#000",
        margin: 0,
        padding: 0,
      }}
    >
      <iframe
        src="/tiaoyitiao/gameweb/index.html"
        style={{
          width: "100vw",
          height: "100vh",
          border: "none",
          margin: 0,
          padding: 0,
          display: "block",
          backgroundColor: "black",
        }}
        allow="fullscreen"
        allowFullScreen
      />
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          padding: "6px 10px",
          borderRadius: 12,
          background: "rgba(0,0,0,0.45)",
          color: "white",
          fontSize: 12,
        }}
      >
        {status || "游戏进行中"}
      </div>

      <button
        onClick={() => router.push("/leaderboard")}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          borderRadius: 999,
          border: "1px solid rgba(99,102,241,0.8)",
          padding: "6px 12px",
          background: "rgba(15,23,42,0.7)",
          color: "white",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        查看排行榜
      </button>
    </main>
  );
}
