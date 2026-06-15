import { cn } from "@/lib/utils";

export function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert",
        "prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-a:font-medium prose-a:text-foreground prose-a:underline-offset-4",
        "prose-pre:bg-transparent prose-pre:p-0",
        "prose-img:rounded-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}
