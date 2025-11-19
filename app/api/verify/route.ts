"use server";

import { NextResponse } from "next/server";
import {
  verifyCloudProof,
  type ISuccessResult,
  type IVerifyResponse,
} from "@worldcoin/minikit-js";

const APP_ID = process.env.MINIKIT_APP_ID as `app_${string}` | undefined;
const API_KEY = process.env.MINIKIT_API_KEY;
const ACTION = "tiaoyitiao-verify";
const SIGNAL = "tiaoyitiao";

export async function POST(req: Request) {
  try {
    if (!APP_ID || !API_KEY) {
      return NextResponse.json(
        { ok: false, error: "MINIKIT_APP_ID 或 MINIKIT_API_KEY 未配置" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    const proof = body?.proof as ISuccessResult | undefined;
    const action = body?.action as string | undefined;
    const signal = body?.signal as string | undefined;

    if (action !== ACTION || signal !== SIGNAL) {
      return NextResponse.json(
        { ok: false, error: "Invalid action or signal" },
        { status: 400 }
      );
    }

    if (!proof) {
      return NextResponse.json({ ok: false, error: "Missing proof" }, { status: 400 });
    }

    const result: IVerifyResponse = await verifyCloudProof(
      proof,
      APP_ID,
      ACTION,
      SIGNAL,
      undefined,
      {
        Authorization: `Bearer ${API_KEY}`,
      }
    );

    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error: result.detail ?? "World ID 校验失败",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[MiniKit] Verification failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
