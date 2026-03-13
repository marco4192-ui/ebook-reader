import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "eBook Reader Pro",
    template: "%s | eBook Reader Pro"
  },
  description: "Comprehensive eBook Reader with AI features, TTS, cloud sync, and accessibility. Supports EPUB, PDF, MOBI, AZW3, FB2, DJVU and comic formats.",
  keywords: ["eBook", "Reader", "EPUB", "PDF", "MOBI", "AZW3", "CBZ", "CBR", "Mobile", "Smartphone", "PWA"],
  authors: [{ name: "eBook Reader Pro" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "eBook Reader",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "eBook Reader Pro",
    title: "eBook Reader Pro - Mobile Reader App",
    description: "Comprehensive eBook Reader with AI features, TTS, cloud sync, and accessibility",
    images: ["/icon-512.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "eBook Reader Pro",
    description: "Comprehensive eBook Reader with AI features",
    images: ["/icon-512.png"],
  },
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icon-167.png", sizes: "167x167", type: "image/png" },
      { url: "/icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icon-512.png", color: "#6366f1" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="eBook Reader" />
        <meta name="application-name" content="eBook Reader Pro" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icon-180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icon-167.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registered: ', registration.scope);
                      
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                          }
                        });
                      });
                    },
                    function(error) {
                      console.log('SW registration failed: ', error);
                    }
                  );
                });
              }
              
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.deferredInstallPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-installable'));
              });
              
              window.addEventListener('appinstalled', () => {
                window.deferredInstallPrompt = null;
                console.log('App installed');
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
