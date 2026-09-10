import { siteConfig, absoluteUrl } from "@/config/site";
import type { Locale } from "@/i18n/routing";

/**
 * Structured data builders.
 *
 * The site used to emit exactly one JSON-LD block — BlogPosting on article
 * pages — which told search engines what an article was but never who wrote it
 * or what the site is. These fill that in.
 *
 * Every builder returns a plain object; render it with <JsonLd>.
 */

/** The person behind the site. Emitted once per page, from the layout. */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl("/#person"),
    name: siteConfig.author.name,
    url: siteConfig.url,
    email: siteConfig.author.email,
    jobTitle: "Full-stack Engineer",
    knowsAbout: [
      "TypeScript",
      "React",
      "Next.js",
      "Go",
      "PostgreSQL",
      "Docker",
      "CI/CD",
    ],
    sameAs: [
      siteConfig.author.github,
      siteConfig.author.linkedin,
      siteConfig.author.telegram,
    ],
  };
}

/** The site itself, tied to the person above by @id. */
export function webSiteJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: absoluteUrl(`/${locale}`),
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: locale,
    author: { "@id": absoluteUrl("/#person") },
    publisher: { "@id": absoluteUrl("/#person") },
  };
}

/**
 * Breadcrumbs for a leaf page. `trail` is ordered from the section down to the
 * page itself; the locale root is prepended automatically.
 */
export function breadcrumbJsonLd(
  locale: Locale,
  trail: { name: string; path: string }[],
) {
  const items = [{ name: siteConfig.name, path: "/" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(`/${locale}${item.path === "/" ? "" : item.path}`),
    })),
  };
}

/** A project that has a public repository. */
export function softwareSourceCodeJsonLd(project: {
  title: string;
  description: string;
  repo: string;
  url?: string;
  stack: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.description,
    codeRepository: project.repo,
    programmingLanguage: project.stack,
    author: { "@id": absoluteUrl("/#person") },
    ...(project.url ? { url: project.url } : {}),
  };
}
