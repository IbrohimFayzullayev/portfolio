import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getAllPosts,
  getPostBySlug,
  getFeaturedPosts,
  getAllProjects,
  getAllTags,
} from "@/lib/content";

/**
 * content.ts talks to the Go API over fetch(). We replace fetch with a mock so
 * these tests are fast and offline, and so we can assert both the request path
 * and how the JSON rows are transformed into Post/Project objects (reading
 * time, table of contents, excerpt, null-tag handling, error fallbacks).
 */

function jsonResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Error",
    json: async () => data,
  } as Response;
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const postRow = {
  locale: "en",
  slug: "hello-world",
  title: "Hello World",
  description: "A short description.",
  body: "## Intro\n\nsome words here to read.\n\n### Details\n\nmore text.",
  tags: ["go", "next"],
  cover: "",
  featured: true,
  date: "2026-01-02",
};

describe("getAllPosts", () => {
  it("requests the public posts endpoint with the locale", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([postRow]));
    await getAllPosts("en");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toContain("/public/posts?locale=en");
  });

  it("maps rows into Post objects with derived metadata", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([postRow]));
    const posts = await getAllPosts("en");

    expect(posts).toHaveLength(1);
    const p = posts[0];
    expect(p.title).toBe("Hello World");
    expect(p.tags).toEqual(["go", "next"]);
    expect(p.metadata.readingTime).toBeGreaterThanOrEqual(1);
    // Table of contents from ## / ### headings, with rehype-slug-style anchors.
    expect(p.toc).toEqual([
      { title: "Intro", url: "#intro", depth: 2 },
      { title: "Details", url: "#details", depth: 3 },
    ]);
    // Excerpt falls back to the description when present.
    expect(p.excerpt).toBe("A short description.");
  });

  it("treats null tags as an empty array", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse([{ ...postRow, tags: null }]),
    );
    const posts = await getAllPosts("en");
    expect(posts[0].tags).toEqual([]);
  });

  it("returns [] when the API responds with an error status", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null, false, 500));
    expect(await getAllPosts("en")).toEqual([]);
  });

  it("returns [] when fetch throws (API unreachable)", async () => {
    fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    expect(await getAllPosts("en")).toEqual([]);
  });
});

describe("getFeaturedPosts", () => {
  it("keeps only featured posts and respects the limit", async () => {
    const rows = [
      { ...postRow, slug: "a", featured: true },
      { ...postRow, slug: "b", featured: false },
      { ...postRow, slug: "c", featured: true },
      { ...postRow, slug: "d", featured: true },
    ];
    fetchMock.mockResolvedValueOnce(jsonResponse(rows));
    const featured = await getFeaturedPosts("en", 2);
    expect(featured.map((p) => p.slug)).toEqual(["a", "c"]);
  });
});

describe("getPostBySlug", () => {
  it("returns a Post when found", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(postRow));
    const post = await getPostBySlug("en", "hello-world");
    expect(post?.slug).toBe("hello-world");
  });

  it("returns undefined on a 404", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null, false, 404));
    expect(await getPostBySlug("en", "missing")).toBeUndefined();
  });
});

describe("getAllProjects", () => {
  it("maps optional url/repo and null stack", async () => {
    const projectRow = {
      locale: "en",
      slug: "my-app",
      title: "My App",
      description: "d",
      body: "b",
      tags: null,
      stack: null,
      url: "",
      repo: "https://github.com/x/y",
      order: 1,
      featured: false,
      date: "2026-02-02",
    };
    fetchMock.mockResolvedValueOnce(jsonResponse([projectRow]));
    const [proj] = await getAllProjects("en");
    expect(proj.stack).toEqual([]);
    expect(proj.url).toBeUndefined(); // empty string -> undefined
    expect(proj.repo).toBe("https://github.com/x/y");
  });
});

describe("getAllTags", () => {
  it("counts tags across posts and sorts by count then name", async () => {
    const rows = [
      { ...postRow, slug: "a", tags: ["go", "next"] },
      { ...postRow, slug: "b", tags: ["go", "react"] },
      { ...postRow, slug: "c", tags: ["go"] },
    ];
    fetchMock.mockResolvedValueOnce(jsonResponse(rows));
    const tags = await getAllTags("en");
    expect(tags[0]).toEqual({ tag: "go", count: 3 });
    // next (1) and react (1) tie -> alphabetical.
    expect(tags.slice(1)).toEqual([
      { tag: "next", count: 1 },
      { tag: "react", count: 1 },
    ]);
  });
});
