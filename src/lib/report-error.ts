/**
 * Sends one error from the browser to this site's `/api/client-errors` route.
 *
 * Fire-and-forget, and silent when it fails: this runs while an error screen is
 * already on display, and a second failure on top of the first helps nobody.
 * `keepalive` lets the request outlive the page if the visitor navigates away.
 */
export function reportError(error: Error & { digest?: string }): void {
  try {
    void fetch("/api/client-errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        message: error.message ?? "",
        stack: (error.stack ?? "").slice(0, 4000),
        digest: error.digest ?? "",
        path: window.location.pathname,
      }),
    }).catch(() => {});
  } catch {
    // Nothing to do — see above.
  }
}
