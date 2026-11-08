import { NextResponse } from "next/server";
import { hmac } from "@/lib/crypto";

export const dynamic = "force-dynamic";

/** Token firmado con la hora de emisión: permite exigir un tiempo mínimo plausible de llenado. */
export async function GET() {
  const t = Date.now().toString(36);
  return NextResponse.json({ token: `${t}.${hmac(`lead:${t}`)}` }, { headers: { "Cache-Control": "no-store" } });
}
