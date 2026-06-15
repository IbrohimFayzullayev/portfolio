import type { Metadata } from "next";

import { siteConfig, absoluteUrl } from "@/config/site";
import { locales, type Locale } from "@/i18n/routing";

type BuildMetadataInput = {
  title?: string;
  description?: string;
  /** Locale-agnostic path, e.g. "/blog/my-post" (without the locale prefix). */
  path?: string;
  locale: Locale;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  /** Custom OG image URL. Falls back to the dynamic OG route. */
  image?: string;
};

/** Build language alternates for a locale-agnostic path. */
function buildAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = absoluteUrl(`/${l}${path === "/" ? "" : path}`);
  }
  return languages;
}

export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  locale,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
  image,
}: BuildMetadataInput): Metadata {
  const computedTitle = title
    ? `${title} — ${siteConfig.name}`
    : siteConfig.title;

  const canonical = absoluteUrl(`/${locale}${path === "/" ? "" : path}`);

  const ogImage =
    image ??
    absoluteUrl(
      `/api/og?title=${encodeURIComponent(title ?? siteConfig.title)}`,
    );

  return {
    metadataBase: new URL(siteConfig.url),
    title: computedTitle,
    description,
    alternates: {
      canonical,
      languages: buildAlternates(path),
    },
    openGraph: {
      type,
      url: canonical,
      title: computedTitle,
      description,
      siteName: siteConfig.name,
      locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors: [siteConfig.author.name],
        tags,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: computedTitle,
      description,
      images: [ogImage],
      creator: siteConfig.author.twitter,
    },
  };
}
