import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/config/site";
import { locales } from "@/i18n/routing";
import {
  getAllPostsAllLocales,
  getAllProjectsAllLocales,
} from "@/lib/content";

function withAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = absoluteUrl(`/${l}${path === "/" ? "" : path}`);
  }
  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["/", "/projects", "/blog", "/about"];

  const [allPosts, allProjects] = await Promise.all([
    getAllPostsAllLocales(),
    getAllProjectsAllLocales(),
  ]);

  // `new Date()` here used to make every static page look freshly updated on
  // every build — a signal crawlers learn to ignore. A listing page changes
  // when its content changes, so use the newest item it lists; /about has no
  // listing, so it is left without a date rather than given a fake one.
  const newest = (dates: string[]) =>
    dates.length
      ? new Date(dates.reduce((a, b) => (a > b ? a : b)))
      : undefined;

  const postDates = allPosts.map((p) => p.updated ?? p.date);
  const projectDates = allProjects.map((p) => p.date);

  const lastModifiedFor: Record<string, Date | undefined> = {
    "/": newest([...postDates, ...projectDates]),
    "/blog": newest(postDates),
    "/projects": newest(projectDates),
    "/about": undefined,
  };

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: absoluteUrl(`/${locales[0]}${path === "/" ? "" : path}`),
    ...(lastModifiedFor[path]
      ? { lastModified: lastModifiedFor[path] }
      : {}),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
    alternates: { languages: withAlternates(path) },
  }));

  const postEntries: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: absoluteUrl(`/${post.locale}/blog/${post.slug}`),
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const projectEntries: MetadataRoute.Sitemap = allProjects.map((project) => ({
    url: absoluteUrl(`/${project.locale}/projects/${project.slug}`),
    lastModified: new Date(project.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...postEntries, ...projectEntries];
}
