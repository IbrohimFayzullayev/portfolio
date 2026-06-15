import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stack = [
  "TypeScript",
  "React",
  "Next.js",
  "Tailwind CSS",
  "Node.js",
  "PostgreSQL",
  "MDX",
  "Vercel",
];

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
        <div className="mt-4 flex flex-wrap gap-2">
          {stack.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight">
          {t("contactTitle")}
        </h2>
        <p className="text-muted-foreground mt-3">{t("contactText")}</p>
        <Button asChild className="mt-4">
          <a href={`mailto:${siteConfig.author.email}`}>
            <Mail className="size-4" />
            {siteConfig.author.email}
          </a>
        </Button>
      </section>
    </div>
  );
}
