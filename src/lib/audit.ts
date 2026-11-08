import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { hashIp } from "./crypto";
import { clientIp } from "./request";

/** Registra acciones administrativas sensibles. Nunca incluir contraseñas, tokens ni mensajes completos. */
export async function audit(
  action: string,
  opts: { userId?: string | null; entity?: string; entityId?: string; meta?: Prisma.InputJsonValue } = {},
) {
  try {
    await db.auditLog.create({
      data: {
        action,
        userId: opts.userId ?? null,
        entity: opts.entity,
        entityId: opts.entityId,
        meta: opts.meta,
        ipHash: hashIp(await clientIp()),
      },
    });
  } catch (e) {
    console.error("[audit] no se pudo registrar", action, (e as Error).message);
  }
}
