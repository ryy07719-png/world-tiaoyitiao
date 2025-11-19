"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const ACTION = "tiaoyitiao-verify";
const SIGNAL = "tiaoyitiao";
const STORAGE_KEY = "world_verified";

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const installAttempted = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || installAttempted.current) return;
    installAttempted.current = true;

    const installResult = MiniKit.install(process.env.NEXT_PUBLIC_MINIKIT_APP_ID ?? "");
    if (!installResult.success) {
      console.warn("[MiniKit] install failed:", installResult.errorMessage);
    }

    if (localStorage.getItem(STORAGE_KEY) === "true") {
      router.replace("/game");
    }
  }, [router]);

  const handleVerify = useCallback(async () => {
    if (loading) return;
    try {
      setLoading(true);
      setError(null);

      const verifyResult = await MiniKit.commandsAsync.verify({
        action: ACTION,
        signal: SIGNAL,
      });

      if (verifyResult.finalPayload.status !== "success") {
        throw new Error(verifyResult.finalPayload.error_code ?? "World ID 返回失败");
      }

      const proofPayload = verifyResult.finalPayload;

      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: ACTION,
          signal: SIGNAL,
          proof: {
            proof: proofPayload.proof,
            merkle_root: proofPayload.merkle_root,
            nullifier_hash: proofPayload.nullifier_hash,
            verification_level: proofPayload.verification_level,
          },
        }),
      });

      const json = await response.json();

      if (!response.ok || !json?.ok) {
        throw new Error(json?.error ?? "服务器校验失败");
      }

      localStorage.setItem(STORAGE_KEY, "true");
      router.replace("/game");
    } catch (err) {
      console.error("[MiniKit] verify error", err);
      setError(
        err instanceof Error ? err.message : "验证失败，请重试（需在 World App 内打开）。"
      );
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, [loading, router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#030712",
        color: "white",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "360px",
          background: "rgba(15, 23, 42, 0.85)",
          padding: "32px",
          borderRadius: "18px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
        }}
      >
        <p style={{ fontSize: "12px", letterSpacing: "0.4em", color: "#94a3b8", marginBottom: "8px" }}>
          WORLD TIAOYITIAO
        </p>
        <h1 style={{ fontSize: "28px", fontWeight: 600, marginBottom: "12px" }}>World ID 验证</h1>
        <p style={{ color: "#cbd5f5", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>
          请在 World App 中完成验证，以解锁跳一跳游戏。
        </p>

        <button
          onClick={handleVerify}
          disabled={loading}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "9999px",
            border: "none",
            backgroundImage: "linear-gradient(90deg,#6366f1,#14b8a6)",
            color: "white",
            fontSize: "16px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "验证中..." : "开始验证"}
        </button>

        {error && (
          <p style={{ marginTop: "18px", color: "#f87171", fontSize: "14px" }}>{error}</p>
        )}
      </div>
    </main>
  );
}