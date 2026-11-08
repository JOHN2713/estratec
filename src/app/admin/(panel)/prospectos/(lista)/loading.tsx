export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando prospectos…</span>
      <div aria-hidden="true">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton mt-3 h-4 w-80" />
        <div className="mt-8 flex gap-2">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton h-7 w-28 rounded-full" />)}</div>
        <div className="skeleton mt-5 h-[132px] rounded-2xl" />
        <div className="mt-6 overflow-hidden rounded-2xl border border-luna-50/10">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-luna-50/10 px-4 py-4">
              <div className="skeleton h-4 w-1/4" />
              <div className="skeleton h-4 w-1/5" />
              <div className="skeleton h-5 w-24 rounded-full" />
              <div className="skeleton ml-auto h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
