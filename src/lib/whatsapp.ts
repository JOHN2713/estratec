/** Normaliza el número (solo dígitos) y construye un enlace wa.me con texto codificado. */
export function normalizePhone(raw: string): string {
  return (raw || "").replace(/\D/g, "");
}

export function waLink(number: string, text?: string): string {
  const n = normalizePhone(number);
  const base = `https://wa.me/${n}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/**
 * Redacción de Gmail en el navegador (no depende del programa de correo predeterminado del equipo,
 * a diferencia de mailto:). `account` selecciona la cuenta de Gmail con la que se redacta.
 */
export function gmailComposeUrl({ to, subject = "", body = "", account }: { to: string; subject?: string; body?: string; account?: string }): string {
  const p = new URLSearchParams({ view: "cm", fs: "1", to, su: subject, body });
  if (account) p.set("authuser", account);
  return `https://mail.google.com/mail/?${p.toString()}`;
}
