"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes, CircleHelp, ExternalLink, FileText, FolderKanban, History, House, Inbox, LayoutDashboard, Link2, LogOut, Menu,
  Newspaper, Search, Settings, UserCog, Users, X, type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions/auth";

type Item = { href: string; label: string; icon: LucideIcon; perm: "all" | "admin" };
const GROUPS: { title: string; items: Item[] }[] = [
  { title: "General", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, perm: "all" }] },
  {
    title: "CRM",
    items: [{ href: "/admin/prospectos", label: "Prospectos", icon: Inbox, perm: "admin" }],
  },
  {
    title: "Contenido",
    items: [
      { href: "/admin/contenido", label: "Página de inicio", icon: House, perm: "all" },
      { href: "/admin/servicios", label: "Servicios", icon: Boxes, perm: "all" },
      { href: "/admin/faqs", label: "Preguntas frecuentes", icon: CircleHelp, perm: "all" },
      { href: "/admin/proyectos", label: "Proyectos", icon: FolderKanban, perm: "all" },
      { href: "/admin/recursos", label: "Recursos", icon: Newspaper, perm: "all" },
      { href: "/admin/legales", label: "Páginas legales", icon: FileText, perm: "all" },
    ],
  },
  {
    title: "Posicionamiento",
    items: [
      { href: "/admin/seo", label: "SEO, GEO y AEO", icon: Search, perm: "all" },
      { href: "/admin/redirecciones", label: "Redirecciones", icon: Link2, perm: "all" },
    ],
  },
  {
    title: "Administración",
    items: [
      { href: "/admin/configuracion", label: "Configuración", icon: Settings, perm: "admin" },
      { href: "/admin/usuarios", label: "Usuarios", icon: Users, perm: "admin" },
      { href: "/admin/auditoria", label: "Auditoría", icon: History, perm: "admin" },
    ],
  },
];

export function AdminNav({ user }: { user: { name: string; email: string; role: "ADMIN" | "EDITOR" } }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Panel" className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {GROUPS.map((g) => {
          const items = g.items.filter((i) => i.perm === "all" || user.role === "ADMIN");
          if (!items.length) return null;
          return (
            <div key={g.title}>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-dim">{g.title}</p>
              <ul className="mt-2 space-y-0.5">
                {items.map((i) => (
                  <li key={i.href}>
                    <Link
                      href={i.href}
                      onClick={() => setOpen(false)}
                      aria-current={active(i.href) ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        active(i.href) ? "bg-luna-300/15 text-white" : "text-ink-muted hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <i.icon className="h-4 w-4" aria-hidden="true" />
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="border-t border-luna-50/10 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-4 w-4" aria-hidden="true" /> Ver sitio
        </Link>
        <Link href="/admin/cuenta" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-white/5 hover:text-white">
          <UserCog className="h-4 w-4" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block truncate text-white">{user.name}</span>
            <span className="block truncate text-xs">{user.role === "ADMIN" ? "Administrador" : "Editor"}</span>
          </span>
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-white/5 hover:text-white">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Cerrar sesión
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-luna-50/10 bg-[#01142f]/95 px-4 backdrop-blur lg:hidden">
        <span className="font-display font-bold text-white">Panel Estratec</span>
        <button type="button" className="btn-ghost" aria-expanded={open} aria-controls="admin-nav" onClick={() => setOpen((v) => !v)}>
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          <span className="sr-only">Menú</span>
        </button>
      </div>
      <aside
        id="admin-nav"
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-luna-50/10 bg-[#011131] transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 items-center border-b border-luna-50/10 px-6">
          <Link href="/admin" className="font-display text-lg font-bold text-white">Estratec <span className="text-luna-300">Panel</span></Link>
        </div>
        <div className="h-[calc(100%-4rem)]">{nav}</div>
      </aside>
      {open && <button type="button" aria-label="Cerrar menú" className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
