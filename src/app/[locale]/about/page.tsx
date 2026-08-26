import type { Metadata } from "next";
import { Mail, Phone, Send } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Guruhlangan — tekis ro'yxat full-stack ekanini ko'rsatmaydi.
const stackGroups = [
  {
    key: "stackFrontend",
    items: ["TypeScript", "React", "Next.js", "Tailwind CSS", "next-intl"],
  },
  {
    key: "stackBackend",
    items: ["Go", "PostgreSQL", "sqlc", "REST API", "JWT auth"],
  },
  {
    key: "stackInfra",
    items: ["Docker", "Caddy", "GitHub Actions", "GHCR", "Linux VPS"],
  },
] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "About" });
  return buildMetadata({
    locale,
    path: "/about",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function AboutPage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("About");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="text-muted-foreground mt-10 space-y-6 text-base leading-relaxed">
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight">
          {t("stackTitle")}
        </h2>
        <div className="mt-5 space-y-5">
          {stackGroups.map((group) => (
            <div key={group.key}>
              <h3 className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
                {t(group.key)}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight">
          {t("contactTitle")}
        </h2>
        <p className="text-muted-foreground mt-3">{t("contactText")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <a href={`mailto:${siteConfig.author.email}`}>
              <Mail className="size-4" />
              {siteConfig.author.email}
            </a>
          </Button>
          <Button asChild variant="outline">
            <a
              href={siteConfig.author.telegram}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Send className="size-4" />
              {siteConfig.author.telegramHandle}
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={`tel:${siteConfig.author.phone}`}>
              <Phone className="size-4" />
              {siteConfig.author.phoneDisplay}
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
