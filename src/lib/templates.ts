/** Sustituye {variables} en plantillas. Las variables desconocidas se dejan vacías. */
export function renderTemplate(tpl: string, vars: Record<string, string | null | undefined>): string {
  return tpl.replace(/\{([a-z_]+)\}/g, (_, k: string) => (vars[k] ?? "").toString());
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Texto plano (con **negritas**) → HTML seguro: se escapa todo antes de aplicar formato. */
export function textToSafeHtml(text: string): string {
  const esc = escapeHtml(text);
  const paragraphs = esc.split(/\n{2,}/).map((p) => {
    const withBold = p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    if (/^- /m.test(withBold)) {
      const lines = withBold.split("\n");
      const items = lines.filter((l) => l.startsWith("- ")).map((l) => `<li>${l.slice(2)}</li>`).join("");
      const head = lines.filter((l) => !l.startsWith("- ")).join("<br>");
      return `${head ? `<p>${head}</p>` : ""}<ul>${items}</ul>`;
    }
    return `<p>${withBold.replace(/\n/g, "<br>")}</p>`;
  });
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#0b2239;max-width:600px">${paragraphs.join("")}</div>`;
}

export function stripBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1");
}
