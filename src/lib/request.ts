import "server-only";
import { headers } from "next/headers";

export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip") || "0.0.0.0";
}

export async function userAgent(): Promise<string> {
  const h = await headers();
  return (h.get("user-agent") || "").slice(0, 300);
}

/** Comprueba que la petición provenga del propio sitio (defensa CSRF para route handlers). */
export async function isSameOrigin(): Promise<boolean> {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") || h.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
