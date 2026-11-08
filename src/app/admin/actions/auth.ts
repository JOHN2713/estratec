"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  createSession, destroyCurrentSession, getDummyHash, getSessionUser, hashPassword, lockoutFor, passwordProblem, requireUser, verifyPassword,
} from "@/lib/auth";
import { audit } from "@/lib/audit";
import { hashIp, randomToken, sha256 } from "@/lib/crypto";
import { clientIp } from "@/lib/request";
import { rateLimit } from "@/lib/ratelimit";
import { sendMail } from "@/lib/email";
import { siteUrl } from "@/lib/site-url";
import type { ActionState } from "./types";

const GENERIC = "Correo o contraseña incorrectos.";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(160).pipe(z.email()),
  password: z.string().min(1).max(200),
});

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { ok: false, message: GENERIC };
  const { email, password } = parsed.data;

  const ip = hashIp(await clientIp());
  let ipOk: boolean, emailOk: boolean;
  try {
    [ipOk, emailOk] = await Promise.all([
      rateLimit(`login:ip:${ip}`, 20, 15 * 60),
      rateLimit(`login:email:${sha256(email)}`, 10, 15 * 60),
    ]);
  } catch (e) {
    console.error("[auth] base de datos no disponible:", (e as Error).message.split("\n").filter(Boolean).pop());
    return { ok: false, message: "El servicio no está disponible en este momento (sin conexión a la base de datos). Inténtalo en unos minutos." };
  }
  if (!ipOk || !emailOk) {
    await audit("auth.login_rate_limited", { meta: { email: sha256(email).slice(0, 12) } });
    return { ok: false, message: "Demasiados intentos. Espera unos minutos antes de volver a intentarlo." };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    await verifyPassword(await getDummyHash(), password); // tiempo constante aproximado
    return { ok: false, message: GENERIC };
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { ok: false, message: "La cuenta está bloqueada temporalmente por intentos fallidos. Inténtalo más tarde." };
  }
  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    const failed = user.failedLogins + 1;
    await db.user.update({ where: { id: user.id }, data: { failedLogins: failed, lockedUntil: lockoutFor(failed) } });
    await audit("auth.login_failed", { userId: user.id, meta: { failed } });
    return { ok: false, message: GENERIC };
  }

  // Rotación: se elimina cualquier sesión previa del navegador antes de crear una nueva.
  await destroyCurrentSession();
  await db.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() } });
  await createSession(user.id);
  await audit("auth.login", { userId: user.id });
  redirect("/admin");
}

export async function logoutAction() {
  const user = await getSessionUser();
  await destroyCurrentSession();
  if (user) await audit("auth.logout", { userId: user.id });
  redirect("/admin/login");
}

export async function logoutAllAction() {
  const user = await requireUser();
  await db.session.deleteMany({ where: { userId: user.id } });
  await destroyCurrentSession();
  await audit("auth.logout_all", { userId: user.id });
  redirect("/admin/login");
}

export async function requestResetAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const generic: ActionState = {
    ok: true,
    message: "Si el correo corresponde a una cuenta activa, recibirás un enlace para restablecer la contraseña. El enlace vence en 1 hora.",
  };
  const email = z.string().trim().toLowerCase().max(160).pipe(z.email()).safeParse(fd.get("email"));
  if (!email.success) return generic;
  const ip = hashIp(await clientIp());
  if (!(await rateLimit(`reset:ip:${ip}`, 5, 3600)) || !(await rateLimit(`reset:email:${sha256(email.data)}`, 3, 3600))) return generic;

  const user = await db.user.findUnique({ where: { email: email.data } });
  if (user?.active) {
    const token = randomToken(32);
    await db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await db.passwordResetToken.create({ data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
    await sendMail({
      to: user.email,
      subject: "Restablecer contraseña — Panel Estratec",
      text: `Hola, ${user.name}:\n\nRecibimos una solicitud para restablecer tu contraseña del panel de Estratec.\n\nUsa este enlace (vence en 1 hora y solo sirve una vez):\n${siteUrl(`/admin/restablecer?token=${token}`)}\n\nSi no fuiste tú, ignora este mensaje.`,
    });
    await audit("auth.reset_requested", { userId: user.id });
  }
  return generic;
}

export async function resetPasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const token = String(fd.get("token") ?? "");
  const pw = String(fd.get("password") ?? "");
  const pw2 = String(fd.get("password2") ?? "");
  const problem = passwordProblem(pw);
  if (problem) return { ok: false, message: problem };
  if (pw !== pw2) return { ok: false, message: "Las contraseñas no coinciden." };
  if (!token || token.length > 100) return { ok: false, message: "El enlace no es válido o ha vencido." };

  const row = await db.passwordResetToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) return { ok: false, message: "El enlace no es válido o ha vencido." };

  await db.$transaction([
    db.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    db.user.update({
      where: { id: row.userId },
      data: { passwordHash: await hashPassword(pw), passwordChangedAt: new Date(), failedLogins: 0, lockedUntil: null },
    }),
    db.session.deleteMany({ where: { userId: row.userId } }),
  ]);
  await audit("auth.password_reset", { userId: row.userId });
  return { ok: true, message: "Contraseña actualizada. Ya puedes iniciar sesión." };
}

export async function changePasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireUser();
  const current = String(fd.get("current") ?? "");
  const pw = String(fd.get("password") ?? "");
  const pw2 = String(fd.get("password2") ?? "");
  const user = await db.user.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await verifyPassword(user.passwordHash, current))) return { ok: false, message: "La contraseña actual no es correcta." };
  const problem = passwordProblem(pw);
  if (problem) return { ok: false, message: problem };
  if (pw !== pw2) return { ok: false, message: "Las contraseñas no coinciden." };
  await db.user.update({ where: { id: me.id }, data: { passwordHash: await hashPassword(pw), passwordChangedAt: new Date() } });
  await db.session.deleteMany({ where: { userId: me.id } });
  await createSession(me.id);
  await audit("auth.password_changed", { userId: me.id });
  return { ok: true, message: "Contraseña actualizada. Se cerraron las demás sesiones." };
}
