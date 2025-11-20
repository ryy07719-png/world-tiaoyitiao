export const WORLDCOIN_ACTION = "tiaoyitiao-verify";
export const WORLDCOIN_SIGNAL_PREFIX = "tiaoyitiao";
export const WORLDCOIN_VERIFIED_FLAG = "world_verified";
export const WORLDCOIN_SIGNAL_STORAGE_KEY = "world_signal";

export function buildSignal(randomPart: string) {
  return `${WORLDCOIN_SIGNAL_PREFIX}:${randomPart}`;
}

export function isValidSignal(signal: unknown): signal is string {
  return (
    typeof signal === "string" &&
    signal.startsWith(`${WORLDCOIN_SIGNAL_PREFIX}:`)
  );
}
