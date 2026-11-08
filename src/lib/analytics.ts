"use client";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Evento de conversión. Nunca enviar datos personales (nombre, correo, teléfono, mensajes).
 * Si la analítica no está activa o no hay consentimiento, no hace nada.
 */
export function track(event: "click_whatsapp" | "form_start" | "form_submit_success" | "appointment_request" | "email_click" | "service_view", params: Params = {}) {
  if (typeof window === "undefined") return;
  const safe: Params = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    if (typeof v === "string" && (/@/.test(v) || /\d{7,}/.test(v))) continue; // defensa extra contra PII
    safe[k] = typeof v === "string" ? v.slice(0, 100) : v;
  }
  if (window.gtag) window.gtag("event", event, safe);
  else if (window.dataLayer) window.dataLayer.push({ event, ...safe });
}
