import type { Metadata, Viewport } from "next";
import "./globals.css";

import PWAInit from "@/components/PWAInit";
import InstallBanner from "@/components/InstallBanner";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  title: "Money Transfer Comparison - Compare GBP Rates",
  description: "Compare GBP money transfer rates across multiple providers. Find the best deals for international transfers to 30+ countries.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Money Transfer",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    url: "https://money-transfer-comparison.com",
    title: "Money Transfer Comparison",
    description: "Compare and save on international money transfers",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "Money Transfer Comparison App",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA & Mobile Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Money Transfer" />
        <meta name="theme-color" content="#2563eb" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1e40af" media="(prefers-color-scheme: dark)" />
        
        {/* Icons - Apple, Android, Windows */}
        <link rel="apple-touch-icon" href="/icons/icon-apple-180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://money-transfer-comparison.com" />
        <meta property="og:title" content="Money Transfer Comparison" />
        <meta property="og:description" content="Compare and save on international money transfers" />
        <meta property="og:image" content="/icons/icon-512.png" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@yourtwitterhandle" />
        <meta name="twitter:title" content="Money Transfer Comparison" />
        <meta name="twitter:description" content="Compare and save on international money transfers" />
        <meta name="twitter:image" content="/icons/icon-512.png" />

        {/* Microsoft Tile */}
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Analytics />
        {children}
        <PWAInit />
        <InstallBanner />
        <Footer />
      </body>
    </html>
  );
}
