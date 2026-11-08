"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { blockSchemas, type BlockKey } from "@/lib/content";
import { settingSchemas, type SettingKey } from "@/lib/settings";
import type { ActionState } from "./types";

function parseJson(fd: FormData): unknown {
  const raw = String(fd.get("data") ?? "");
  if (raw.length > 200_000) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function issues(e: { issues: { path: PropertyKey[]; message: string }[] }) {
  const first = e.issues[0];
  return first ? `${first.path.join(" › ") || "Formulario"}: ${first.message}` : "Datos inválidos.";
}

export async function saveBlockAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser(["ADMIN", "EDITOR"]);
  const key = String(fd.get("key") ?? "") as BlockKey;
  if (!(key in blockSchemas)) return { ok: false, message: "Bloque desconocido." };
  const parsed = blockSchemas[key].safeParse(parseJson(fd));
  if (!parsed.success) return { ok: false, message: issues(parsed.error) };
  const data = parsed.data as Prisma.InputJsonValue;
  await db.contentBlock.upsert({ where: { key }, create: { key, data }, update: { data } });
  await audit("content.block_saved", { userId: user.id, entity: "ContentBlock", entityId: key });
  revalidatePath("/", "layout");
  return { ok: true, message: "Cambios publicados." };
}

const EDITOR_SETTINGS: SettingKey[] = ["seo"];

export async function saveSettingAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser(["ADMIN", "EDITOR"]);
  const key = String(fd.get("key") ?? "") as SettingKey;
  if (!(key in settingSchemas)) return { ok: false, message: "Configuración desconocida." };
  if (!can(user, "settings") && !EDITOR_SETTINGS.includes(key)) return { ok: false, message: "No tienes permisos para esta configuración." };
  const parsed = settingSchemas[key].safeParse(parseJson(fd));
  if (!parsed.success) return { ok: false, message: issues(parsed.error) };
  const value = parsed.data as Prisma.InputJsonValue;
  await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
  await audit("settings.saved", { userId: user.id, entity: "Setting", entityId: key });
  revalidatePath("/", "layout");
  return { ok: true, message: "Configuración guardada." };
}
