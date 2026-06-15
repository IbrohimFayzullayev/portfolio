import { ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { Project } from "@/lib/content";
import { Badge } from "@/components/ui/badge";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight">
          <Link
            href={`/projects/${project.slug}`}
            className="after:absolute after:inset-0"
          >
            {project.title}
          </Link>
        </h3>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>

      <p className="line-clamp-3 text-sm text-muted-foreground">
        {project.description}
      </p>

      {project.stack.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {project.stack.slice(0, 5).map((s) => (
            <Badge key={s} variant="outline">
              {s}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
}
