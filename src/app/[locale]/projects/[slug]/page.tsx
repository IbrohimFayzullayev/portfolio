import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  getAllProjectsAllLocales,
  getProjectBySlug,
} from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { MDXContent } from "@/components/mdx-content";
import { Prose } from "@/components/prose";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return getAllProjectsAllLocales().map((p) => ({
    locale: p.locale,
    slug: p.slug,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const project = getProjectBySlug(locale, slug);
  if (!project) return {};
  return buildMetadata({
    locale,
    path: `/projects/${slug}`,
    title: project.title,
    description: project.description,
    type: "article",
    publishedTime: project.date,
    tags: project.tags,
  });
}

export default async function ProjectPage(props: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const project = getProjectBySlug(locale, slug);
  if (!project) notFound();

  const t = await getTranslations("Projects");

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-8">
        <Link href="/projects">
          <ArrowLeft className="size-4" />
          {t("backToProjects")}
        </Link>
      </Button>

      <header className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {formatDate(project.date, locale)}
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {project.title}
        </h1>
        <p className="text-lg text-muted-foreground">{project.description}</p>

        {project.stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {project.stack.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </div>
        )}

        {(project.url || project.repo) && (
          <div className="flex flex-wrap gap-3 pt-2">
            {project.url && (
              <Button asChild size="sm">
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  {t("visitSite")}
                </a>
              </Button>
            )}
            {project.repo && (
              <Button asChild size="sm" variant="outline">
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="size-4" />
                  {t("viewSource")}
                </a>
              </Button>
            )}
          </div>
        )}
      </header>

      <Prose className="mt-10">
        <MDXContent code={project.body} />
      </Prose>
    </article>
  );
}
