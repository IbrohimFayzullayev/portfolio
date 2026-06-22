import { Feed } from "feed";

import { siteConfig, absoluteUrl } from "@/config/site";
import { getAllPostsAllLocales } from "@/lib/content";

export const dynamic = "force-static";

export async function GET() {
  const feed = new Feed({
    title: siteConfig.title,
    description: siteConfig.description,
    id: siteConfig.url,
    link: siteConfig.url,
    language: "en",
    copyright: `© ${new Date().getFullYear()} ${siteConfig.author.name}`,
    feedLinks: { rss: absoluteUrl("/feed.xml") },
    author: {
      name: siteConfig.author.name,
      email: siteConfig.author.email,
      link: siteConfig.url,
    },
  });

  const posts = (await getAllPostsAllLocales()).sort(
    (a, b) => +new Date(b.date) - +new Date(a.date),
  );

  for (const post of posts) {
    const url = absoluteUrl(`/${post.locale}/blog/${post.slug}`);
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.description,
      content: post.excerpt,
      date: new Date(post.date),
      category: post.tags.map((name) => ({ name })),
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
