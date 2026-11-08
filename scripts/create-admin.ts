// Crea (o restablece) el primer Administrador con ADMIN_EMAIL / ADMIN_NAME / ADMIN_PASSWORD.
import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const db = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const name = (process.env.ADMIN_NAME || "Administrador").trim();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || password.length < 12) {
    console.error("Define ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 12 caracteres) en el entorno o en .env");
    process.exit(1);
  }
  const passwordHash = await hash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1, algorithm: 2 });
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", active: true, failedLogins: 0, lockedUntil: null, passwordChangedAt: new Date() },
    create: { email, name, passwordHash, role: "ADMIN" },
  });
  await db.auditLog.create({ data: { action: "user.bootstrap_admin", entity: "User", entityId: user.id } });
  console.log(`Administrador listo: ${email}. Cambia la contraseña al ingresar si es temporal.`);
}

main().finally(() => db.$disconnect());
