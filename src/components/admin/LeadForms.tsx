"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Mail, MessageCircle, Send } from "lucide-react";
import type { LeadStatus } from "@prisma/client";
import {
  addNoteAction, assignAction, cancelAppointmentAction, confirmAppointmentAction, createLeadAction, logOutreachAction,
  sendLeadEmailAction, updateLeadAction, updateStatusAction,
} from "@/app/admin/actions/leads";
import { COUNTRIES, NOT_SURE, SLOTS, STATUS_LABEL, STATUS_ORDER } from "@/lib/leads";
import { renderTemplate } from "@/lib/templates";
import { waLink } from "@/lib/whatsapp";
import { FieldError, FormAlert, SubmitButton } from "./ui";

export function StatusForm({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const [state, action] = useActionState(updateStatusAction, null);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="leadId" value={leadId} />
      <label htmlFor="status" className="field-label">Estado del pipeline</label>
      <div className="flex gap-2">
        <select id="status" name="status" defaultValue={status === "CITA_CONFIRMADA" ? "" : status} className="field">
          {status === "CITA_CONFIRMADA" && <option value="" disabled>Cita confirmada (cambiar…)</option>}
          {STATUS_ORDER.filter((s) => s !== "CITA_CONFIRMADA").map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <SubmitButton className="btn-primary btn-sm shrink-0">Guardar</SubmitButton>
      </div>
      <p className="field-hint">“Cita confirmada” solo se asigna con la acción de confirmación manual.</p>
      <FormAlert state={state} />
    </form>
  );
}

export function AppointmentForm({ leadId, agreedLocal, confirmed }: { leadId: string; agreedLocal: string; confirmed: boolean }) {
  const [state, action] = useActionState(confirmAppointmentAction, null);
  const [cState, cancel] = useActionState(cancelAppointmentAction, null);
  return (
    <div className="space-y-4">
      <form action={action} className="space-y-3">
        <input type="hidden" name="leadId" value={leadId} />
        <div>
          <label htmlFor="agreedAt" className="field-label">Fecha y hora acordadas (hora de Ecuador, GMT-5)</label>
          <input id="agreedAt" name="agreedAt" type="datetime-local" defaultValue={agreedLocal} className="field" required />
          <FieldError state={state} name="agreedAt" />
        </div>
        <label className="flex items-start gap-2 text-sm text-ink-muted">
          <input type="checkbox" name="ack" className="mt-1 accent-[#54ACBF]" required />
          Confirmo que este horario fue acordado con el prospecto por correo, WhatsApp o llamada.
        </label>
        <FieldError state={state} name="ack" />
        <SubmitButton className="btn-primary btn-sm">{confirmed ? "Actualizar cita confirmada" : "Confirmar cita"}</SubmitButton>
        <FormAlert state={state} />
      </form>
      {confirmed && (
        <form action={cancel}>
          <input type="hidden" name="leadId" value={leadId} />
          <SubmitButton className="btn-ghost btn-sm text-rose-300" pendingText="Anulando…">Anular confirmación</SubmitButton>
          <FormAlert state={cState} />
        </form>
      )}
    </div>
  );
}

export function NoteForm({ leadId }: { leadId: string }) {
  const [state, action] = useActionState(addNoteAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="leadId" value={leadId} />
      <label htmlFor="note" className="sr-only">Nueva nota</label>
      <textarea id="note" name="body" rows={3} maxLength={4000} className="field" placeholder="Registrar una nota de seguimiento…" required />
      <div className="flex items-center gap-3">
        <SubmitButton className="btn-primary btn-sm">Agregar nota</SubmitButton>
        {state && !state.ok && <FormAlert state={state} />}
      </div>
    </form>
  );
}

export function AssignForm({ leadId, current, users }: { leadId: string; current: string | null; users: { id: string; name: string }[] }) {
  const [state, action] = useActionState(assignAction, null);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="leadId" value={leadId} />
      <label htmlFor="assignedToId" className="field-label">Responsable</label>
      <div className="flex gap-2">
        <select id="assignedToId" name="assignedToId" defaultValue={current ?? ""} className="field">
          <option value="">Sin asignar</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <SubmitButton className="btn-secondary btn-sm shrink-0">Asignar</SubmitButton>
      </div>
      <FormAlert state={state} />
    </form>
  );
}

type Tpl = { id: string; name: string; subject: string; body: string };

export function TemplateComposer({
  leadId,
  phone,
  email,
  templates,
  vars,
}: {
  leadId: string;
  phone: string;
  email: string;
  templates: Tpl[];
  vars: Record<string, string>;
}) {
  const [tplId, setTplId] = useState(templates[0]?.id ?? "");
  const tpl = useMemo(() => templates.find((t) => t.id === tplId), [templates, tplId]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [state, action] = useActionState(sendLeadEmailAction, null);

  // Se re-renderiza solo al cambiar de plantilla o de datos reales (no al refrescar la página tras una acción).
  const varsKey = JSON.stringify(vars);
  useEffect(() => {
    if (!tpl) return;
    const v = JSON.parse(varsKey) as Record<string, string>;
    setSubject(renderTemplate(tpl.subject, v));
    setBody(renderTemplate(tpl.body, v));
  }, [tpl, varsKey]);

  const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\*\*(.+?)\*\*/g, "$1"))}`;
  const wa = waLink(phone, body.replace(/\*\*(.+?)\*\*/g, "*$1*"));

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="templateName" value={tpl?.name ?? ""} />
      <div>
        <label htmlFor="tpl" className="field-label">Plantilla</label>
        <select id="tpl" value={tplId} onChange={(e) => setTplId(e.target.value)} className="field">
          {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="subject" className="field-label">Asunto (correo)</label>
        <input id="subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="field" maxLength={200} />
      </div>
      <div>
        <label htmlFor="body" className="field-label">Mensaje</label>
        <textarea id="body" name="body" rows={9} value={body} onChange={(e) => setBody(e.target.value)} className="field font-mono text-[13px]" maxLength={4000} />
        <p className="field-hint">Revisa y ajusta el texto antes de enviarlo. Ningún mensaje se envía automáticamente.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp btn-sm"
          onClick={() => void logOutreachAction(leadId, "whatsapp", tpl?.name ?? "")}
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> Abrir en WhatsApp
        </a>
        <a href={mailto} className="btn-secondary btn-sm" onClick={() => void logOutreachAction(leadId, "correo", tpl?.name ?? "")}>
          <Mail className="h-4 w-4" aria-hidden="true" /> Abrir en mi correo
        </a>
        <SubmitButton className="btn-primary btn-sm" pendingText="Enviando…">
          <Send className="h-4 w-4" aria-hidden="true" /> Enviar desde el sistema
        </SubmitButton>
      </div>
      <FormAlert state={state} />
    </form>
  );
}

type LeadData = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string | null;
  serviceSlug?: string | null;
  message?: string;
  contactPref?: "WHATSAPP" | "EMAIL";
  country?: string | null;
  preferredDate?: string;
  preferredSlot?: string | null;
};

export function LeadEditForm({ lead, services }: { lead?: LeadData; services: { slug: string; name: string }[] }) {
  const [state, action] = useActionState(lead?.id ? updateLeadAction : createLeadAction, null);
  const e = (n: string) => <FieldError state={state} name={n} />;
  return (
    <form action={action} className="space-y-4">
      {lead?.id && <input type="hidden" name="leadId" value={lead.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="le-name">Nombre y apellido *</label>
          <input id="le-name" name="name" defaultValue={lead?.name} className="field" required maxLength={120} />
          {e("name")}
        </div>
        <div>
          <label className="field-label" htmlFor="le-email">Correo *</label>
          <input id="le-email" name="email" type="email" defaultValue={lead?.email} className="field" required maxLength={160} />
          {e("email")}
        </div>
        <div>
          <label className="field-label" htmlFor="le-phone">Teléfono / WhatsApp *</label>
          <input id="le-phone" name="phone" defaultValue={lead?.phone} className="field" required maxLength={40} />
          {e("phone")}
        </div>
        <div>
          <label className="field-label" htmlFor="le-company">Empresa</label>
          <input id="le-company" name="company" defaultValue={lead?.company ?? ""} className="field" maxLength={160} />
        </div>
        <div>
          <label className="field-label" htmlFor="le-service">Servicio *</label>
          <select id="le-service" name="service" defaultValue={lead?.serviceSlug ?? (lead?.id ? NOT_SURE : "")} className="field" required>
            <option value="">Selecciona</option>
            {services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            <option value={NOT_SURE}>No estoy seguro/a</option>
          </select>
          {e("service")}
        </div>
        <div>
          <label className="field-label" htmlFor="le-pref">Preferencia de contacto</label>
          <select id="le-pref" name="contactPref" defaultValue={lead?.contactPref ?? "WHATSAPP"} className="field">
            <option value="WHATSAPP">WhatsApp</option>
            <option value="EMAIL">Correo</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="le-country">País</label>
          <select id="le-country" name="country" defaultValue={lead?.country ?? ""} className="field">
            <option value="">—</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="field-label" htmlFor="le-date">Fecha preferida</label>
            <input id="le-date" name="preferredDate" type="date" defaultValue={lead?.preferredDate} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="le-slot">Franja</label>
            <select id="le-slot" name="preferredSlot" defaultValue={lead?.preferredSlot ?? ""} className="field">
              <option value="">—</option>
              {SLOTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
        {!lead?.id && (
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="le-src">Origen del contacto (opcional)</label>
            <input id="le-src" name="utmSource" placeholder="Ej.: referido, evento, Instagram, llamada" className="field" maxLength={120} />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="le-msg">Necesidad / mensaje *</label>
          <textarea id="le-msg" name="message" rows={4} defaultValue={lead?.message} className="field" required maxLength={3000} />
          {e("message")}
        </div>
      </div>
      <FormAlert state={state} />
      <SubmitButton>{lead?.id ? "Guardar cambios" : "Registrar prospecto"}</SubmitButton>
    </form>
  );
}
