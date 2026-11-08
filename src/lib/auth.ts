import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hash, verify } from "@node-rs/argon2";
import type { Role, User } from "@prisma/client";
import { db } from "./db";
import { randomToken, sha256 } from "./crypto";
import { userAgent } from "./request";

const isProd = process.env.NODE_ENV === "production";
/** En producción usamos el prefijo __Host- (exige Secure, path=/ y sin Domain). */
export const SESSION_COOKIE = isProd ? "__Host-estratec_session" : "estratec_session";

const IDLE_MS = 12 * 60 * 60 * 1000; // 12 h de inactividad
const ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días máximo
const TOUCH_MS = 15 * 60 * 1000;

// Parámetros Argon2id (OWASP: m=19 MiB, t=2, p=1)
const ARGON = { memoryCost: 19456, timeCost: 2, parallelism: 1, algorithm: 2 as const };

export const MIN_PASSWORD = 12;

export function hashPassword(pw: string) {
  return hash(pw, ARGON);
}

export async function verifyPassword(hashStr: string, pw: string) {
  try {
    return await verify(hashStr, pw);
  } catch {
    return false;
  }
}

// Hash ficticio para igualar tiempos cuando el usuario no existe (evita enumeración).
let dummyHash: Promise<string> | null = null;
export function getDummyHash() {
  dummyHash ??= hashPassword(randomToken(16));
  return dummyHash;
}

export type SessionUser = Pick<User, "id" | "email" | "name" | "role">;

export async function createSession(userId: string) {
  const token = randomToken(32);
  const now = Date.now();
  await db.session.create({
    data: {
      id: sha256(token),
      userId,
      expiresAt: new Date(now + IDLE_MS),
      userAgent: await userAgent(),
    },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(ABSOLUTE_MS / 1000),
  });
}

export async function destroyCurrentSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: sha256(token) } });
  jar.delete(SESSION_COOKIE);
}

/** Sesión del usuario actual (una consulta por petición gracias a cache()). */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const id = sha256(token);
  const session = await db.session.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, name: true, role: true, active: true, passwordChangedAt: true } } },
  });
  if (!session) return null;
  const now = Date.now();
  const expired =
    session.expiresAt.getTime() < now ||
    session.createdAt.getTime() + ABSOLUTE_MS < now ||
    !session.user.active ||
    session.user.passwordChangedAt.getTime() > session.createdAt.getTime() + 1000;
  if (expired) {
    await db.session.deleteMany({ where: { id } });
    return null;
  }
  if (now - session.lastSeenAt.getTime() > TOUCH_MS) {
    await db.session.update({
      where: { id },
      data: { lastSeenAt: new Date(now), expiresAt: new Date(Math.min(now + IDLE_MS, session.createdAt.getTime() + ABSOLUTE_MS)) },
    });
  }
  const { id: uid, email, name, role } = session.user;
  return { id: uid, email, name, role };
});

/** Exige sesión (y opcionalmente un rol). Denegación por defecto. */
export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (roles && !roles.includes(user.role)) redirect("/admin?denegado=1");
  return user;
}

export const requireAdmin = () => requireUser(["ADMIN"]);
export const requireEditor = () => requireUser(["ADMIN", "EDITOR"]);

export function can(user: SessionUser, perm: "crm" | "settings" | "users" | "content" | "seo" | "audit") {
  if (user.role === "ADMIN") return true;
  return perm === "content" || perm === "seo";
}

/** Bloqueo progresivo: 5 fallos → 15 min, luego se duplica (máx. 24 h). */
export function lockoutFor(failed: number): Date | null {
  if (failed < 5) return null;
  const minutes = Math.min(15 * 2 ** (failed - 5), 24 * 60);
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function passwordProblem(pw: string): string | null {
  if (pw.length < MIN_PASSWORD) return `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
  if (pw.length > 200) return "La contraseña es demasiado larga.";
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return "Combina letras y números.";
  return null;
}
