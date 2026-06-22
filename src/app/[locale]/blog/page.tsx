import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { getAllPosts, getAllTags } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { BlogSearch } from "@/components/blog-search";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  return buildMetadata({
    locale,
    path: "/blog",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function BlogPage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const posts = await getAllPosts(locale);
  const tags = await getAllTags(locale);

  console.log(posts);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="mt-10">
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("empty")}</p>
        ) : (
          <BlogSearch posts={posts} tags={tags} locale={locale} />
        )}
      </div>
    </div>
  );
}
