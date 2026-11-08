"use client";

export default function PanelError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-8 text-center">
      <h1 className="text-xl font-bold">No se pudo cargar esta sección</h1>
      <p className="mt-2 text-sm text-ink-muted">Puede ser un problema temporal de conexión con la base de datos.</p>
      <button type="button" onClick={reset} className="btn-primary mt-6">Reintentar</button>
    </div>
  );
}
