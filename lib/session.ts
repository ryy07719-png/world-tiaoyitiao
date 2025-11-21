import { NextRequest } from "next/server";
import { SESSION_HEADER } from "./worldcoin";

export function readSessionToken(req: NextRequest): string | null {
  const fromHeader = req.headers.get(SESSION_HEADER);
  if (fromHeader) return fromHeader;

  const fromQuery = req.nextUrl.searchParams.get("sessionToken");
  if (fromQuery) return fromQuery;

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return null;
    const [, token] = authHeader.split("Bearer ").map((part) => part.trim());
    return token || null;
  } catch {
    return null;
  }
}
