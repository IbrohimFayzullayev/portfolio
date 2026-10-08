import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  MAX_BODY_BYTES,
  clientAddress,
  field,
  postToApi,
  readJsonObject,
} from "@/lib/api-forward";
import { POST as contactPost } from "@/app/api/contact/route";
import { POST as clientErrorsPost } from "@/app/api/client-errors/route";

/**
 * The two route handlers are the only way anything a visitor types reaches the
 * Go API, so these tests are about that seam: what is forwarded, under whose
 * address, and what the visitor is told when the API says no or says nothing.
 */

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://example.com/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function apiAnswers(status: number) {
  fetchMock.mockResolvedValue({ status } as Response);
}

function forwarded() {
  const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
  return {
    url,
    headers: init.headers as Record<string, string>,
    body: JSON.parse(String(init.body)) as Record<string, unknown>,
  };
}

describe("clientAddress", () => {
  it("takes the first entry of X-Forwarded-For", () => {
    expect(
      clientAddress(
        request({}, { "x-forwarded-for": "203.0.113.7, 10.0.0.1" }),
      ),
    ).toBe("203.0.113.7");
  });

  it("is undefined when the proxy sent nothing", () => {
    expect(clientAddress(request({}))).toBeUndefined();
  });
});

describe("readJsonObject", () => {
  it("accepts an object", async () => {
    expect(await readJsonObject(request({ a: "b" }))).toEqual({ a: "b" });
  });

  it.each([
    ["malformed JSON", "{not json"],
    ["an array", "[1,2]"],
    ["a bare string", '"hello"'],
    ["an oversized body", JSON.stringify({ m: "x".repeat(MAX_BODY_BYTES) })],
  ])("rejects %s", async (_name, body) => {
    expect(await readJsonObject(request(body))).toBeUndefined();
  });
});

describe("field", () => {
  it("returns strings and blanks out everything else", () => {
    expect(field({ a: "x" }, "a")).toBe("x");
    expect(field({ a: 5 }, "a")).toBe("");
    expect(field({}, "a")).toBe("");
  });
});

describe("postToApi", () => {
  it("answers 502 instead of throwing when the API is unreachable", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));
    expect(await postToApi("/public/contact", {}, request({}))).toBe(502);
  });
});

describe("POST /api/contact", () => {
  const message = {
    name: "Dilnoza",
    email: "dilnoza@example.com",
    message: "Salom, loyiha bo'yicha yozyapman.",
    locale: "uz",
    website: "",
  };

  it("forwards the form to the API under the visitor's address", async () => {
    apiAnswers(201);

    const response = await contactPost(
      request(message, {
        "x-forwarded-for": "203.0.113.7",
        "user-agent": "TestBrowser/1.0",
      }),
    );

    expect(response.status).toBe(201);
    const sent = forwarded();
    expect(sent.url).toMatch(/\/public\/contact$/);
    expect(sent.body).toEqual(message);
    // Without this the API would rate-limit every visitor as one address.
    expect(sent.headers["X-Forwarded-For"]).toBe("203.0.113.7");
    expect(sent.headers["User-Agent"]).toBe("TestBrowser/1.0");
  });

  it("drops fields the API does not know, which it would reject", async () => {
    apiAnswers(201);
    await contactPost(request({ ...message, extra: "x", name: 42 }));
    expect(forwarded().body).toEqual({ ...message, name: "" });
  });

  it.each([
    [400, 400],
    [429, 429],
    [500, 502],
    [502, 502],
    [404, 502],
  ])("maps an API %i to %i", async (apiStatus, expected) => {
    apiAnswers(apiStatus);
    expect((await contactPost(request(message))).status).toBe(expected);
  });

  it("answers 400 without calling the API when the body is not JSON", async () => {
    const response = await contactPost(request("nope"));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/client-errors", () => {
  it("forwards the report tagged as coming from the site", async () => {
    apiAnswers(202);

    const response = await clientErrorsPost(
      request({ message: "boom", stack: "at x", digest: "123", path: "/uz" }),
    );

    expect(response.status).toBe(204);
    expect(forwarded().body).toEqual({
      source: "web",
      message: "boom",
      stack: "at x",
      digest: "123",
      path: "/uz",
    });
  });

  it("still answers 204 when the API is down or the body is junk", async () => {
    fetchMock.mockRejectedValue(new Error("down"));
    expect((await clientErrorsPost(request({ message: "boom" }))).status).toBe(
      204,
    );
    expect((await clientErrorsPost(request("junk"))).status).toBe(204);
  });
});
