"use client";

import { MessageCircle } from "lucide-react";
import { track } from "@/lib/analytics";

export function WhatsAppFloat({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("click_whatsapp", { service: "general", location: "flotante" })}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 inline-flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-[#15803d] px-4 text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,.6)] transition hover:bg-[#166534] sm:right-6"
      aria-label="Hablemos por WhatsApp (se abre en una nueva pestaña)"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
      <span className="hidden text-sm font-semibold md:inline">Hablemos por WhatsApp</span>
    </a>
  );
}
