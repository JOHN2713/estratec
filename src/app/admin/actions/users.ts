"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { randomToken } from "@/lib/crypto";
import type { ActionState } from "./types";

const isId = (v: unknown): v is string => typeof v === "string" && /^[a-z0-9]{20,40}$/i.test(v);

export async function createUserAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const p = z
    .object({
      name: z.string().trim().min(2, "Nombre requerido").max(120),
      email: z.string().trim().toLowerCase().max(160).pipe(z.email("Correo inválido")),
      role: z.enum(["ADMIN", "EDITOR"]),
    })
    .safeParse({ name: fd.get("name"), email: fd.get("email"), role: fd.get("role") });
  if (!p.success) return { ok: false, message: p.error.issues[0]!.message };
  if (await db.user.findUnique({ where: { email: p.data.email } })) return { ok: false, message: "Ya existe un usuario con ese correo." };
  const temp = `${randomToken(9)}-${Math.floor(Math.random() * 90 + 10)}`;
  const user = await db.user.create({ data: { ...p.data, passwordHash: await hashPassword(temp) } });
  await audit("user.created", { userId: me.id, entity: "User", entityId: user.id, meta: { role: p.data.role } });
  revalidatePath("/admin/usuarios");
  return {
    ok: true,
    message: `Usuario creado. Comparte la contraseña temporal por un canal seguro; se muestra una sola vez. También puede usar “¿Olvidaste tu contraseña?”.`,
    secret: temp,
  };
}

export async function updateUserAction(fd: FormData) {
  const me = await requireAdmin();
  const id = fd.get("id");
  if (!isId(id)) return;
  const op = String(fd.get("op"));
  if (id === me.id && op !== "sessions") return; // no puede degradarse ni desactivarse a sí mismo
  const target = await db.user.findUnique({ where: { id } });
  if (!target) return;

  if (op === "role") {
    const role = fd.get("role") === "ADMIN" ? "ADMIN" : "EDITOR";
    if (role === "EDITOR" && target.role === "ADMIN" && (await db.user.count({ where: { role: "ADMIN", active: true } })) <= 1) return;
    await db.user.update({ where: { id }, data: { role } });
    await db.session.deleteMany({ where: { userId: id } });
    await audit("user.role_changed", { userId: me.id, entity: "User", entityId: id, meta: { from: target.role, to: role } });
  } else if (op === "toggle") {
    if (target.active && target.role === "ADMIN" && (await db.user.count({ where: { role: "ADMIN", active: true } })) <= 1) return;
    await db.user.update({ where: { id }, data: { active: !target.active } });
    if (target.active) await db.session.deleteMany({ where: { userId: id } });
    await audit(target.active ? "user.deactivated" : "user.activated", { userId: me.id, entity: "User", entityId: id });
  } else if (op === "sessions") {
    await db.session.deleteMany({ where: { userId: id } });
    await audit("user.sessions_revoked", { userId: me.id, entity: "User", entityId: id });
  } else if (op === "unlock") {
    await db.user.update({ where: { id }, data: { failedLogins: 0, lockedUntil: null } });
    await audit("user.unlocked", { userId: me.id, entity: "User", entityId: id });
  }
  revalidatePath("/admin/usuarios");
}
