import { NextRequest, NextResponse } from "next/server";
import {
  WORLDCOIN_ACTION,
  SESSION_HEADER,
  isValidSignal,
  type WorldIdProof,
} from "@/lib/worldcoin";
import { storeVerifiedSession } from "@/lib/server-state";

type VerifyRequestBody = {
  action?: unknown;
  signal?: unknown;
  proof?: unknown;
  sessionToken?: unknown;
};

export const dynamic = "force-dynamic";

function makeErrorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function isProofPayload(value: unknown): value is WorldIdProof {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.merkle_root === "string" &&
    typeof payload.nullifier_hash === "string" &&
    typeof payload.proof === "string" &&
    typeof payload.verification_level === "string"
  );
}

export async function POST(req: NextRequest) {
  let body: VerifyRequestBody;
  try {
    body = await req.json();
  } catch {
    return makeErrorResponse("Invalid JSON payload.");
  }

  const headerToken =
    typeof req.headers.get(SESSION_HEADER) === "string"
      ? req.headers.get(SESSION_HEADER)
      : null;
  const { action, signal, proof, sessionToken } = body;

  if (typeof action !== "string" || !action.trim()) {
    return makeErrorResponse("`action` must be a non-empty string.");
  }

  if (action !== WORLDCOIN_ACTION) {
    return makeErrorResponse("Unknown action.", 400);
  }

  if (!isValidSignal(signal)) {
    return makeErrorResponse("Invalid signal format.", 400);
  }

  if (!isProofPayload(proof)) {
    return makeErrorResponse(
      "`proof` must include merkle_root, nullifier_hash, proof, and verification_level strings."
    );
  }

  const token = (sessionToken as string | undefined)?.trim() || headerToken;

  if (!token) {
    return makeErrorResponse("`sessionToken` must be provided.", 400);
  }

  // TODO: once the app is approved, replace this mock verification with an actual
  // call to the World ID verify endpoint using MINIKIT_APP_SECRET.
  storeVerifiedSession(token, {
    action,
    signal,
    createdAt: Date.now(),
  });

  return NextResponse.json({ ok: true });
}
