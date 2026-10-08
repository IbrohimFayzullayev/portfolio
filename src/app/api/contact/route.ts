import { NextResponse } from "next/server";

import { field, postToApi, readJsonObject } from "@/lib/api-forward";

/**
 * Receives the contact form and hands it to the Go API, which stores the
 * message and queues the Telegram notification.
 *
 * The response is deliberately only a status. The form already knows what it
 * sent; all it needs back is which of four things happened, and it has its own
 * translated sentence for each.
 */
export async function POST(request: Request) {
  const body = await readJsonObject(request);
  if (!body) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Only the fields the API knows. It rejects unknown keys, so passing the
  // body through untouched would turn any extra field into a 400.
  const status = await postToApi(
    "/public/contact",
    {
      name: field(body, "name"),
      email: field(body, "email"),
      message: field(body, "message"),
      locale: field(body, "locale"),
      website: field(body, "website"),
    },
    request,
  );

  if (status === 201) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }
  if (status === 400 || status === 429) {
    return NextResponse.json({ ok: false }, { status });
  }
  // The API is down, timed out, or failed. From the visitor's side those are
  // one thing: it did not go through, try another way.
  return NextResponse.json({ ok: false }, { status: 502 });
}
