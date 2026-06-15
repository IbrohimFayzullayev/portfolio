import { defineConfig, defineCollection, s } from "velite";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const locale = s.enum(["en", "uz"]);

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.mdx",
  schema: s
    .object({
      title: s.string().max(120),
      description: s.string().max(320),
      locale,
      slug: s.string(),
      date: s.isodate(),
      updated: s.isodate().optional(),
      tags: s.array(s.string()).default([]),
      cover: s.image().optional(),
      draft: s.boolean().default(false),
      featured: s.boolean().default(false),
      metadata: s.metadata(),
      excerpt: s.excerpt(),
      toc: s.toc(),
      body: s.mdx(),
    })
    .transform((data) => ({
      ...data,
      type: "post" as const,
      permalink: `/${data.locale}/blog/${data.slug}`,
    })),
});

const projects = defineCollection({
  name: "Project",
  pattern: "projects/**/*.mdx",
  schema: s
    .object({
      title: s.string().max(120),
      description: s.string().max(320),
      locale,
      slug: s.string(),
      date: s.isodate(),
      tags: s.array(s.string()).default([]),
      stack: s.array(s.string()).default([]),
      cover: s.image().optional(),
      url: s.string().url().optional(),
      repo: s.string().url().optional(),
      order: s.number().default(0),
      featured: s.boolean().default(false),
      draft: s.boolean().default(false),
      body: s.mdx(),
    })
    .transform((data) => ({
      ...data,
      type: "project" as const,
      permalink: `/${data.locale}/projects/${data.slug}`,
    })),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { posts, projects },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: { dark: "github-dark", light: "github-light" },
          keepBackground: false,
        },
      ],
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
    ],
    remarkPlugins: [],
  },
});
