import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "./env";

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hmac(input: string): string {
  return createHmac("sha256", env.authSecret).update(input).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Hash de IP con secreto: permite limitar frecuencia y auditar sin guardar la IP en claro. */
export function hashIp(ip: string): string {
  return hmac(`ip:${ip}`).slice(0, 32);
}
