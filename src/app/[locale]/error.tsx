"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { reportError } from "@/lib/report-error";

/**
 * Error boundary for every page under a locale.
 *
 * Before this existed a page that threw while rendering showed Next.js's
 * default screen and told nobody. Now the visitor gets a way forward in their
 * own language, and the error is reported once — it ends up in the same
 * Telegram channel as the API's failures.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");

  React.useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-6 px-4 py-32 text-center sm:px-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>{t("retry")}</Button>
        {/* A plain link on purpose: client-side navigation would keep the
            same broken React tree alive; a full load starts clean. */}
        <Button asChild variant="outline">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">{t("backHome")}</a>
        </Button>
      </div>
      {error.digest && (
        <p className="text-muted-foreground font-mono text-xs">
          {error.digest}
        </p>
      )}
    </div>
  );
}
