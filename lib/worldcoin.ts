export const WORLDCOIN_ACTION = "tiaoyitiao-verify";
export const WORLDCOIN_SIGNAL_PREFIX = "tiaoyitiao";
export const WORLDCOIN_VERIFIED_FLAG = "world_verified";
export const WORLDCOIN_SIGNAL_STORAGE_KEY = "world_signal";
export const WORLDCOIN_SESSION_TOKEN_KEY = "world_session_token";
export const SESSION_HEADER = "x-session-token";

export type WorldIdProof = {
  merkle_root: string;
  nullifier_hash: string;
  proof: string;
  verification_level: string;
};

export function buildSignal(randomPart: string) {
  return `${WORLDCOIN_SIGNAL_PREFIX}:${randomPart}`;
}

export function isValidSignal(signal: unknown): signal is string {
  return (
    typeof signal === "string" &&
    signal.startsWith(`${WORLDCOIN_SIGNAL_PREFIX}:`)
  );
}

export function generateSessionToken() {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}
