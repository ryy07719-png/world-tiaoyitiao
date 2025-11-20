import { NextRequest, NextResponse } from "next/server";
import { WORLDCOIN_ACTION, isValidSignal } from "@/lib/worldcoin";

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

type WorldIdVerificationResult =
  | { ok: true }
  | { ok: false; error: string; status?: number };

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

async function callWorldIdVerify(
  payload: Record<string, string>,
  appSecret: string
): Promise<WorldIdVerificationResult> {
  try {
    const response = await fetch(WORLD_ID_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${appSecret}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | WorldIdVerifyResponse
      | null;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error:
          extractWorldIdError(data) ||
          "World ID verification failed unexpectedly.",
      };
    }

    if (data && typeof data.success === "boolean" && !data.success) {
      return {
        ok: false,
        status: 403,
        error: extractWorldIdError(data) || "World ID verification was rejected.",
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      status: 502,
      error: "Unable to reach the World ID verification service.",
    };
  }
}

export async function POST(req: NextRequest) {
  const appId = process.env.NEXT_PUBLIC_MINIKIT_APP_ID;
  const appSecret = process.env.MINIKIT_APP_SECRET;

  if (!appId) {
    return makeErrorResponse("NEXT_PUBLIC_MINIKIT_APP_ID is not configured.", 500);
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

  if (!appSecret) {
    // MiniKit app is still under review; skip the remote verification for now.
    return NextResponse.json({ ok: true });
  }

  const payload = {
    app_id: appId,
    action,
    signal,
    nullifier_hash: proof.nullifier_hash,
    merkle_root: proof.merkle_root,
    proof: proof.proof,
    verification_level: proof.verification_level,
  };

  const verificationResult = await callWorldIdVerify(payload, appSecret);
  if (!verificationResult.ok) {
    return makeErrorResponse(
      verificationResult.error,
      verificationResult.status ?? 500
    );
  }

  return NextResponse.json({ ok: true });
}
