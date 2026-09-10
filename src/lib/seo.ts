import type { Metadata } from "next";

import { siteConfig, absoluteUrl } from "@/config/site";
import { locales, routing, type Locale } from "@/i18n/routing";

type BuildMetadataInput = {
  title?: string;
  description?: string;
  /** Locale-agnostic path, e.g. "/blog/my-post" (without the locale prefix). */
  path?: string;
  /**
   * Per-locale paths, for content whose slug differs between languages.
   * Anything missing falls back to `path`. Comes from `getTranslationPaths`.
   */
  paths?: Partial<Record<Locale, string>>;
  locale: Locale;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  /** Custom OG image URL. Falls back to the dynamic OG route. */
  image?: string;
};

/** Absolute URL for one locale's version of a page. */
function localeUrl(locale: Locale, path: string) {
  return absoluteUrl(`/${locale}${path === "/" ? "" : path}`);
}

/**
 * Language alternates, including `x-default`.
 *
 * `paths` lets each locale carry its own slug — without it a uz article and an
 * en article would only be declared as translations of each other when their
 * slugs happened to be identical, which for real bilingual writing they are not.
 * A locale with no entry in `paths` (no translation exists) is left out rather
 * than pointed at a 404.
 *
 * `x-default` follows `routing.defaultLocale`: the version served to a reader
 * whose language matches none of ours.
 */
function buildAlternates(
  path: string,
  rawPaths?: Partial<Record<Locale, string>>,
) {
  // An empty map means "no siblings found" — fall back to the shared path so
  // the page still declares its own locale instead of no alternates at all.
  const paths =
    rawPaths && Object.keys(rawPaths).length > 0 ? rawPaths : undefined;
  const languages: Record<string, string> = {};

  for (const l of locales) {
    const localePath = paths ? paths[l] : path;
    if (!localePath) continue;
    languages[l] = localeUrl(l, localePath);
  }

  const defaultPath = paths ? paths[routing.defaultLocale] : path;
  if (defaultPath) {
    languages["x-default"] = localeUrl(routing.defaultLocale, defaultPath);
  }

  return languages;
}

export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  paths,
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
      languages: buildAlternates(path, paths),
      // Declares the feed in <head>, which is how readers and feed readers
      // discover it — publishing /feed.xml without this is publishing it to
      // nobody.
      types: {
        "application/rss+xml": [
          { url: absoluteUrl("/feed.xml"), title: `${siteConfig.name} — RSS` },
        ],
      },
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
    },
  };
}
