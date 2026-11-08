/**
 * Núcleo tecnológico del hero: esfera luminosa conectada a módulos de software, datos,
 * automatización e integración. SVG inline (sin peso de imágenes), decorativo para lectores de pantalla.
 */
export function CoreVisual({ labels }: { labels: string[] }) {
  const items = labels.slice(0, 6);
  const cx = 300;
  const cy = 300;
  const R = 215;
  const nodes = items.map((label, i) => {
    const a = (-90 + (360 / items.length) * i) * (Math.PI / 180);
    return { label, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), i };
  });

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]" aria-hidden="true">
      <div className="absolute inset-[18%] rounded-full bg-luna-300/20 blur-3xl" />
      <svg viewBox="0 0 600 600" className="relative h-full w-full overflow-visible">
        <defs>
          <radialGradient id="cv-core" cx="42%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="22%" stopColor="#A7EBF2" />
            <stop offset="60%" stopColor="#54ACBF" />
            <stop offset="100%" stopColor="#023859" />
          </radialGradient>
          <radialGradient id="cv-halo" cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor="#54ACBF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#54ACBF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cv-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A7EBF2" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#26658C" stopOpacity="0.2" />
          </linearGradient>
          <filter id="cv-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Órbitas */}
        <g fill="none" stroke="#A7EBF2">
          <circle cx={cx} cy={cy} r={R} strokeOpacity="0.14" />
          <circle cx={cx} cy={cy} r={150} strokeOpacity="0.1" strokeDasharray="2 8" />
          <ellipse cx={cx} cy={cy} rx={260} ry={95} strokeOpacity="0.09" transform={`rotate(-24 ${cx} ${cy})`} />
          <ellipse cx={cx} cy={cy} rx={260} ry={95} strokeOpacity="0.07" transform={`rotate(36 ${cx} ${cy})`} />
        </g>

        {/* Conexiones con flujo de datos */}
        <g>
          {nodes.map((n) => (
            <line
              key={`l-${n.i}`}
              x1={cx}
              y1={cy}
              x2={n.x}
              y2={n.y}
              stroke="url(#cv-line)"
              strokeWidth="1.5"
              strokeDasharray="4 10"
              className="cv-flow"
              style={{ animationDelay: `${n.i * -0.6}s` }}
            />
          ))}
          {nodes.map((n, idx) => {
            const m = nodes[(idx + 1) % nodes.length]!;
            return <line key={`r-${n.i}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y} stroke="#A7EBF2" strokeOpacity="0.08" />;
          })}
        </g>

        {/* Núcleo */}
        <circle cx={cx} cy={cy} r="120" fill="url(#cv-halo)" />
        <circle cx={cx} cy={cy} r="86" fill="none" stroke="#A7EBF2" strokeOpacity="0.35" className="origin-center animate-pulseRing" style={{ transformOrigin: "300px 300px" }} />
        <circle cx={cx} cy={cy} r="70" fill="url(#cv-core)" filter="url(#cv-glow)" />
        <circle cx={cx - 22} cy={cy - 24} r="16" fill="#fff" fillOpacity="0.5" />
        <g stroke="#011C40" strokeOpacity="0.35" fill="none" strokeWidth="1.2">
          <ellipse cx={cx} cy={cy} rx="70" ry="24" />
          <ellipse cx={cx} cy={cy} rx="24" ry="70" />
        </g>

        {/* Módulos */}
        {nodes.map((n) => {
          const w = Math.max(96, n.label.length * 9.4 + 40);
          return (
            <g key={`n-${n.i}`} className="cv-node" style={{ animationDelay: `${n.i * -1}s` }}>
              <circle cx={n.x} cy={n.y} r="7" fill="#A7EBF2" filter="url(#cv-glow)" />
              <g transform={`translate(${n.x - w / 2} ${n.y + (n.y < cy - 10 ? -54 : 16)})`}>
                <rect width={w} height="36" rx="12" fill="#023859" fillOpacity="0.85" stroke="#A7EBF2" strokeOpacity="0.25" />
                <circle cx="18" cy="18" r="4" fill="#54ACBF" />
                <text x="30" y="23" fill="#EAF4F7" fontSize="14" fontFamily="var(--font-sans), system-ui" fontWeight="500">
                  {n.label}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
      <style>{`
        .cv-flow { animation: cvflow 2.4s linear infinite; }
        @keyframes cvflow { to { stroke-dashoffset: -28; } }
        .cv-node { animation: cvfloat 7s ease-in-out infinite; }
        @keyframes cvfloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
        @media (prefers-reduced-motion: reduce) { .cv-flow, .cv-node { animation: none; } }
      `}</style>
    </div>
  );
}
