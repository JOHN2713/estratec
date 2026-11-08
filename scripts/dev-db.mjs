// Postgres embebido para desarrollo local (no usar en producción).
import { existsSync, readFileSync, rmSync } from "node:fs";
import net from "node:net";
import path from "node:path";

const PORT = 54330;
const URL = `postgresql://estratec:estratec@localhost:${PORT}/estratec`;
const dir = path.resolve(".local-db-utf8");
const pidFile = path.join(dir, "postmaster.pid");

const portOpen = () =>
  new Promise((resolve) => {
    const s = net.connect(PORT, "127.0.0.1");
    s.once("connect", () => (s.destroy(), resolve(true)));
    s.once("error", () => resolve(false));
  });

const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

// 1) Ya hay una instancia respondiendo: no hace falta arrancar otra.
if (await portOpen()) {
  console.log(`La base local ya está corriendo en ${URL}`);
  console.log("Puedes continuar con: npm run dev");
  process.exit(0);
}

// 2) Bloqueo huérfano (Postgres se cerró sin limpiar): se elimina solo si el proceso ya no existe.
if (existsSync(pidFile)) {
  const pid = Number(readFileSync(pidFile, "utf8").split(/\r?\n/)[0]);
  if (pid && alive(pid)) {
    console.error(`Hay un Postgres (PID ${pid}) usando ${dir} pero no responde en el puerto ${PORT}.`);
    console.error(`Ciérralo desde el Administrador de tareas (postgres.exe, PID ${pid}) y vuelve a intentarlo.`);
    process.exit(1);
  }
  rmSync(pidFile);
  console.log("Se eliminó un archivo de bloqueo huérfano (postmaster.pid).");
}

const { default: EmbeddedPostgres } = await import("embedded-postgres");
const pg = new EmbeddedPostgres({
  databaseDir: dir,
  user: "estratec",
  password: "estratec",
  port: PORT,
  persistent: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

const fresh = !existsSync(path.join(dir, "PG_VERSION"));
try {
  if (fresh) await pg.initialise();
  await pg.start();
  if (fresh) await pg.createDatabase("estratec");
} catch (e) {
  console.error("No se pudo iniciar la base local:", e?.message ?? e);
  process.exit(1);
}
console.log(`Postgres local listo en ${URL}  (Ctrl+C para detener)`);
if (fresh) console.log("Base nueva: ejecuta  npx prisma migrate deploy  &&  npm run db:seed  &&  npm run admin:create");

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);
