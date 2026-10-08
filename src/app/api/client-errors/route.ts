import { field, postToApi, readJsonObject } from "@/lib/api-forward";

/**
 * Receives error reports from the error boundaries and forwards them to the
 * API, where they are grouped with the API's own errors and reach Telegram
 * through the same path.
 *
 * Always answers 204. The caller is a page that has already failed; there is
 * nothing useful it could do with the news that reporting failed too.
 */
export async function POST(request: Request) {
  const body = await readJsonObject(request);
  if (body) {
    await postToApi(
      "/public/client-errors",
      {
        source: "web",
        message: field(body, "message"),
        stack: field(body, "stack"),
        digest: field(body, "digest"),
        path: field(body, "path"),
      },
      request,
    );
  }
  return new Response(null, { status: 204 });
}
