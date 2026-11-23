import type { NextConfig } from "next";

/**
 * Build-Varianten:
 *  - Server-Deployment (Standalone-Server, Vercel): Standard, mit API-Routen.
 *  - Statischer Export (GitHub Pages, Capacitor):
 *    NEXT_PUBLIC_STATIC_EXPORT=1 npm run build:static
 *    API-Routen werden dabei entfernt (siehe package.json), die App zeigt
 *    einen Hinweis-Banner für nicht verfügbare Server-Funktionen.
 */
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      trailingSlash: true,
      images: { unoptimized: true },
      reactStrictMode: true,
    }
  : {
      // Standalone-Ausgabe für eigenständiges Deployment (enthält API-Routen).
      output: "standalone",
      reactStrictMode: true,
    };

export default nextConfig;
