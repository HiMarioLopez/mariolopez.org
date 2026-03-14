import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/errors/route";
import { logError } from "@/lib/errors";

vi.mock("@/lib/errors", () => ({
  logError: vi.fn(),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildRequest(payload: unknown): NextRequest {
  return new NextRequest("http://localhost/api/errors", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
}

// ── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Validation ───────────────────────────────────────────────────────────────

describe("POST /api/errors – validation", () => {
  it("returns 400 for missing errorType", async () => {
    const res = await POST(buildRequest({ message: "oops" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("returns 400 for missing message", async () => {
    const res = await POST(buildRequest({ errorType: "TypeError" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for empty object", async () => {
    const res = await POST(buildRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-object body (string)", async () => {
    const res = await POST(buildRequest("just a string"));
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-object body (number)", async () => {
    const res = await POST(buildRequest(42));
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-object body (null)", async () => {
    const res = await POST(buildRequest(null));
    expect(res.status).toBe(400);
  });

  it("returns 400 when errorType exceeds 100 characters", async () => {
    const res = await POST(buildRequest({ errorType: "X".repeat(101), message: "ok" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when message exceeds 2000 characters", async () => {
    const res = await POST(buildRequest({ errorType: "TypeError", message: "M".repeat(2001) }));
    expect(res.status).toBe(400);
  });
});

// ── Success Response ─────────────────────────────────────────────────────────

describe("POST /api/errors – success", () => {
  it("returns 200 with { success: true } for valid payload", async () => {
    const res = await POST(
      buildRequest({ errorType: "TypeError", message: "Cannot read property" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true });
  });

  it("calls logError with correct context", async () => {
    await POST(buildRequest({ errorType: "TypeError", message: "Cannot read property" }));
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "[Client Error] TypeError: Cannot read property",
      }),
      "client-error-api",
    );
  });

  it("calls console.error with structured JSON containing all fields", async () => {
    const payload = {
      errorType: "ReferenceError",
      message: "x is not defined",
      errorName: "ReferenceError",
      source: "https://example.com/app.js",
      lineno: 42,
      colno: 7,
      stack: "ReferenceError: x is not defined\n    at foo (app.js:42:7)",
      url: "https://example.com/page",
      userAgent: "Mozilla/5.0",
      timestamp: "2026-01-01T00:00:00Z",
    };

    await POST(buildRequest(payload));

    expect(console.error).toHaveBeenCalledWith(
      JSON.stringify({
        type: "client-error",
        errorType: "ReferenceError",
        message: "x is not defined",
        errorName: "ReferenceError",
        source: "https://example.com/app.js",
        lineno: 42,
        colno: 7,
        stack: "ReferenceError: x is not defined\n    at foo (app.js:42:7)",
        url: "https://example.com/page",
        userAgent: "Mozilla/5.0",
        timestamp: "2026-01-01T00:00:00Z",
      }),
    );
  });
});

// ── Field Truncation ─────────────────────────────────────────────────────────

describe("POST /api/errors – truncation", () => {
  it("truncates message to 500 characters", async () => {
    const longMessage = "A".repeat(600);
    await POST(buildRequest({ errorType: "Error", message: longMessage }));

    const logged = JSON.parse((console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(logged.message).toHaveLength(500);
    expect(logged.message).toBe("A".repeat(500));
  });

  it("truncates stack to 1000 characters", async () => {
    const longStack = "S".repeat(1500);
    await POST(buildRequest({ errorType: "Error", message: "err", stack: longStack }));

    const logged = JSON.parse((console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(logged.stack).toHaveLength(1000);
    expect(logged.stack).toBe("S".repeat(1000));
  });

  it("truncates userAgent to 250 characters", async () => {
    const longUA = "U".repeat(400);
    await POST(
      buildRequest({
        errorType: "Error",
        message: "err",
        userAgent: longUA,
      }),
    );

    const logged = JSON.parse((console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(logged.userAgent).toHaveLength(250);
    expect(logged.userAgent).toBe("U".repeat(250));
  });
});

// ── Error Handling ───────────────────────────────────────────────────────────

describe("POST /api/errors – error handling", () => {
  it("returns 500 with { success: false } for invalid JSON", async () => {
    const req = new NextRequest("http://localhost/api/errors", {
      method: "POST",
      body: "this is not json{{{",
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ success: false });
  });

  it("calls logError when request.json() throws", async () => {
    const req = new NextRequest("http://localhost/api/errors", {
      method: "POST",
      body: "<<<not json>>>",
      headers: { "Content-Type": "application/json" },
    });

    await POST(req);
    expect(logError).toHaveBeenCalledWith(expect.any(Error), "error-logging-api");
  });
});

// ── Optional Fields ──────────────────────────────────────────────────────────

describe("POST /api/errors – optional fields", () => {
  it("passes through all optional fields in structured log", async () => {
    const payload = {
      errorType: "TypeError",
      message: "Cannot read property",
      errorName: "TypeError",
      source: "https://example.com/bundle.js",
      lineno: 100,
      colno: 25,
      stack: "TypeError: Cannot read property\n    at bar (bundle.js:100:25)",
      url: "https://example.com/dashboard",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      timestamp: 1735689600000,
    };

    const res = await POST(buildRequest(payload));
    expect(res.status).toBe(200);

    const logged = JSON.parse((console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(logged.errorName).toBe("TypeError");
    expect(logged.source).toBe("https://example.com/bundle.js");
    expect(logged.lineno).toBe(100);
    expect(logged.colno).toBe(25);
    expect(logged.stack).toBe("TypeError: Cannot read property\n    at bar (bundle.js:100:25)");
    expect(logged.url).toBe("https://example.com/dashboard");
    expect(logged.userAgent).toBe("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");
    expect(logged.timestamp).toBe(1735689600000);
  });

  it("handles payload with only required fields", async () => {
    const res = await POST(buildRequest({ errorType: "Error", message: "minimal" }));
    expect(res.status).toBe(200);

    const logged = JSON.parse((console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(logged.errorType).toBe("Error");
    expect(logged.message).toBe("minimal");
    expect(logged.stack).toBeUndefined();
    expect(logged.userAgent).toBeUndefined();
  });
});
