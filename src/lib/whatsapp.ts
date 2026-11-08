/** Normaliza el número (solo dígitos) y construye un enlace wa.me con texto codificado. */
export function normalizePhone(raw: string): string {
  return (raw || "").replace(/\D/g, "");
}

export function waLink(number: string, text?: string): string {
  const n = normalizePhone(number);
  const base = `https://wa.me/${n}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
