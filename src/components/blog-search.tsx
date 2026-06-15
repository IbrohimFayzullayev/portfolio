"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

import type { Post } from "@/lib/content";
import { PostCard } from "@/components/post-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  posts: Post[];
  tags: { tag: string; count: number }[];
  locale: string;
};

export function BlogSearch({ posts, tags, locale }: Props) {
  const t = useTranslations("Blog");
  const [query, setQuery] = React.useState("");
  const [activeTag, setActiveTag] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesTag = !activeTag || post.tags.includes(activeTag);
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesTag && matchesQuery;
    });
  }, [posts, query, activeTag]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="pl-9"
          aria-label={t("searchPlaceholder")}
        />
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <TagButton
            active={activeTag === null}
            onClick={() => setActiveTag(null)}
          >
            {t("allTags")}
          </TagButton>
          {tags.map(({ tag, count }) => (
            <TagButton
              key={tag}
              active={activeTag === tag}
              onClick={() => setActiveTag((cur) => (cur === tag ? null : tag))}
            >
              {tag}
              <span className="ml-1 text-xs opacity-60">{count}</span>
            </TagButton>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t("noResults")}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

function TagButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-transparent bg-primary text-primary-foreground"
          : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {children}
    </button>
  );
}
