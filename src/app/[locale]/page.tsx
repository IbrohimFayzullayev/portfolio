import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  getFeaturedProjects,
  getAllProjects,
  getAllPosts,
} from "@/lib/content";
import { ProjectCard } from "@/components/project-card";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function HomePage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  let featuredProjects = await getFeaturedProjects(locale, 3);
  if (featuredProjects.length === 0) {
    featuredProjects = (await getAllProjects(locale)).slice(0, 3);
  }
  const latestPosts = (await getAllPosts(locale)).slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <Badge variant="secondary" className="mb-6">
          <span className="mr-2 inline-block size-1.5 rounded-full bg-emerald-500" />
          {t("heroBadge")}
        </Badge>
        <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {t("heroTitle")}
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
          {t("heroSubtitle")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/projects">
              {t("viewProjects")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/blog">{t("readBlog")}</Link>
          </Button>
        </div>
      </section>

      {/* Featured projects */}
      {featuredProjects.length > 0 && (
        <section className="py-12">
          <SectionHeading
            title={t("featuredProjects")}
            subtitle={t("featuredProjectsSubtitle")}
            href="/projects"
            linkLabel={t("viewAllProjects")}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Latest posts */}
      {latestPosts.length > 0 && (
        <section className="py-12">
          <SectionHeading
            title={t("latestPosts")}
            subtitle={t("latestPostsSubtitle")}
            href="/blog"
            linkLabel={t("viewAllPosts")}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {latestPosts.map((post) => (
              <PostCard key={post.slug} post={post} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel,
}: {
  title: string;
  subtitle: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Link
        href={href}
        className="hidden shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
      >
        {linkLabel}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
