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

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: absoluteUrl(`/${locales[0]}${path === "/" ? "" : path}`),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
    alternates: { languages: withAlternates(path) },
  }));

  const [allPosts, allProjects] = await Promise.all([
    getAllPostsAllLocales(),
    getAllProjectsAllLocales(),
  ]);

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
