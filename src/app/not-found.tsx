import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-luna-900 px-4">
      <div className="text-center">
        <p className="font-display text-7xl font-extrabold text-luna-300/60">404</p>
        <h1 className="mt-4 text-3xl font-bold">No encontramos esta página</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-muted">Puede que el enlace haya cambiado. Te ayudamos a encontrar lo que buscas.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Ir al inicio</Link>
          <Link href="/servicios" className="btn-secondary">Ver servicios</Link>
        </div>
      </div>
    </main>
  );
}
