"use client";

import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { FieldSpec } from "@/lib/editor-specs";
import type { ActionState } from "@/app/admin/actions/types";
import { FormAlert, SubmitButton } from "./ui";

type Data = Record<string, unknown>;
type Opt = { slug: string; name: string };

function setIn(obj: Data, key: string, value: unknown): Data {
  return { ...obj, [key]: value };
}

function emptyFor(fields: FieldSpec[]): Data {
  const o: Data = {};
  for (const f of fields) {
    o[f.key] = f.type === "bool" ? false : f.type === "lines" || f.type === "services" || f.type === "list" ? [] : f.type === "group" ? emptyFor(f.fields) : "";
  }
  return o;
}

function Fields({ fields, value, onChange, services, path }: { fields: FieldSpec[]; value: Data; onChange: (v: Data) => void; services: Opt[]; path: string }) {
  return (
    <div className="space-y-5">
      {fields.map((f) => (
        <FieldRow key={f.key} f={f} value={value[f.key]} parent={value} onChange={(v) => onChange(setIn(value, f.key, v))} services={services} path={`${path}.${f.key}`} />
      ))}
    </div>
  );
}

function FieldRow({ f, value, parent, onChange, services, path }: { f: FieldSpec; value: unknown; parent: Data; onChange: (v: unknown) => void; services: Opt[]; path: string }) {
  const id = path.replace(/[^a-z0-9]/gi, "-");
  const hint = f.hint ? <p className="field-hint">{f.hint}</p> : null;

  switch (f.type) {
    case "text":
    case "email":
    case "url": {
      const v = String(value ?? "");
      return (
        <div>
          <label htmlFor={id} className="field-label">{f.label}</label>
          <input id={id} type={f.type === "text" ? "text" : f.type} value={v} maxLength={"max" in f ? f.max : undefined} onChange={(e) => onChange(e.target.value)} className="field" />
          <div className="flex justify-between gap-3">{hint}{"max" in f && f.max ? <span className="field-hint ml-auto tabular-nums">{v.length}/{f.max}</span> : null}</div>
        </div>
      );
    }
    case "textarea":
    case "markdown": {
      const v = String(value ?? "");
      return (
        <div>
          <label htmlFor={id} className="field-label">{f.label}</label>
          <textarea id={id} rows={f.rows ?? 3} value={v} maxLength={f.max} onChange={(e) => onChange(e.target.value)} className={`field ${f.type === "markdown" ? "font-mono text-[13px]" : ""}`} />
          <div className="flex justify-between gap-3">
            {hint ?? (f.type === "markdown" ? <p className="field-hint">Markdown: ## títulos, **negritas**, - listas, [enlaces](https://…). No se admite HTML.</p> : null)}
            {f.max ? <span className="field-hint ml-auto tabular-nums">{v.length}/{f.max}</span> : null}
          </div>
        </div>
      );
    }
    case "bool":
      return (
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-[#54ACBF]" />
          <span>
            <span className="text-sm font-medium text-ink">{f.label}</span>
            {hint}
          </span>
        </label>
      );
    case "lines": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          <label htmlFor={id} className="field-label">{f.label}</label>
          <textarea
            id={id}
            rows={Math.max(3, arr.length + 1)}
            value={arr.join("\n")}
            onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trimStart()).slice(0, f.max ?? 50))}
            className="field"
          />
          {hint}
        </div>
      );
    }
    case "select":
      return (
        <div>
          <label htmlFor={id} className="field-label">{f.label}</label>
          <select id={id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className="field">
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {hint}
        </div>
      );
    case "number":
      return (
        <div>
          <label htmlFor={id} className="field-label">{f.label}</label>
          <input id={id} type="number" min={f.min} max={f.max} value={Number(value ?? 0)} onChange={(e) => onChange(Number(e.target.value))} className="field max-w-[10rem]" />
          {hint}
        </div>
      );
    case "seo":
      return <SeoFields f={f} value={(value as Data) ?? {}} parent={parent} onChange={onChange} />;
    case "service":
      return (
        <div>
          <label htmlFor={id} className="field-label">{f.label}</label>
          <select id={id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className="field">
            <option value="">— Página de servicios —</option>
            {services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
          {hint}
        </div>
      );
    case "services": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <fieldset>
          <legend className="field-label">{f.label}</legend>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <label key={s.slug} className="inline-flex items-center gap-2 rounded-lg border border-luna-50/15 px-2.5 py-1.5 text-xs has-[:checked]:border-luna-300 has-[:checked]:bg-luna-300/10">
                <input
                  type="checkbox"
                  checked={arr.includes(s.slug)}
                  onChange={(e) => onChange(e.target.checked ? [...arr, s.slug].slice(0, 4) : arr.filter((x) => x !== s.slug))}
                  className="accent-[#54ACBF]"
                />
                {s.name}
              </label>
            ))}
          </div>
          {hint}
        </fieldset>
      );
    }
    case "group":
      return (
        <fieldset className="rounded-2xl border border-luna-50/10 bg-luna-700/25 p-5">
          <legend className="px-1 text-base font-semibold text-white">{f.label}</legend>
          {hint}
          <div className="mt-3">
            <Fields fields={f.fields} value={(value as Data) ?? {}} onChange={onChange} services={services} path={path} />
          </div>
        </fieldset>
      );
    case "list": {
      const arr = Array.isArray(value) ? (value as Data[]) : [];
      const move = (i: number, d: number) => {
        const n = [...arr];
        const [x] = n.splice(i, 1);
        n.splice(i + d, 0, x!);
        onChange(n);
      };
      return (
        <div>
          <p className="field-label">{f.label}</p>
          {hint}
          <ol className="mt-2 space-y-3">
            {arr.map((it, i) => (
              <li key={i} className="rounded-xl border border-luna-50/10 bg-luna-900/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-dim">{f.itemLabel} {i + 1}</span>
                  <span className="flex gap-1">
                    <button type="button" className="btn-ghost btn-sm !px-2" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Subir"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" className="btn-ghost btn-sm !px-2" disabled={i === arr.length - 1} onClick={() => move(i, 1)} aria-label="Bajar"><ArrowDown className="h-4 w-4" /></button>
                    <button type="button" className="btn-ghost btn-sm !px-2 text-rose-300" onClick={() => onChange(arr.filter((_, j) => j !== i))} aria-label={`Eliminar ${f.itemLabel} ${i + 1}`}><Trash2 className="h-4 w-4" /></button>
                  </span>
                </div>
                <Fields fields={f.fields} value={it} onChange={(v) => onChange(arr.map((x, j) => (j === i ? v : x)))} services={services} path={`${path}.${i}`} />
              </li>
            ))}
          </ol>
          {(!f.max || arr.length < f.max) && (
            <button type="button" className="btn-secondary btn-sm mt-3" onClick={() => onChange([...arr, emptyFor(f.fields)])}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Añadir {f.itemLabel.toLowerCase()}
            </button>
          )}
        </div>
      );
    }
  }
}

function SeoFields({ f, value, parent, onChange }: { f: Extract<FieldSpec, { type: "seo" }>; value: Data; parent: Data; onChange: (v: unknown) => void }) {
  const get = (k: string) => String(value[k] ?? "");
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  const slug = String(parent[f.slugKey] ?? "");
  const title = get("title") || String(parent[f.titleKey] ?? "");
  const desc = get("description") || String(parent[f.descKey] ?? "");
  const url = `estratec.org${f.basePath}${slug ? `/${slug}` : ""}`;
  const warnings: string[] = [];
  if (!get("title")) warnings.push("Sin meta title propio: se usará el título del contenido.");
  if (!get("description")) warnings.push("Sin meta description propia: se usará el resumen.");
  if (title.length > 60) warnings.push(`El título tiene ${title.length} caracteres; Google suele mostrar ~60.`);
  if (title.length && title.length < 20) warnings.push("El título es muy corto.");
  if (desc.length > 160) warnings.push(`La descripción tiene ${desc.length} caracteres; se recomienda ≤ 160.`);
  if (desc.length && desc.length < 70) warnings.push("La descripción es corta; se recomiendan 120–160 caracteres.");
  if (value.noindex) warnings.push("Esta página no se indexará (noindex) y no aparecerá en el sitemap.");
  const input = (k: string, label: string, max: number, area = false, hintText?: string) => (
    <div>
      <label htmlFor={`seo-${k}`} className="field-label">{label}</label>
      {area ? (
        <textarea id={`seo-${k}`} rows={2} maxLength={max} value={get(k)} onChange={(e) => set(k, e.target.value)} className="field" />
      ) : (
        <input id={`seo-${k}`} maxLength={max} value={get(k)} onChange={(e) => set(k, e.target.value)} className="field" />
      )}
      <div className="flex justify-between gap-3">{hintText ? <p className="field-hint">{hintText}</p> : <span />}<span className="field-hint tabular-nums">{get(k).length}/{max}</span></div>
    </div>
  );
  return (
    <fieldset className="rounded-2xl border border-luna-50/10 bg-luna-700/25 p-5">
      <legend className="px-1 text-base font-semibold text-white">{f.label}</legend>
      <div className="mb-5 rounded-xl bg-white p-4 font-sans" aria-label="Vista previa en buscadores">
        <p className="truncate text-xs text-[#4d5156]">{url}</p>
        <p className="mt-0.5 line-clamp-1 text-lg text-[#1a0dab]">{title || "Título de la página"} | Estratec</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-[#4d5156]">{desc || "Descripción de la página…"}</p>
      </div>
      {warnings.length > 0 && (
        <ul className="mb-5 space-y-1 text-xs text-amber-300">{warnings.map((w) => <li key={w}>• {w}</li>)}</ul>
      )}
      <div className="grid gap-4">
        {input("title", "Meta title", 120)}
        {input("description", "Meta description", 320, true)}
        {input("canonical", "URL canónica (opcional)", 500, false, "Vacío = la propia URL. Ruta /… o URL https://")}
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={!!value.noindex} onChange={(e) => set("noindex", e.target.checked)} className="h-4 w-4 accent-[#54ACBF]" />
          No indexar esta página (noindex)
        </label>
        <details>
          <summary className="cursor-pointer text-sm text-ink-muted hover:text-white">Open Graph (redes sociales)</summary>
          <div className="mt-4 grid gap-4">
            {input("ogTitle", "OG title", 120)}
            {input("ogDescription", "OG description", 320, true)}
            {input("ogImage", "OG image (ruta o URL https, 1200×630)", 500)}
          </div>
        </details>
      </div>
    </fieldset>
  );
}

/** Limpia líneas vacías de los campos "lines" antes de enviar. */
function clean(fields: FieldSpec[], v: Data): Data {
  const out: Data = { ...v };
  for (const f of fields) {
    if (f.type === "lines") out[f.key] = ((v[f.key] as string[]) ?? []).map((s) => s.trim()).filter(Boolean);
    else if (f.type === "group") out[f.key] = clean(f.fields, (v[f.key] as Data) ?? {});
    else if (f.type === "list") out[f.key] = ((v[f.key] as Data[]) ?? []).map((x) => clean(f.fields, x));
  }
  return out;
}

export function SpecEditor({
  fields,
  initial,
  action,
  hidden,
  services = [],
  submitLabel = "Guardar cambios",
}: {
  fields: FieldSpec[];
  initial: Data;
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  hidden?: Record<string, string>;
  services?: Opt[];
  submitLabel?: string;
}) {
  const [data, setData] = useState<Data>(initial);
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className="space-y-6">
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <input type="hidden" name="data" value={JSON.stringify(clean(fields, data))} />
      <Fields fields={fields} value={data} onChange={setData} services={services} path="f" />
      <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center gap-3 border-t border-luna-50/10 bg-[#01142f]/95 px-1 py-4 backdrop-blur">
        <SubmitButton>{submitLabel}</SubmitButton>
        <div className="min-w-0 flex-1"><FormAlert state={state} /></div>
      </div>
    </form>
  );
}
