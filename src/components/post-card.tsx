import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { Post } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export function PostCard({ post, locale }: { post: Post; locale: string }) {
  const t = useTranslations("Blog");

  return (
    <article className="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
        <span aria-hidden>·</span>
        <span>{t("minRead", { minutes: post.metadata.readingTime })}</span>
      </div>

      <h3 className="text-lg font-semibold leading-snug tracking-tight">
        <Link
          href={`/blog/${post.slug}`}
          className="after:absolute after:inset-0"
        >
          {post.title}
        </Link>
      </h3>

      <p className="line-clamp-2 text-sm text-muted-foreground">
        {post.description}
      </p>

      {post.tags.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="muted">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
}
