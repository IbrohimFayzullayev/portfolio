import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { getAllProjects } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { ProjectCard } from "@/components/project-card";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Projects" });
  return buildMetadata({
    locale,
    path: "/projects",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function ProjectsPage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Projects");
  const projects = await getAllProjects(locale);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {projects.length === 0 ? (
        <p className="mt-12 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
