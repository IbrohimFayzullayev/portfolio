import { posts, projects, type Post, type Project } from "#site/content";
import type { Locale } from "@/i18n/routing";

const isPublished = (d: { draft: boolean }) =>
  process.env.NODE_ENV === "development" ? true : !d.draft;

/* -------------------------------------------------------------------------- */
/*                                   Posts                                    */
/* -------------------------------------------------------------------------- */

export function getAllPosts(locale: Locale): Post[] {
  return posts
    .filter((p) => p.locale === locale && isPublished(p))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getFeaturedPosts(locale: Locale, limit = 3): Post[] {
  return getAllPosts(locale)
    .filter((p) => p.featured)
    .slice(0, limit);
}

export function getPostBySlug(locale: Locale, slug: string): Post | undefined {
  return posts.find(
    (p) => p.locale === locale && p.slug === slug && isPublished(p),
  );
}

export function getAllPostsAllLocales(): Post[] {
  return posts.filter(isPublished);
}

/* -------------------------------------------------------------------------- */
/*                                  Projects                                  */
/* -------------------------------------------------------------------------- */

export function getAllProjects(locale: Locale): Project[] {
  return projects
    .filter((p) => p.locale === locale && isPublished(p))
    .sort((a, b) => b.order - a.order || +new Date(b.date) - +new Date(a.date));
}

export function getFeaturedProjects(locale: Locale, limit = 3): Project[] {
  return getAllProjects(locale)
    .filter((p) => p.featured)
    .slice(0, limit);
}

export function getProjectBySlug(
  locale: Locale,
  slug: string,
): Project | undefined {
  return projects.find(
    (p) => p.locale === locale && p.slug === slug && isPublished(p),
  );
}

export function getAllProjectsAllLocales(): Project[] {
  return projects.filter(isPublished);
}

/* -------------------------------------------------------------------------- */
/*                                    Tags                                    */
/* -------------------------------------------------------------------------- */

export function getAllTags(locale: Locale): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts(locale)) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export type { Post, Project };
