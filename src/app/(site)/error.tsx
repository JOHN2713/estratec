"use client";

import Link from "next/link";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="container-site flex min-h-[60vh] flex-col items-center justify-center py-20 text-center" role="alert">
      <h1 className="text-3xl font-bold">Algo no cargó como esperábamos</h1>
      <p className="mt-3 max-w-md text-ink-muted">Inténtalo de nuevo. Si el problema continúa, escríbenos y te ayudamos.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">Reintentar</button>
        <Link href="/contacto" className="btn-secondary">Contacto</Link>
      </div>
    </section>
  );
}
