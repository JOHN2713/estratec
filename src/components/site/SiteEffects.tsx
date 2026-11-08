"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Aparición/desaparición al hacer scroll + brillo de tarjetas que sigue al cursor. */
export function SiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("reveal-on")) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle("is-visible", e.isIntersecting);
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const seen = new WeakSet<Element>();
    const scan = (scope: ParentNode) => {
      // Escalonado: hijos directos con data-reveal dentro de un grupo reciben --i
      scope.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((g) => {
        let i = 0;
        for (const child of Array.from(g.children)) {
          if (child instanceof HTMLElement && child.hasAttribute("data-reveal")) child.style.setProperty("--i", String(i++ % 8));
        }
      });
      scope.querySelectorAll("[data-reveal]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    };
    scan(document);
    root.classList.add("reveal-ready");

    const mo = new MutationObserver((muts) => {
      for (const m of muts) m.addedNodes.forEach((n) => n instanceof HTMLElement && scan(n.parentElement ?? n));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.<HTMLElement>(".card-hover");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
