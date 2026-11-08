import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta Luna (oficial)
        luna: {
          50: "#A7EBF2", // celeste luminoso
          300: "#54ACBF", // turquesa
          500: "#26658C", // azul medio
          700: "#023859", // azul profundo
          900: "#011C40", // azul noche
        },
        ink: {
          DEFAULT: "#EAF4F7", // texto principal (blanco suave)
          muted: "#A9C1CF", // texto secundario (azul grisáceo claro)
          dim: "#7F9BAE",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: { site: "1200px" },
      boxShadow: {
        glow: "0 0 0 1px rgba(167,235,242,.12), 0 10px 40px -10px rgba(84,172,191,.35)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        pulseRing: { "0%": { transform: "scale(.9)", opacity: ".7" }, "100%": { transform: "scale(1.35)", opacity: "0" } },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
        float: "float 6s ease-in-out infinite",
        pulseRing: "pulseRing 3.5s ease-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
