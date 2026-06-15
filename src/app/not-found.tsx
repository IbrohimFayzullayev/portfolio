import Link from "next/link";

import "./globals.css";

/**
 * Global fallback for paths that don't match a locale segment.
 * It must render its own <html>/<body> because the localized layout
 * (which normally provides them) is not applied here.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background p-8 text-center font-sans text-foreground antialiased">
        <p className="text-7xl font-bold tracking-tighter text-muted-foreground">
          404
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Page not found
          </h1>
          <p className="text-muted-foreground">
            The page you’re looking for doesn’t exist or has moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back home
        </Link>
      </body>
    </html>
  );
}
