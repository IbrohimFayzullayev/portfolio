/**
 * Server-side bridge from this site's own route handlers to the Go API.
 *
 * The browser cannot call the API directly: in production this site only knows
 * the API by its address on the internal Docker network (`http://api:8080`),
 * which means nothing outside the server. So the two things a visitor can send
 * — a contact message and an error report — go to a route on this site, and the
 * route passes them on from here.
 *
 * That hop would hide the visitor's address behind the web container's, and the
 * API rate-limits by address. `clientAddress` carries the original one across.
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

/** Generous for a contact message, small enough that nobody posts a file. */
export const MAX_BODY_BYTES = 16 * 1024;

/** The visitor's address as the reverse proxy reported it, if it did. */
export function clientAddress(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // "client, proxy1, proxy2" — the first entry is the visitor.
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || undefined;
}

/**
 * Reads a JSON object from the request, or returns undefined for anything that
 * is not one: wrong type, too large, malformed, an array, a bare string.
 */
export async function readJsonObject(
  request: Request,
): Promise<Record<string, unknown> | undefined> {
  let text: string;
  try {
    text = await request.text();
  } catch {
    return undefined;
  }
  if (!text || new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return undefined;
  }
  try {
    const value: unknown = JSON.parse(text);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  } catch {
    // fall through
  }
  return undefined;
}

/** A string field, or "" when it is missing or not a string. */
export function field(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  return typeof value === "string" ? value : "";
}

/**
 * POSTs to the API and returns its status, or 502 when it cannot be reached.
 * Never throws: the caller is answering a visitor and needs a status either way.
 */
export async function postToApi(
  path: string,
  payload: unknown,
  request: Request,
): Promise<number> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const address = clientAddress(request);
  if (address) headers["X-Forwarded-For"] = address;
  const userAgent = request.headers.get("user-agent");
  if (userAgent) headers["User-Agent"] = userAgent;

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return response.status;
  } catch {
    return 502;
  }
}
