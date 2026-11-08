"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { seoSchema } from "@/lib/seo";
import { ICON_NAMES } from "@/components/ui/Icon";
import { KIND_META, type Kind } from "@/lib/collection-specs";
import type { ActionState } from "./types";

const t = (max: number) => z.string().trim().max(max);
const req = (max: number, msg = "Requerido") => t(max).min(1, msg);
const slug = z.string().trim().toLowerCase().max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones");
const lines = z.array(t(300)).max(40);
const status = z.enum(["DRAFT", "PUBLISHED"]);
const order = z.coerce.number().int().min(0).max(999);
const mediaUrl = t(500).refine((v) => v === "" || (v.startsWith("/") && !v.startsWith("//")) || /^https:\/\/[^\s]+$/.test(v), "Ruta /… o URL https://");
const httpsUrl = t(500).refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "Debe ser una URL https://");
const internalPath = z.string().trim().max(300).regex(/^\/[^\s?#]*$/, "Debe empezar con / (sin dominio)");
const opt = (v: string) => (v === "" ? null : v);

const schemas = {
  service: z.object({
    status, name: req(120), shortName: req(60), slug, icon: z.enum(ICON_NAMES as [string, ...string[]]), order,
    summary: req(400), h1: req(160), intro: req(1200), problem: req(3000), includes: lines, solutions: lines, deliverables: lines,
    forWho: t(1500), ctaLabel: req(100), whatsappText: req(500), image: mediaUrl, imageAlt: t(200), seo: seoSchema,
  }),
  faq: z.object({
    status, question: req(300), answer: req(3000), serviceId: z.string().max(40), showOnHome: z.boolean(), order,
  }),
  project: z.object({
    status, title: req(160), slug, client: t(160), sector: t(120), summary: req(400), challenge: req(3000), solution: req(3000),
    tech: lines, results: t(2000), image: mediaUrl, imageAlt: t(200), videoUrl: httpsUrl, repoUrl: httpsUrl, order, seo: seoSchema,
  }),
  article: z.object({
    status, title: req(180), slug, excerpt: req(400), author: t(120), body: req(60000), image: mediaUrl, imageAlt: t(200), seo: seoSchema,
  }),
  redirect: z.object({ from: internalPath, to: t(500).refine((v) => (v.startsWith("/") && !v.startsWith("//")) || /^https:\/\//.test(v), "Ruta /… o URL https://"), permanent: z.boolean() }),
} as const;

function parse(fd: FormData) {
  const raw = String(fd.get("data") ?? "");
  if (raw.length > 200_000) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

const isId = (v: unknown): v is string => typeof v === "string" && /^[a-z0-9]{20,40}$/i.test(v);

async function slugRedirect(base: string, oldSlug: string, newSlug: string) {
  if (oldSlug === newSlug) return;
  const from = `${base}/${oldSlug}`;
  const to = `${base}/${newSlug}`;
  await db.redirect.deleteMany({ where: { from: to } }); // evita bucles
  await db.redirect.upsert({ where: { from }, create: { from, to, permanent: true }, update: { to, permanent: true } });
  await db.redirect.updateMany({ where: { to: from }, data: { to } }); // aplana cadenas
}

export async function saveItemAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireEditor();
  const kind = String(fd.get("kind")) as Kind;
  if (!(kind in schemas)) return { ok: false, message: "Tipo desconocido." };
  const id = fd.get("id");
  const editing = isId(id) ? id : null;
  const parsed = schemas[kind].safeParse(parse(fd));
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, message: i ? `${i.path.join(" › ")}: ${i.message}` : "Datos inválidos." };
  }
  const d = parsed.data as Record<string, unknown>;
  const meta = KIND_META[kind];
  let newId = editing;

  try {
    switch (kind) {
      case "service": {
        const data = { ...(d as z.infer<typeof schemas.service>) };
        const row = { ...data, image: opt(data.image), imageAlt: opt(data.imageAlt), seo: data.seo as Prisma.InputJsonValue };
        if (editing) {
          const prev = await db.service.findUniqueOrThrow({ where: { id: editing }, select: { slug: true, status: true } });
          await db.service.update({ where: { id: editing }, data: row });
          if (prev.status === "PUBLISHED") await slugRedirect("/servicios", prev.slug, data.slug);
        } else newId = (await db.service.create({ data: row })).id;
        break;
      }
      case "faq": {
        const data = d as z.infer<typeof schemas.faq>;
        const serviceId = data.serviceId && (await db.service.findUnique({ where: { id: data.serviceId }, select: { id: true } })) ? data.serviceId : null;
        const row = { ...data, serviceId };
        if (editing) await db.faq.update({ where: { id: editing }, data: row });
        else newId = (await db.faq.create({ data: row })).id;
        break;
      }
      case "project": {
        const data = d as z.infer<typeof schemas.project>;
        const row = {
          ...data, client: opt(data.client), sector: opt(data.sector), results: opt(data.results), image: opt(data.image),
          imageAlt: opt(data.imageAlt), videoUrl: opt(data.videoUrl), repoUrl: opt(data.repoUrl), seo: data.seo as Prisma.InputJsonValue,
        };
        if (editing) {
          const prev = await db.project.findUniqueOrThrow({ where: { id: editing }, select: { slug: true, status: true } });
          await db.project.update({ where: { id: editing }, data: row });
          if (prev.status === "PUBLISHED") await slugRedirect("/proyectos", prev.slug, data.slug);
        } else newId = (await db.project.create({ data: row })).id;
        break;
      }
      case "article": {
        const data = d as z.infer<typeof schemas.article>;
        const row = { ...data, author: opt(data.author), image: opt(data.image), imageAlt: opt(data.imageAlt), seo: data.seo as Prisma.InputJsonValue };
        if (editing) {
          const prev = await db.article.findUniqueOrThrow({ where: { id: editing }, select: { slug: true, status: true, publishedAt: true } });
          await db.article.update({
            where: { id: editing },
            data: { ...row, publishedAt: prev.publishedAt ?? (data.status === "PUBLISHED" ? new Date() : null) },
          });
          if (prev.status === "PUBLISHED") await slugRedirect("/recursos", prev.slug, data.slug);
        } else newId = (await db.article.create({ data: { ...row, publishedAt: data.status === "PUBLISHED" ? new Date() : null } })).id;
        break;
      }
      case "redirect": {
        const data = d as z.infer<typeof schemas.redirect>;
        if (data.from === data.to) return { ok: false, message: "El origen y el destino no pueden ser iguales." };
        if (data.from.startsWith("/admin") || data.from.startsWith("/api")) return { ok: false, message: "No se permiten redirecciones desde /admin o /api." };
        if (editing) await db.redirect.update({ where: { id: editing }, data });
        else newId = (await db.redirect.create({ data })).id;
        break;
      }
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, message: kind === "redirect" ? "Ya existe una redirección desde esa ruta." : "Ese slug ya está en uso." };
    }
    console.error("[collections] error al guardar", kind, (e as Error).message);
    return { ok: false, message: "No se pudo guardar. Inténtalo de nuevo." };
  }

  await audit(`content.${kind}_${editing ? "updated" : "created"}`, { userId: user.id, entity: kind, entityId: newId ?? undefined });
  revalidatePath("/", "layout");
  if (!editing) redirect(`${meta.base}/${newId}?creado=1`);
  return { ok: true, message: "Guardado y publicado según su estado." };
}

export async function deleteItemAction(fd: FormData) {
  const user = await requireEditor();
  const kind = String(fd.get("kind")) as Kind;
  const id = fd.get("id");
  if (!(kind in schemas) || !isId(id)) return;
  switch (kind) {
    case "service":
      await db.service.delete({ where: { id } });
      break;
    case "faq":
      await db.faq.delete({ where: { id } });
      break;
    case "project":
      await db.project.delete({ where: { id } });
      break;
    case "article":
      await db.article.delete({ where: { id } });
      break;
    case "redirect":
      await db.redirect.delete({ where: { id } });
      break;
  }
  await audit(`content.${kind}_deleted`, { userId: user.id, entity: kind, entityId: id });
  revalidatePath("/", "layout");
  redirect(`${KIND_META[kind].base}?eliminado=1`);
}

export async function togglePublishAction(fd: FormData) {
  const user = await requireEditor();
  const kind = String(fd.get("kind")) as Kind;
  const id = fd.get("id");
  if (!isId(id)) return;
  const to = fd.get("to") === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  if (kind === "service") await db.service.update({ where: { id }, data: { status: to } });
  else if (kind === "faq") await db.faq.update({ where: { id }, data: { status: to } });
  else if (kind === "project") await db.project.update({ where: { id }, data: { status: to } });
  else if (kind === "article") {
    const a = await db.article.findUniqueOrThrow({ where: { id }, select: { publishedAt: true } });
    await db.article.update({ where: { id }, data: { status: to, publishedAt: a.publishedAt ?? (to === "PUBLISHED" ? new Date() : null) } });
  } else return;
  await audit(`content.${kind}_${to === "PUBLISHED" ? "published" : "unpublished"}`, { userId: user.id, entity: kind, entityId: id });
  revalidatePath("/", "layout");
}
