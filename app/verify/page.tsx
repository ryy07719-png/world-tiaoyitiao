"use client";

import { MiniKit, type ISuccessResult } from "@worldcoin/minikit-js";
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

    const appId = process.env.NEXT_PUBLIC_MINIKIT_APP_ID;
    if (!appId) {
      console.error("[MiniKit] NEXT_PUBLIC_MINIKIT_APP_ID is missing");
      setError("缺少 MiniKit 配置（APP ID），无法完成验证。请先在 Vercel 环境变量中配置。");
      return;
    }

    const installResult = MiniKit.install(appId);
    console.log("[MiniKit] install result:", installResult);
    if (!installResult.success) {
      console.warn("[MiniKit] install failed:", installResult.errorMessage);
      // 不直接报错，让用户仍然可以尝试点击按钮，看 SDK 返回什么
    }

    if (window.localStorage.getItem(STORAGE_KEY) === "true") {
      router.replace("/game");
    }
  }, [router]);

  const handleVerify = useCallback(async () => {
    if (loading || typeof window === "undefined") return;

    try {
      setLoading(true);
      setError(null);

      console.log("[MiniKit] start verify:", { ACTION, SIGNAL });

      const result = await MiniKit.commandsAsync.verify({
        action: ACTION,
        signal: SIGNAL,
      });

      console.log("[MiniKit] verify result:", result);

      const finalPayload = result?.finalPayload as
        | (ISuccessResult & { status: "success" })
        | ({ status: string; error_code?: string | null; error?: string | null } & Partial<ISuccessResult>)
        | undefined;

      if (!finalPayload || finalPayload.status !== "success") {
        const anyErr =
          (finalPayload as any)?.error ||
          (finalPayload as any)?.error_code ||
          "World ID 验证失败";
        throw new Error(anyErr);
      }

      const proofPayload: ISuccessResult = {
        merkle_root: finalPayload.merkle_root!,
        nullifier_hash: finalPayload.nullifier_hash!,
        proof: finalPayload.proof!,
        verification_level: finalPayload.verification_level!,
      };

      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: ACTION,
          signal: SIGNAL,
          proof: proofPayload,
        }),
      });

      const json = await response.json().catch(() => null);
      console.log("[MiniKit] /api/verify response:", json);

      if (!response.ok || !json?.ok) {
        throw new Error(json?.error ?? "服务器校验失败");
      }

      window.localStorage.setItem(STORAGE_KEY, "true");
      router.replace("/game");
    } catch (err) {
      console.error("[MiniKit] verify error", err);
      setError(
        err instanceof Error
          ? err.message
          : "验证失败，请在 World App 内重新尝试。"
      );
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
      }
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
          maxWidth: "100%",
          background: "rgba(15, 23, 42, 0.9)",
          padding: "32px",
          borderRadius: "18px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            letterSpacing: "0.4em",
            color: "#94a3b8",
            marginBottom: "8px",
          }}
        >
          WORLD TIAOYITIAO
        </p>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 600,
            marginBottom: "12px",
          }}
        >
          World ID 验证
        </h1>
        <p
          style={{
            color: "#cbd5f5",
            fontSize: "14px",
            marginBottom: "24px",
            lineHeight: 1.6,
          }}
        >
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
          {loading ? "验证中..." : "使用 World ID 验证"}
        </button>

        {error && (
          <p
            style={{
              marginTop: "18px",
              color: "#f87171",
              fontSize: "14px",
              whiteSpace: "pre-wrap",
            }}
          >
            {error}
          </p>
        )}
      </div>
    </main>
  );
}