"use client";

import { useActionState, useState } from "react";
import { Check, Copy, Trash2, Upload } from "lucide-react";
import { deleteMediaAction, saveMediaAltAction, uploadMediaAction } from "@/app/admin/actions/media";
import { ConfirmButton, FormAlert, SubmitButton } from "./ui";

export type MediaItem = {
  id: string;
  filename: string;
  width: number;
  height: number;
  size: number;
  alt: string | null;
  uploadedBy: string | null;
};

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function MediaUploadForm() {
  const [state, action] = useActionState(uploadMediaAction, null);
  return (
    <form action={action} className="max-w-xl space-y-4">
      <div>
        <label htmlFor="media-file" className="field-label">Imagen</label>
        <input
          id="media-file"
          name="file"
          type="file"
          required
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="field file:mr-4 file:rounded-lg file:border-0 file:bg-luna-300/15 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-luna-50 hover:file:bg-luna-300/25"
        />
        <p className="field-hint">JPG, PNG, WebP, GIF o AVIF · máx. 10 MB. Se convierte a WebP automáticamente (máx. 2400 px por lado).</p>
      </div>
      <div>
        <label htmlFor="media-alt" className="field-label">Texto alternativo (opcional)</label>
        <input id="media-alt" name="alt" type="text" maxLength={200} className="field" placeholder="Describe la imagen para accesibilidad y SEO" />
      </div>
      <SubmitButton pendingText="Convirtiendo a WebP…">
        <Upload className="h-4 w-4" aria-hidden="true" /> Subir imagen
      </SubmitButton>
      <FormAlert state={state} />
    </form>
  );
}

function CopyUrlButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn-secondary btn-sm"
      title="Copia la ruta relativa: es la que aceptan los campos de imagen de los contenidos"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`/media/${id}`);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* portapapeles no disponible */
        }
      }}
    >
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {copied ? "Copiada" : "Copiar URL"}
    </button>
  );
}

function AltForm({ item }: { item: MediaItem }) {
  const [state, action] = useActionState(saveMediaAltAction, null);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={item.id} />
      <div className="flex items-center gap-2">
        <input
          name="alt"
          defaultValue={item.alt ?? ""}
          maxLength={200}
          placeholder="Texto alternativo…"
          aria-label={`Texto alternativo de ${item.filename}`}
          className="field min-w-0 flex-1 !px-3 !py-1.5 text-sm"
        />
        <SubmitButton className="btn-ghost btn-sm shrink-0" pendingText="…">Guardar alt</SubmitButton>
      </div>
      {state?.message && (
        <p role={state.ok ? "status" : "alert"} className={`mt-1.5 text-xs ${state.ok ? "text-emerald-300" : "text-rose-300"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

export function MediaGrid({ items }: { items: MediaItem[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((m) => (
        <li key={m.id} className="card overflow-hidden">
          <a href={`/media/${m.id}`} target="_blank" rel="noreferrer" className="block aspect-[4/3] bg-luna-900/60" title="Abrir en tamaño completo">
            {/* eslint-disable-next-line @next/next/no-img-element -- ya es WebP optimizado; evita re-optimización */}
            <img src={`/media/${m.id}`} alt={m.alt ?? m.filename} loading="lazy" className="h-full w-full object-contain" />
          </a>
          <div className="space-y-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white" title={m.filename}>{m.filename}</p>
              <p className="text-xs text-ink-dim">
                {m.width}×{m.height} · {formatBytes(m.size)}{m.uploadedBy ? ` · ${m.uploadedBy}` : ""}
              </p>
            </div>
            <AltForm item={m} />
            <div className="flex items-center justify-between gap-2">
              <code className="truncate text-xs text-ink-muted">/media/{m.id}</code>
              <div className="flex shrink-0 items-center gap-1.5">
                <CopyUrlButton id={m.id} />
                <form action={deleteMediaAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <ConfirmButton
                    message={`¿Eliminar "${m.filename}"? Los contenidos que la usen dejarán de mostrarla.`}
                    className="btn-ghost btn-sm text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </ConfirmButton>
                </form>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
