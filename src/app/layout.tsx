import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const display = Manrope({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display", display: "swap" });
const sans = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { seo, analytics } = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: seo.defaultTitle, template: seo.titleTemplate },
    description: seo.defaultDescription,
    applicationName: seo.siteName,
    formatDetection: { telephone: false },
    ...(analytics.gscVerification ? { verification: { google: analytics.gscVerification } } : {}),
  };
}

export const viewport: Viewport = { themeColor: "#011C40", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
