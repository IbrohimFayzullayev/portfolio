import { describe, it, expect } from "vitest";
import { cn, formatDate } from "@/lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("lets later Tailwind classes win over conflicting earlier ones", () => {
    // tailwind-merge de-duplicates conflicting utilities.
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("formatDate", () => {
  it("formats English dates in a long, UTC-stable form", () => {
    expect(formatDate("2026-06-08", "en")).toBe("June 8, 2026");
  });

  it("formats Uzbek dates with local month names", () => {
    // Uses a fixed month table (not Intl) to stay identical on server & client.
    expect(formatDate("2026-06-08", "uz")).toBe("8-iyun, 2026");
  });

  it("defaults to English when no locale is given", () => {
    expect(formatDate("2026-01-01")).toBe("January 1, 2026");
  });

  it("accepts a Date object", () => {
    expect(formatDate(new Date("2026-12-25"), "uz")).toBe("25-dekabr, 2026");
  });
});
