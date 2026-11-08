"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { COUNTRIES, NOT_SURE, SLOTS, leadFormSchema } from "@/lib/leads";
import { track } from "@/lib/analytics";
import { WaLink } from "./TrackedLinks";

type Opt = { slug: string; name: string };
type Errors = Partial<Record<string, string>>;

const UTM_KEYS = ["source", "medium", "campaign", "term", "content"] as const;

export function LeadForm({
  services,
  defaultService,
  whatsappHref,
  disabledText,
}: {
  services: Opt[];
  defaultService?: string;
  whatsappHref: string;
  disabledText?: string | null;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverMsg, setServerMsg] = useState("");
  const [successWa, setSuccessWa] = useState(whatsappHref);
  const [service, setService] = useState(defaultService ?? "");
  const started = useRef(false);
  const token = useRef<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetch("/api/leads/token", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { token?: string }) => (token.current = d.token ?? ""))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (defaultService) return setService(defaultService);
    const fromUrl = new URLSearchParams(window.location.search).get("servicio");
    if (fromUrl && (fromUrl === NOT_SURE || services.some((s) => s.slug === fromUrl))) setService(fromUrl);
  }, [defaultService, services]);

  if (disabledText) {
    return (
      <div className="card p-6 text-ink-muted">
        <p>{disabledText}</p>
        <div className="mt-4">
          <WaLink href={whatsappHref} location="formulario_deshabilitado">Escribir por WhatsApp</WaLink>
        </div>
      </div>
    );
  }

  function onFocus() {
    if (!started.current) {
      started.current = true;
      track("form_start", { location: typeof window !== "undefined" ? window.location.pathname : "" });
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      company: String(fd.get("company") ?? ""),
      service: String(fd.get("service") ?? ""),
      message: String(fd.get("message") ?? ""),
      contactPref: String(fd.get("contactPref") ?? "WHATSAPP") as "WHATSAPP" | "EMAIL",
      preferredDate: String(fd.get("preferredDate") ?? ""),
      preferredSlot: String(fd.get("preferredSlot") ?? ""),
      country: String(fd.get("country") ?? ""),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone?.slice(0, 80) ?? "",
      privacy: fd.get("privacy") === "on",
    };
    const parsed = leadFormSchema.safeParse(data);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        errs[k] ??= issue.message;
      }
      setErrors(errs);
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setState("sending");
    const params = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(UTM_KEYS.map((k) => [k, params.get(`utm_${k}`) ?? undefined]).filter(([, v]) => v));
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: parsed.data,
          meta: {
            originUrl: window.location.href.slice(0, 500),
            utm,
            token: token.current,
            website: String(fd.get("website") ?? ""),
          },
        }),
      });
      const out = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: Errors; whatsapp?: string };
      if (!res.ok || !out.ok) {
        if (out.fields) setErrors(out.fields);
        setServerMsg(out.error || "No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.");
        setState("error");
        return;
      }
      track("form_submit_success", { service: parsed.data.service });
      if (parsed.data.preferredDate || parsed.data.preferredSlot) track("appointment_request", { service: parsed.data.service });
      if (out.whatsapp) setSuccessWa(out.whatsapp);
      setState("done");
    } catch {
      setServerMsg("Hubo un problema de conexión. Inténtalo de nuevo o escríbenos por WhatsApp.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="card p-6 sm:p-8" role="status" aria-live="polite">
        <CheckCircle2 className="h-10 w-10 text-luna-50" aria-hidden="true" />
        <h3 className="mt-4 text-2xl font-bold">¡Recibimos tu solicitud!</h3>
        <p className="mt-3 text-ink-muted">
          Nuestro equipo revisará tu requerimiento y te contactará por el medio que indicaste. Si propusiste una fecha u horario, es una
          <strong className="text-white"> preferencia</strong>: la cita se confirma solo cuando una persona del equipo acuerde el horario contigo.
        </p>
        <p className="mt-3 text-ink-muted">Si nos dejaste un correo válido, te enviamos una confirmación de recepción.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <WaLink href={successWa} location="formulario_exito" service={service}>Continuar por WhatsApp</WaLink>
          <Link href="/" className="btn-secondary">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={`${k}-error`} className="field-error">
        {errors[k]}
      </p>
    ) : null;
  const a11y = (k: string) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `${k}-error` : undefined });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form ref={formRef} onSubmit={onSubmit} onFocus={onFocus} noValidate className="card p-5 sm:p-8" aria-busy={state === "sending"}>
      {/* Honeypot: invisible para personas, atractivo para bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Sitio web
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="lf-name" className="field-label">Nombre y apellido *</label>
          <input id="lf-name" name="name" className="field" autoComplete="name" maxLength={120} required {...a11y("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="lf-email" className="field-label">Correo electrónico *</label>
          <input id="lf-email" name="email" type="email" inputMode="email" className="field" autoComplete="email" maxLength={160} required {...a11y("email")} />
          {err("email")}
        </div>
        <div>
          <label htmlFor="lf-phone" className="field-label">Teléfono / WhatsApp *</label>
          <input id="lf-phone" name="phone" type="tel" inputMode="tel" className="field" autoComplete="tel" placeholder="+593 99 000 0000" maxLength={40} required {...a11y("phone")} />
          {err("phone")}
        </div>
        <div>
          <label htmlFor="lf-company" className="field-label">Empresa <span className="text-ink-dim">(opcional)</span></label>
          <input id="lf-company" name="company" className="field" autoComplete="organization" maxLength={160} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="lf-service" className="field-label">Servicio de interés *</label>
          <select id="lf-service" name="service" className="field" value={service} onChange={(e) => setService(e.target.value)} required {...a11y("service")}>
            <option value="">Selecciona una opción</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
            <option value={NOT_SURE}>No estoy seguro/a</option>
          </select>
          {err("service")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="lf-message" className="field-label">Cuéntanos brevemente qué necesitas *</label>
          <textarea id="lf-message" name="message" rows={4} className="field resize-y" maxLength={3000} required {...a11y("message")} />
          {err("message")}
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="field-label">¿Cómo prefieres que te contactemos?</legend>
          <div className="mt-1 flex flex-wrap gap-3">
            {[
              { v: "WHATSAPP", l: "WhatsApp" },
              { v: "EMAIL", l: "Correo" },
            ].map((o) => (
              <label key={o.v} className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-luna-50/15 px-4 py-2.5 text-sm has-[:checked]:border-luna-300 has-[:checked]:bg-luna-300/10">
                <input type="radio" name="contactPref" value={o.v} defaultChecked={o.v === "WHATSAPP"} className="accent-[#54ACBF]" />
                {o.l}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="sm:col-span-2 rounded-xl border border-dashed border-luna-50/15 p-4">
          <p className="text-sm font-medium text-ink">¿Quieres proponer un horario para la consultoría? <span className="text-ink-dim">(opcional)</span></p>
          <p className="field-hint">Es una preferencia, no una cita confirmada. Te contactaremos para acordar el horario.</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="lf-date" className="field-label">Fecha preferida</label>
              <input id="lf-date" name="preferredDate" type="date" min={today} className="field" {...a11y("preferredDate")} />
              {err("preferredDate")}
            </div>
            <div>
              <label htmlFor="lf-slot" className="field-label">Franja horaria</label>
              <select id="lf-slot" name="preferredSlot" className="field" defaultValue="">
                <option value="">Sin preferencia</option>
                {SLOTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lf-country" className="field-label">País</label>
              <select id="lf-country" name="country" className="field" defaultValue="">
                <option value="">Selecciona</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-sm text-ink-muted">
            <input type="checkbox" name="privacy" className="mt-1 h-4 w-4 accent-[#54ACBF]" required {...a11y("privacy")} />
            <span>
              Acepto la{" "}
              <Link href="/politica-de-privacidad" className="link" target="_blank">política de privacidad</Link>{" "}
              y el tratamiento de mis datos para gestionar esta solicitud. *
            </span>
          </label>
          {err("privacy")}
        </div>
      </div>

      {state === "error" && (
        <p role="alert" className="mt-5 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {serverMsg}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" className="btn-primary" disabled={state === "sending"}>
          {state === "sending" ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Enviando…
            </>
          ) : (
            "Solicitar asesoría"
          )}
        </button>
        <p className="text-xs text-ink-dim">* Campos obligatorios. Respondemos personalmente cada solicitud.</p>
      </div>
    </form>
  );
}
