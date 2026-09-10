import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/jsonld";

/**
 * /uses — what actually runs this site.
 *
 * The list is deliberately the real stack of the three repositories behind
 * fayzullayev.uz rather than an aspirational tool list: a reader can check
 * every line of it against the site they are reading it on.
 *
 * Kept as data here rather than in the message catalogue because the values are
 * proper nouns — they are identical in both languages, and duplicating them
 * into uz.json and en.json would just be two places to forget to update.
 */
const groups = [
  {
    key: "server",
    items: [
      ["Hetzner VPS", "usesServerVps"],
      ["Docker Compose", "usesServerCompose"],
      ["Caddy", "usesServerCaddy"],
      ["GitHub Actions → GHCR", "usesServerCI"],
    ],
  },
  {
    key: "backend",
    items: [
      ["Go", "usesBackendGo"],
      ["chi", "usesBackendChi"],
      ["PostgreSQL 16 + pgx", "usesBackendPg"],
      ["sqlc", "usesBackendSqlc"],
    ],
  },
  {
    key: "frontend",
    items: [
      ["Next.js 15 (App Router)", "usesFrontendNext"],
      ["React 19 + TypeScript", "usesFrontendReact"],
      ["Tailwind CSS 4", "usesFrontendTailwind"],
      ["next-intl", "usesFrontendIntl"],
      ["MDX + Shiki", "usesFrontendMdx"],
    ],
  },
  {
    key: "quality",
    items: [
      ["Vitest", "usesQualityVitest"],
      ["go test", "usesQualityGoTest"],
      ["Umami", "usesQualityUmami"],
      ["Telegram bot", "usesQualityBot"],
    ],
  },
] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Uses" });
  return buildMetadata({
    locale,
    path: "/uses",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function UsesPage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Uses");

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: t("title"), path: "/uses" },
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <JsonLd id="uses-breadcrumb-jsonld" data={breadcrumb} />

      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <p className="text-muted-foreground mt-8 text-base leading-relaxed">
        {t("intro")}
      </p>

      <div className="mt-12 space-y-10">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              {t(group.key)}
            </h2>
            <dl className="mt-4 divide-y divide-border/60 border-y border-border/60">
              {group.items.map(([name, noteKey]) => (
                <div
                  key={name}
                  className="grid gap-1 py-3 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-6"
                >
                  <dt className="text-sm font-medium">{name}</dt>
                  <dd className="text-muted-foreground text-sm">{t(noteKey)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <p className="text-muted-foreground mt-12 text-sm">{t("outro")}</p>
    </div>
  );
}
