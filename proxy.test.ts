import { NextRequest, type NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/agent-markdown";

// ── Mocks ────────────────────────────────────────────────────────────────────

const { mockLanguages, mockMediaTypes, mockMatch } = vi.hoisted(() => ({
  mockLanguages: vi.fn().mockReturnValue(["en-US"]),
  mockMediaTypes: vi.fn().mockReturnValue(["text/html"]),
  mockMatch: vi.fn().mockReturnValue("en-US"),
}));

vi.mock("negotiator", () => {
  function MockNegotiator() {
    return { languages: mockLanguages, mediaTypes: mockMediaTypes };
  }
  return { default: MockNegotiator };
});

vi.mock("@formatjs/intl-localematcher", () => ({
  match: mockMatch,
}));

import { config, proxy } from "./proxy";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(url: string, headers?: Record<string, string>) {
  return new NextRequest(new URL(url, "http://localhost"), { headers });
}

function getRewriteUrl(response: NextResponse): string | null {
  return response.headers.get("x-middleware-rewrite");
}

function getRedirectUrl(response: NextResponse): string | null {
  return response.headers.get("location");
}

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockLanguages.mockReturnValue(["en-US"]);
  mockMediaTypes.mockReturnValue(["text/html"]);
  mockMatch.mockReturnValue("en-US");
});

// ── Markdown alias (.md paths) ───────────────────────────────────────────────

describe("markdown alias (.md paths)", () => {
  it("rewrites /en-US.md to /en-US/markdown", () => {
    const response = proxy(makeRequest("http://localhost/en-US.md"));
    expect(response).toBeDefined();
    expect(getRewriteUrl(response!)).toBe("http://localhost/en-US/markdown");
  });

  it("rewrites /es-MX.md to /es-MX/markdown", () => {
    const response = proxy(makeRequest("http://localhost/es-MX.md"));
    expect(response).toBeDefined();
    expect(getRewriteUrl(response!)).toBe("http://localhost/es-MX/markdown");
  });

  it("does not match unsupported locale like /fr-FR.md", () => {
    const response = proxy(makeRequest("http://localhost/fr-FR.md"));
    // fr-FR is not a supported locale, so alias doesn't match.
    // Falls through to no-locale redirect logic.
    expect(response).toBeDefined();
    expect(getRedirectUrl(response!)).toContain("/en-US/fr-FR.md");
    expect(response!.status).toBe(307);
  });
});

// ── Root path (/) ────────────────────────────────────────────────────────────

describe("root path (/)", () => {
  it("rewrites to /en-US when Accept prefers text/html", () => {
    mockMediaTypes.mockReturnValue(["text/html"]);
    const response = proxy(makeRequest("http://localhost/"));
    expect(response).toBeDefined();
    expect(getRewriteUrl(response!)).toBe("http://localhost/en-US");
  });

  it("rewrites to /en-US/markdown when Accept prefers text/markdown", () => {
    mockMediaTypes.mockReturnValue(["text/markdown", "text/html"]);
    const response = proxy(makeRequest("http://localhost/"));
    expect(response).toBeDefined();
    expect(getRewriteUrl(response!)).toBe("http://localhost/en-US/markdown");
  });

  it("sets Vary: Accept header when NOT preferring markdown", () => {
    mockMediaTypes.mockReturnValue(["text/html"]);
    const response = proxy(makeRequest("http://localhost/"));
    expect(response!.headers.get("Vary")).toBe("Accept");
  });

  it("does NOT set Vary header when preferring markdown", () => {
    mockMediaTypes.mockReturnValue(["text/markdown", "text/html"]);
    const response = proxy(makeRequest("http://localhost/"));
    expect(response!.headers.get("Vary")).toBeNull();
  });
});

// ── Locale from pathname ─────────────────────────────────────────────────────

describe("locale from pathname", () => {
  it("returns NextResponse.next() with Vary: Accept for /en-US (html)", () => {
    mockMediaTypes.mockReturnValue(["text/html"]);
    const response = proxy(makeRequest("http://localhost/en-US"));
    expect(response).toBeDefined();
    expect(getRewriteUrl(response!)).toBeNull();
    expect(getRedirectUrl(response!)).toBeNull();
    expect(response!.headers.get("Vary")).toBe("Accept");
  });

  it("rewrites /en-US to /en-US/markdown when Accept prefers markdown", () => {
    mockMediaTypes.mockReturnValue(["text/markdown", "text/html"]);
    const response = proxy(makeRequest("http://localhost/en-US"));
    expect(response).toBeDefined();
    expect(getRewriteUrl(response!)).toBe("http://localhost/en-US/markdown");
  });

  it("handles trailing slash /en-US/ same as /en-US", () => {
    mockMediaTypes.mockReturnValue(["text/html"]);
    const response = proxy(makeRequest("http://localhost/en-US/"));
    expect(response).toBeDefined();
    expect(response!.headers.get("Vary")).toBe("Accept");
    expect(getRewriteUrl(response!)).toBeNull();
  });

  it("recognizes /es-MX as a valid locale root", () => {
    mockMediaTypes.mockReturnValue(["text/html"]);
    const response = proxy(makeRequest("http://localhost/es-MX"));
    expect(response).toBeDefined();
    expect(response!.headers.get("Vary")).toBe("Accept");
  });

  it("falls through for non-root locale paths like /en-US/machine", () => {
    const response = proxy(makeRequest("http://localhost/en-US/machine"));
    expect(response).toBeUndefined();
  });
});

// ── No locale in path (redirect) ────────────────────────────────────────────

describe("no locale in path", () => {
  it("redirects /products to /en-US/products", () => {
    mockMatch.mockReturnValue("en-US");
    const response = proxy(makeRequest("http://localhost/products"));
    expect(response).toBeDefined();
    expect(response!.status).toBe(307);
    expect(getRedirectUrl(response!)).toBe("http://localhost/en-US/products");
  });

  it("redirects using detected locale from negotiation", () => {
    mockMatch.mockReturnValue("es-MX");
    const response = proxy(makeRequest("http://localhost/products"));
    expect(response).toBeDefined();
    expect(response!.status).toBe(307);
    expect(getRedirectUrl(response!)).toBe("http://localhost/es-MX/products");
  });
});

// ── Locale detection ─────────────────────────────────────────────────────────

describe("locale detection", () => {
  it("uses en-US when match returns en-US", () => {
    mockMatch.mockReturnValue("en-US");
    const response = proxy(makeRequest("http://localhost/about"));
    expect(getRedirectUrl(response!)).toBe("http://localhost/en-US/about");
  });

  it("uses es-MX when match returns es-MX", () => {
    mockMatch.mockReturnValue("es-MX");
    const response = proxy(makeRequest("http://localhost/about"));
    expect(getRedirectUrl(response!)).toBe("http://localhost/es-MX/about");
  });

  it("falls back to en-US when match throws", () => {
    mockMatch.mockImplementation(() => {
      throw new Error("No matching locale");
    });
    const response = proxy(makeRequest("http://localhost/about"));
    expect(getRedirectUrl(response!)).toBe("http://localhost/en-US/about");
  });
});

// ── Content negotiation (prefersMarkdown) ────────────────────────────────────

describe("content negotiation (prefersMarkdown)", () => {
  it("prefers markdown when text/markdown appears before text/html", () => {
    mockMediaTypes.mockReturnValue(["text/markdown", "text/html"]);
    const response = proxy(makeRequest("http://localhost/"));
    expect(getRewriteUrl(response!)).toBe("http://localhost/en-US/markdown");
  });

  it("prefers html when text/html appears before text/markdown", () => {
    mockMediaTypes.mockReturnValue(["text/html", "text/markdown"]);
    const response = proxy(makeRequest("http://localhost/"));
    expect(getRewriteUrl(response!)).toBe("http://localhost/en-US");
  });

  it("does not prefer markdown when only text/html is accepted", () => {
    mockMediaTypes.mockReturnValue(["text/html"]);
    const response = proxy(makeRequest("http://localhost/"));
    expect(getRewriteUrl(response!)).toBe("http://localhost/en-US");
  });

  it("prefers markdown when only text/markdown is accepted (no html)", () => {
    mockMediaTypes.mockReturnValue(["text/markdown"]);
    const response = proxy(makeRequest("http://localhost/"));
    expect(getRewriteUrl(response!)).toBe("http://localhost/en-US/markdown");
  });

  it("does not prefer markdown when mediaTypes is empty", () => {
    mockMediaTypes.mockReturnValue([]);
    const response = proxy(makeRequest("http://localhost/"));
    expect(getRewriteUrl(response!)).toBe("http://localhost/en-US");
  });
});

// ── Config export ────────────────────────────────────────────────────────────

describe("config export", () => {
  it("exports a config with matcher array", () => {
    expect(config).toBeDefined();
    expect(config.matcher).toBeDefined();
    expect(Array.isArray(config.matcher)).toBe(true);
  });

  it("matcher excludes api, _next, and static assets", () => {
    const pattern = config.matcher[0];
    expect(pattern).toContain("api");
    expect(pattern).toContain("_next");
    expect(pattern).toContain("favicon.ico");
  });
});

// ── Supported locales sanity ─────────────────────────────────────────────────

describe("supported locales", () => {
  it("includes en-US and es-MX", () => {
    expect(SUPPORTED_LOCALES).toContain("en-US");
    expect(SUPPORTED_LOCALES).toContain("es-MX");
  });

  it("isSupportedLocale returns true for en-US", () => {
    expect(isSupportedLocale("en-US")).toBe(true);
  });

  it("isSupportedLocale returns false for fr-FR", () => {
    expect(isSupportedLocale("fr-FR")).toBe(false);
  });
});
