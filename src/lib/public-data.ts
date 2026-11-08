import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import { db } from "./db";

async function visible() {
  const { isEnabled } = await draftMode();
  return isEnabled ? {} : { status: "PUBLISHED" as const };
}

/**
 * Las consultas públicas NO ocultan errores de base de datos: si fallan, la página lanza error y
 * Next/Vercel conserva la última versión válida en caché (ISR) en lugar de publicar un 404 o una
 * página vacía.
 */
async function safe<T>(fn: () => Promise<T>, _fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error("[public-data]", (e as Error).message);
    throw e;
  }
}

export const getServices = cache(async () =>
  safe(async () => db.service.findMany({ where: await visible(), orderBy: [{ order: "asc" }, { name: "asc" }] }), []),
);

export const getService = cache(async (slug: string) =>
  safe(
    async () =>
      db.service.findFirst({
        where: { slug, ...(await visible()) },
        include: { faqs: { where: await visible(), orderBy: { order: "asc" } } },
      }),
    null,
  ),
);

export const getHomeFaqs = cache(async () =>
  safe(async () => db.faq.findMany({ where: { showOnHome: true, ...(await visible()) }, orderBy: { order: "asc" } }), []),
);

export const getProjects = cache(async () =>
  safe(async () => db.project.findMany({ where: await visible(), orderBy: [{ order: "asc" }, { createdAt: "desc" }] }), []),
);

export const getProject = cache(async (slug: string) =>
  safe(async () => db.project.findFirst({ where: { slug, ...(await visible()) } }), null),
);

export const getArticles = cache(async () =>
  safe(
    async () =>
      db.article.findMany({
        where: await visible(),
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        select: { id: true, slug: true, title: true, excerpt: true, image: true, imageAlt: true, publishedAt: true, author: true },
      }),
    [],
  ),
);

export const getArticle = cache(async (slug: string) =>
  safe(async () => db.article.findFirst({ where: { slug, ...(await visible()) } }), null),
);
