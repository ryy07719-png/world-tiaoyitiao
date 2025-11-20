import { NextRequest, NextResponse } from "next/server";

const WORLD_ID_VERIFY_URL = "https://developer.worldcoin.org/api/v1/verify";

type ProofPayload = {
  merkle_root: string;
  nullifier_hash: string;
  proof: string;
  verification_level: string;
};

type VerifyRequestBody = {
  action?: unknown;
  signal?: unknown;
  proof?: unknown;
};

type WorldIdVerifyResponse = {
  success?: boolean;
  detail?: string;
  error?: string;
  code?: string;
  message?: string;
};

export const dynamic = "force-dynamic";

function makeErrorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function isProofPayload(value: unknown): value is ProofPayload {
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

function extractWorldIdError(body: WorldIdVerifyResponse | null) {
  if (!body) return undefined;
  return body.detail || body.error || body.code || body.message;
}

export async function POST(req: NextRequest) {
  const appId = process.env.NEXT_PUBLIC_MINIKIT_APP_ID;
  const appSecret = process.env.MINIKIT_APP_SECRET;

  if (!appId || !appSecret) {
    return makeErrorResponse(
      "World ID credentials are not configured on the server.",
      500
    );
  }

  let body: VerifyRequestBody;
  try {
    body = await req.json();
  } catch {
    return makeErrorResponse("Invalid JSON payload.");
  }

  const action = body?.action;
  const signal = body?.signal;
  const proof = body?.proof;

  if (typeof action !== "string" || !action.trim()) {
    return makeErrorResponse("`action` must be a non-empty string.");
  }

  if (typeof signal !== "string") {
    return makeErrorResponse("`signal` must be a string.");
  }

  if (!isProofPayload(proof)) {
    return makeErrorResponse(
      "`proof` must include merkle_root, nullifier_hash, proof, and verification_level strings."
    );
  }

  const payload = {
    app_id: appId,
    app_secret: appSecret,
    action,
    signal,
    nullifier_hash: proof.nullifier_hash,
    merkle_root: proof.merkle_root,
    proof: proof.proof,
    verification_level: proof.verification_level,
  };

  let response: Response;
  try {
    response = await fetch(WORLD_ID_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return makeErrorResponse(
      "Unable to reach the World ID verification service.",
      502
    );
  }

  const data = (await response.json().catch(() => null)) as
    | WorldIdVerifyResponse
    | null;

  if (!response.ok) {
    const detail =
      extractWorldIdError(data) || "World ID verification failed unexpectedly.";
    return makeErrorResponse(detail, response.status);
  }

  if (data && typeof data.success === "boolean" && !data.success) {
    const detail =
      extractWorldIdError(data) || "World ID verification was rejected.";
    return makeErrorResponse(detail, 403);
  }

  return NextResponse.json({ ok: true });
}
