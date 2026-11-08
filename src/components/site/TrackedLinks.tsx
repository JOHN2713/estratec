"use client";

import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { track } from "@/lib/analytics";

export function WaLink({
  href,
  service,
  location,
  className = "btn-whatsapp",
  children,
  icon = true,
  ariaLabel,
}: {
  href: string;
  service?: string;
  location: string;
  className?: string;
  children: React.ReactNode;
  icon?: boolean;
  ariaLabel?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
      onClick={() => track("click_whatsapp", { service: service ?? "general", location })}
    >
      {icon && <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />}
      {children}
    </a>
  );
}

export function EmailLink({ email, className = "link", location }: { email: string; className?: string; location: string }) {
  return (
    <a href={`mailto:${email}`} className={className} onClick={() => track("email_click", { location })}>
      {email}
    </a>
  );
}

export function ServiceViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    track("service_view", { service: slug });
  }, [slug]);
  return null;
}
