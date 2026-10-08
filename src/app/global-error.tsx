"use client";

import * as React from "react";

import "./globals.css";
import { reportError } from "@/lib/report-error";

/**
 * Last resort: the layout itself failed, so there is no navbar, no theme and
 * no translations to lean on. It renders its own <html> and stays in English
 * for the same reason the global 404 does — the locale is not known here.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground flex min-h-dvh flex-col items-center justify-center gap-6 p-8 text-center font-sans antialiased">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            The page failed to load. It has been reported.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
