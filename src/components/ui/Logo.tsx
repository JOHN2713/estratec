import Image from "next/image";

/**
 * Logo Estratec: mascota a color + wordmark vectorial en blanco (recorte del SVG oficial sin deformar).
 * El SVG oficial recibido solo contiene completo el wordmark; la mascota proviene del PNG a color.
 */
export function Logo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const h = size === "sm" ? 30 : size === "lg" ? 52 : 38;
  const markW = Math.round((h * 244) / 256);
  const wordW = Math.round(h * 0.62 * (620 / 138));
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image src="/assets/brand/mascota.webp" alt="" width={markW} height={h} priority className="shrink-0" />
      <svg
        role="img"
        aria-label="Estratec.org"
        viewBox="20 480 620 138"
        width={wordW}
        height={Math.round(h * 0.62)}
        className="shrink-0"
      >
        <image href="/assets/brand/Estratec-white.svg" x="0" y="0" width="654" height="618" />
      </svg>
    </span>
  );
}
