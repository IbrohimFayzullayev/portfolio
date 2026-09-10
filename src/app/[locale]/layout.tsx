import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import "../globals.css";
import { routing, type Locale } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { personJsonLd, webSiteJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// Self-hosted Umami. Both values are baked in at build time, so the site
// renders without any analytics at all when they are unset — which is exactly
// what should happen in development and in CI.
const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SRC;
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return buildMetadata({ locale, path: "/" });
}

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  const typedLocale = locale as Locale;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} flex min-h-dvh flex-col font-sans antialiased`}
      >
        <JsonLd id="person-jsonld" data={personJsonLd()} />
        <JsonLd id="website-jsonld" data={webSiteJsonLd(typedLocale)} />
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main className="flex-1">{props.children}</main>
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
        {umamiSrc && umamiWebsiteId && (
          <Script
            src={umamiSrc}
            data-website-id={umamiWebsiteId}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
