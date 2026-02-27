import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorHandler } from "@/components/error-handler";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { QueryProvider } from "@/components/query-provider";
import { ResourceHints } from "@/components/resource-hints";
import { RoutePrefetcher } from "@/components/route-prefetcher";
import { BASE_URL } from "@/lib/constants";
import "../globals.css";
import { getDictionary, type Locale } from "./dictionaries";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const metadataLocale = lang === "es-MX" ? "es_MX" : "en_US";
  const ogImageUrl = `/${lang}/opengraph-image`;
  const pageUrl = `/${lang}`;

  return {
    metadataBase: new URL(BASE_URL),
    title: dict.metadata.title,
    description: dict.metadata.description,
    openGraph: {
      type: "website",
      siteName: "mariolopez.org",
      title: dict.metadata.title,
      description: dict.metadata.description,
      locale: metadataLocale,
      url: pageUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Howdy Hey 🤠 — Mario Lopez Martinez",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.metadata.title,
      description: dict.metadata.description,
      images: [ogImageUrl],
    },
    generator: "v0.app",
    icons: {
      icon: [
        {
          url: "/favicon-16x16.png",
          sizes: "16x16",
          type: "image/png",
        },
        {
          url: "/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png",
        },
        {
          url: "/favicon.ico",
          sizes: "any",
        },
      ],
      apple: "/apple-touch-icon.png",
    },
    other: {
      "format-detection": "telephone=no",
    },
  };
}

export async function generateStaticParams() {
  return [{ lang: "en-US" }, { lang: "es-MX" }];
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <ResourceHints />
        <RoutePrefetcher lang={lang} />
        <ErrorBoundary>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </QueryProvider>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
        <PerformanceMonitor />
        <ErrorHandler />
      </body>
    </html>
  );
}
