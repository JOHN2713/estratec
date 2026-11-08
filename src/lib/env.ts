import "server-only";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Falta la variable de entorno ${name}`);
  return v;
}

export const env = {
  get siteUrl() {
    return (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  },
  get authSecret() {
    const s = required("AUTH_SECRET");
    if (s.length < 32) throw new Error("AUTH_SECRET debe tener al menos 32 caracteres");
    return s;
  },
  get resendKey() {
    return process.env.RESEND_API_KEY || "";
  },
  get mailFrom() {
    return process.env.MAIL_FROM || "Estratec <no-responder@estratec.org>";
  },
  isProd: process.env.NODE_ENV === "production",
};
