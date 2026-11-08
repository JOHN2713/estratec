// Prueba la conexión SMTP y envía un correo a SMTP_USER.  Uso: npm run mail:test
import nodemailer from "nodemailer";

async function main() {
  const { SMTP_HOST, SMTP_PORT = "465", SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("Faltan SMTP_HOST, SMTP_USER o SMTP_PASS en .env");
    process.exit(1);
  }
  const port = Number(SMTP_PORT);
  const t = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s+/g, "") },
  });
  await t.verify();
  console.log("✓ Conexión y autenticación SMTP correctas");
  const info = await t.sendMail({
    from: MAIL_FROM || SMTP_USER,
    to: SMTP_USER,
    subject: "Prueba SMTP — Estratec",
    text: "Si recibes este correo, el envío desde el sitio de Estratec está configurado correctamente.",
  });
  console.log(`✓ Correo de prueba enviado a ${SMTP_USER} (id ${info.messageId})`);
}

main().catch((e: { code?: string; message?: string }) => {
  console.error("✗ Falló:", e.code ?? "", (e.message ?? "").split("\n")[0]);
  if (e.code === "EAUTH") console.error("  Revisa que SMTP_PASS sea una contraseña de aplicación de Google (no la contraseña normal).");
  process.exit(1);
});
