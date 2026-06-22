/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import NextImage from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import { Link } from "@/i18n/navigation";

/**
 * Renders raw MDX `body` coming from the API. Compilation happens on the
 * server (RSC). The rehype plugins mirror the old Velite config so headings
 * get ids/anchors and code blocks are highlighted with Shiki.
 */

const components: Record<string, React.ComponentType<any>> = {
  a: ({ href = "", ...props }: React.ComponentProps<"a">) => {
    if (href.startsWith("/")) {
      return <Link href={href} {...props} />;
    }
    const external = href.startsWith("http");
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      />
    );
  },
  img: ({ src, alt = "", ...props }: React.ComponentProps<"img">) => (
    <NextImage
      src={String(src)}
      alt={alt}
      width={1280}
      height={720}
      className="rounded-lg border"
      {...(props as Record<string, unknown>)}
    />
  ),
};

const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [],
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
    ] as any,
  },
};

export function MDXContent({ source }: { source: string }) {
  return (
    <MDXRemote source={source} components={components} options={mdxOptions} />
  );
}
