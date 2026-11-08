"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "estratec_consent_v1";

/**
 * Carga GA4/GTM solo si están configurados y, si se exige, tras el consentimiento explícito.
 * Consent Mode: almacenamiento publicitario siempre denegado.
 */
export function Analytics({ ga4Id, gtmId, requireConsent }: { ga4Id: string; gtmId: string; requireConsent: boolean }) {
  const enabled = !!(ga4Id || gtmId);
  const [consent, setConsent] = useState<"granted" | "denied" | null | "loading">("loading");

  useEffect(() => {
    if (!enabled) return;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {}
    setConsent(stored === "granted" || stored === "denied" ? stored : requireConsent ? null : "granted");
  }, [enabled, requireConsent]);

  useEffect(() => {
    if (consent !== "granted" || !enabled || window.dataLayer) return;
    window.dataLayer = [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
    });
    const s = document.createElement("script");
    s.async = true;
    if (gtmId) {
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
    } else {
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
      window.gtag("js", new Date());
      window.gtag("config", ga4Id, { anonymize_ip: true });
    }
    document.head.appendChild(s);
  }, [consent, enabled, ga4Id, gtmId]);

  if (!enabled || consent !== null) return null;

  const choose = (v: "granted" | "denied") => {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    setConsent(v);
  };

  return (
    <div role="region" aria-label="Preferencias de cookies" className="fixed inset-x-3 bottom-20 z-[60] sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md">
      <div className="card border-luna-50/20 bg-luna-900/95 p-4 text-sm text-ink-muted shadow-2xl">
        <p>
          Usamos cookies de analítica para entender, de forma agregada, cómo se usa el sitio. No compartimos tus datos de contacto.{" "}
          <Link href="/politica-de-privacidad" className="link">
            Más información
          </Link>
          .
        </p>
        <div className="mt-3 flex gap-2">
          <button type="button" className="btn-primary btn-sm" onClick={() => choose("granted")}>
            Aceptar
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={() => choose("denied")}>
            Rechazar
          </button>
        </div>
      </div>
    </div>
  );
}
