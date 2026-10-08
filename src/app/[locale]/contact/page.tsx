import type { Metadata } from "next";
import { Mail, Phone, Send } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { ContactForm } from "@/components/contact-form";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return buildMetadata({
    locale,
    path: "/contact",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function ContactPage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  const direct = [
    {
      icon: Mail,
      label: siteConfig.author.email,
      href: `mailto:${siteConfig.author.email}`,
      external: false,
    },
    {
      icon: Send,
      label: siteConfig.author.telegramHandle,
      href: siteConfig.author.telegram,
      external: true,
    },
    {
      icon: Phone,
      label: siteConfig.author.phoneDisplay,
      href: `tel:${siteConfig.author.phone}`,
      external: false,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <JsonLd
        id="breadcrumb-jsonld"
        data={breadcrumbJsonLd(locale, [
          { name: t("title"), path: "/contact" },
        ])}
      />
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="mt-10">
        <ContactForm />
      </div>

      <section className="border-border/60 mt-14 border-t pt-8">
        <h2 className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          {t("directTitle")}
        </h2>
        <ul className="mt-4 space-y-3">
          {direct.map(({ icon: Icon, label, href, external }) => (
            <li key={href}>
              <a
                href={href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="hover:text-muted-foreground inline-flex items-center gap-3 text-sm transition-colors"
              >
                <Icon
                  className="text-muted-foreground size-4"
                  aria-hidden="true"
                />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
