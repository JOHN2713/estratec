"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export type NavItem = { href: string; label: string };

export function SiteHeader({ nav, logo }: { nav: NavItem[]; logo: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? "border-b border-luna-50/10 bg-luna-900/90 backdrop-blur-lg" : "border-b border-transparent"
      }`}
    >
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-luna-900"
      >
        Saltar al contenido
      </a>
      <div className={`container-site flex items-center justify-between gap-4 transition-[height] ${scrolled ? "h-16" : "h-[72px]"}`}>
        <Link href="/" aria-label="Estratec — Inicio" className="rounded-lg">
          {logo}
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="rounded-lg px-3 py-2 text-[14.5px] font-medium text-ink-muted transition hover:bg-white/5 hover:text-white"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/contacto#formulario" className="btn-primary btn-sm hidden sm:inline-flex">
            Agendar consultoría
          </Link>
          <button
            type="button"
            className="btn-ghost lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-movil" aria-label="Menú móvil" className="h-[calc(100dvh-64px)] overflow-y-auto border-t border-luna-50/10 bg-luna-900 lg:hidden">
          <ul className="container-site flex flex-col py-4">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-3.5 text-lg font-medium text-ink hover:bg-white/5">
                  {n.label}
                </Link>
              </li>
            ))}
            <li className="mt-4">
              <Link href="/contacto#formulario" onClick={() => setOpen(false)} className="btn-primary w-full">
                Agendar consultoría
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
