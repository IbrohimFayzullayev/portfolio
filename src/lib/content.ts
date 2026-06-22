import type { Locale } from "@/i18n/routing";

/* -------------------------------------------------------------------------- */
/*  Content layer                                                             */
/*                                                                            */
/*  The public site reads PUBLISHED content from the Go API                   */
/*  (`/api/v1/public/...`) — the same database the dashboard writes to.       */
/*  MDX `body` is rendered by <MDXContent> with next-mdx-remote.              */
/* -------------------------------------------------------------------------- */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

// ISR window: re-fetch from the API at most once per hour per route.
const REVALIDATE = 3600;

export type TocEntry = { title: string; url: string; depth: number };

export interface Post {
  locale: Locale;
  slug: string;
  title: string;
  description: string;
  body: string; // raw MDX
  tags: string[];
  cover: string;
  featured: boolean;
  date: string; // YYYY-MM-DD
  updated?: string;
  metadata: { readingTime: number };
  toc: TocEntry[];
  excerpt: string;
}

export interface Project {
  locale: Locale;
  slug: string;
  title: string;
  description: string;
  body: string;
  tags: string[];
  stack: string[];
  url?: string;
  repo?: string;
  order: number;
  featured: boolean;
  date: string;
}

/* ----------------------------- API row shapes ---------------------------- */

interface PostRow {
  locale: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  tags: string[] | null;
  cover: string;
  featured: boolean;
  date: string;
}

interface ProjectRow {
  locale: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  tags: string[] | null;
  stack: string[] | null;
  url: string;
  repo: string;
  order: number;
  featured: boolean;
  date: string;
}

async function apiGet<T>(path: string): Promise<T | null> {
  const url = `${API_URL}${path}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) {
      console.warn(`[content] ${res.status} ${res.statusText} <- ${url}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    // API unreachable (e.g. during a build with the API down) — render empty
    // instead of crashing.
    console.warn(`[content] fetch failed <- ${url}:`, err);
    return null;
  }
}

/* ------------------------------ transformers ----------------------------- */

function toPost(row: PostRow): Post {
  return {
    locale: row.locale as Locale,
    slug: row.slug,
    title: row.title,
    description: row.description,
    body: row.body,
    tags: row.tags ?? [],
    cover: row.cover,
    featured: row.featured,
    date: row.date,
    metadata: { readingTime: readingTime(row.body) },
    toc: buildToc(row.body),
    excerpt: row.description || excerptFrom(row.body),
  };
}

function toProject(row: ProjectRow): Project {
  return {
    locale: row.locale as Locale,
    slug: row.slug,
    title: row.title,
    description: row.description,
    body: row.body,
    tags: row.tags ?? [],
    stack: row.stack ?? [],
    url: row.url || undefined,
    repo: row.repo || undefined,
    order: row.order,
    featured: row.featured,
    date: row.date,
  };
}

/* -------------------------------------------------------------------------- */
/*                                   Posts                                    */
/* -------------------------------------------------------------------------- */

export async function getAllPosts(locale: Locale): Promise<Post[]> {
  const rows = await apiGet<PostRow[]>(`/public/posts?locale=${locale}`);
  return (rows ?? []).map(toPost);
}

export async function getFeaturedPosts(
  locale: Locale,
  limit = 3,
): Promise<Post[]> {
  return (await getAllPosts(locale)).filter((p) => p.featured).slice(0, limit);
}

export async function getPostBySlug(
  locale: Locale,
  slug: string,
): Promise<Post | undefined> {
  const row = await apiGet<PostRow>(`/public/posts/${locale}/${slug}`);
  return row ? toPost(row) : undefined;
}

export async function getAllPostsAllLocales(): Promise<Post[]> {
  const rows = await apiGet<PostRow[]>(`/public/posts`);
  return (rows ?? []).map(toPost);
}

/* -------------------------------------------------------------------------- */
/*                                  Projects                                  */
/* -------------------------------------------------------------------------- */

export async function getAllProjects(locale: Locale): Promise<Project[]> {
  const rows = await apiGet<ProjectRow[]>(`/public/projects?locale=${locale}`);
  return (rows ?? []).map(toProject);
}

export async function getFeaturedProjects(
  locale: Locale,
  limit = 3,
): Promise<Project[]> {
  return (await getAllProjects(locale))
    .filter((p) => p.featured)
    .slice(0, limit);
}

export async function getProjectBySlug(
  locale: Locale,
  slug: string,
): Promise<Project | undefined> {
  const row = await apiGet<ProjectRow>(`/public/projects/${locale}/${slug}`);
  return row ? toProject(row) : undefined;
}

export async function getAllProjectsAllLocales(): Promise<Project[]> {
  const rows = await apiGet<ProjectRow[]>(`/public/projects`);
  return (rows ?? []).map(toProject);
}

/* -------------------------------------------------------------------------- */
/*                                    Tags                                    */
/* -------------------------------------------------------------------------- */

export async function getAllTags(
  locale: Locale,
): Promise<{ tag: string; count: number }[]> {
  const counts = new Map<string, number>();
  for (const post of await getAllPosts(locale)) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/* -------------------------------------------------------------------------- */
/*                          Derived-content helpers                           */
/* -------------------------------------------------------------------------- */

/** Approximate reading time in minutes (200 wpm), minimum 1. */
function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** First ~200 characters of the body as plain text. */
function excerptFrom(body: string): string {
  const text = stripMarkdown(body);
  return text.length > 200 ? `${text.slice(0, 200).trimEnd()}…` : text;
}

function stripMarkdown(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, " ") // code blocks
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links -> text
    .replace(/[*_`>#]/g, " ") // md symbols
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Build a table of contents from `##` and `###` headings. Anchor ids match
 * rehype-slug's GitHub-style slugs so the links resolve to the rendered
 * headings.
 */
function buildToc(body: string): TocEntry[] {
  const entries: TocEntry[] = [];
  let inFence = false;

  for (const line of body.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m || !m[1] || !m[2]) continue;

    const depth = m[1].length; // 2 or 3
    const title = m[2].replace(/[*_`]/g, "").trim();
    entries.push({ title, url: `#${slugify(title)}`, depth });
  }
  return entries;
}

/** Mirrors github-slugger for plain ASCII headings (used by rehype-slug). */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}
