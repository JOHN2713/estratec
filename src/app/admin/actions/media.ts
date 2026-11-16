"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp, { type OutputInfo, type Sharp } from "sharp";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { audit } from "@/lib/audit";
import type { ActionState } from "./types";

const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10 MB (bodySizeLimit global: 12 MB)
const MAX_DIMENSION = 2400; // px; suficiente para imágenes de héroe y contenido
const WEBP_QUALITY = 82;
const INPUT_FORMATS = new Set(["jpeg", "png", "webp", "gif", "avif"]);

const isId = (v: unknown): v is string => typeof v === "string" && /^[a-z0-9]{20,40}$/i.test(v);

export async function uploadMediaAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireEditor();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Selecciona una imagen." };
  if (file.size > MAX_INPUT_BYTES) return { ok: false, message: "La imagen supera el máximo de 10 MB." };

  const alt = String(fd.get("alt") ?? "").trim().slice(0, 200) || null;
  const filename = (file.name || "imagen").replace(/[\\/:*?"<>|]/g, "_").slice(0, 200);

  let input: Buffer;
  try {
    input = Buffer.from(await file.arrayBuffer());
  } catch {
    return { ok: false, message: "No se pudo leer el archivo." };
  }

  // El formato se detecta del contenido, nunca de la extensión ni del MIME declarado.
  let pipeline: Sharp;
  try {
    pipeline = sharp(input, { animated: true }).rotate();
    const meta = await pipeline.metadata();
    if (!meta.format || !INPUT_FORMATS.has(meta.format)) {
      return { ok: false, message: "Formato no admitido. Usa JPG, PNG, WebP, GIF o AVIF." };
    }
  } catch {
    return { ok: false, message: "El archivo no es una imagen válida." };
  }

  let out: { data: Buffer; info: OutputInfo };
  try {
    const result = await pipeline
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer({ resolveWithObject: true });
    out = { data: result.data, info: result.info };
  } catch {
    return { ok: false, message: "No se pudo convertir la imagen a WebP." };
  }

  const media = await db.mediaFile.create({
    data: {
      filename,
      mimeType: "image/webp",
      width: out.info.width,
      height: out.info.height,
      size: out.data.byteLength,
      data: new Uint8Array(out.data),
      alt,
      uploadedById: user.id,
    },
  });
  await audit("media.uploaded", {
    userId: user.id,
    entity: "MediaFile",
    entityId: media.id,
    meta: { filename, width: media.width, height: media.height, size: media.size },
  });
  revalidatePath("/admin/multimedia");
  return { ok: true, message: `Imagen subida y convertida a WebP (${media.width}×${media.height}). URL: /media/${media.id}` };
}

export async function saveMediaAltAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireEditor();
  const id = fd.get("id");
  if (!isId(id)) return { ok: false, message: "Identificador inválido." };
  const alt = String(fd.get("alt") ?? "").trim().slice(0, 200) || null;
  await db.mediaFile.update({ where: { id }, data: { alt } });
  await audit("media.alt_saved", { userId: user.id, entity: "MediaFile", entityId: id });
  revalidatePath("/admin/multimedia");
  return { ok: true, message: "Texto alternativo guardado." };
}

export async function deleteMediaAction(fd: FormData) {
  const user = await requireEditor();
  const id = fd.get("id");
  if (isId(id)) {
    const media = await db.mediaFile.delete({ where: { id } }).catch(() => null);
    if (media) {
      await audit("media.deleted", { userId: user.id, entity: "MediaFile", entityId: id, meta: { filename: media.filename } });
    }
  }
  revalidatePath("/admin/multimedia");
  redirect("/admin/multimedia?eliminado=1");
}
