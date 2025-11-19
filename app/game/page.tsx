"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "world_verified";

export default function GamePage() {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const verified = window.localStorage.getItem(STORAGE_KEY) === "true";

    Promise.resolve().then(() => {
      if (cancelled) return;
      if (!verified) {
        router.replace("/verify");
      } else {
        setIsVerified(true);
      }
      setChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#030712",
          color: "white",
        }}
      >
        <p>正在打开游戏...</p>
      </main>
    );
  }

  if (!isVerified) return null;

  return (
    <main style={{ margin: 0, padding: 0, width: "100vw", height: "100vh", overflow: "hidden" }}>
      <iframe
        title="tiaoyitiao game"
        src="/tiaoyitiao/gameweb/index.html"
        style={{ border: "none", width: "100vw", height: "100vh", display: "block" }}
      />
    </main>
  );
}
