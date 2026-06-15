import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getAllPostsAllLocales, getPostBySlug } from "@/lib/content";
import { siteConfig, absoluteUrl } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { MDXContent } from "@/components/mdx-content";
import { Prose } from "@/components/prose";
import { TableOfContents } from "@/components/table-of-contents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Revalidate static pages every hour (ISR). Local MDX rebuilds at deploy time,
// but this keeps the pattern in place for when content moves to a CMS/API.
export const revalidate = 3600;

export function generateStaticParams() {
  return getAllPostsAllLocales().map((p) => ({
    locale: p.locale,
    slug: p.slug,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const post = getPostBySlug(locale, slug);
  if (!post) return {};
  return buildMetadata({
    locale,
    path: `/blog/${slug}`,
    title: post.title,
    description: post.description,
    type: "article",
    publishedTime: post.date,
    modifiedTime: post.updated,
    tags: post.tags,
  });
}

export default async function PostPage(props: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const post = getPostBySlug(locale, slug);
  if (!post) notFound();

  const t = await getTranslations("Blog");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    inLanguage: locale,
    author: { "@type": "Person", name: siteConfig.author.name },
    publisher: { "@type": "Person", name: siteConfig.author.name },
    mainEntityOfPage: absoluteUrl(`/${locale}/blog/${slug}`),
    keywords: post.tags.join(", "),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Script
        id="post-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Button asChild variant="ghost" size="sm" className="mb-8 -ml-2">
        <Link href="/blog">
          <ArrowLeft className="size-4" />
          {t("backToBlog")}
        </Link>
      </Button>

      <div className="gap-12 lg:grid lg:grid-cols-[minmax(0,1fr)_220px]">
        <article className="min-w-0">
          <header className="space-y-4">
            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
              <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
              <span aria-hidden>·</span>
              <span>
                {t("minRead", { minutes: post.metadata.readingTime })}
              </span>
              {post.updated && (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    {t("updatedOn", {
                      date: formatDate(post.updated, locale),
                    })}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              {post.title}
            </h1>
            <p className="text-muted-foreground text-lg">{post.description}</p>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="muted">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          <Prose className="mt-10">
            <MDXContent code={post.body} />
          </Prose>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents toc={post.toc} label={t("tableOfContents")} />
          </div>
        </aside>
      </div>
    </div>
  );
}
