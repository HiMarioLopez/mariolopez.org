import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VISITOR_COUNT_CACHE_HEADERS, VISITOR_COUNT_CONFIG } from "@/lib/config";
import { VISITOR_COUNTER_CONFIG } from "@/lib/constants";

// ── Mocks ────────────────────────────────────────────────────────────────────

// vi.hoisted runs before imports, ensuring env vars and mock fns exist
// when the route module evaluates `hasRedisEnv` and calls `Redis.fromEnv()`.
const { mockGet, mockIncr, mockSetex } = vi.hoisted(() => {
  process.env.KV_REST_API_URL = "https://fake-redis.upstash.io";
  process.env.KV_REST_API_TOKEN = "fake-token";

  return {
    mockGet: vi.fn(),
    mockIncr: vi.fn(),
    mockSetex: vi.fn(),
  };
});

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({
      get: mockGet,
      incr: mockIncr,
      setex: mockSetex,
    }),
  },
}));

vi.mock("@/lib/errors", () => ({
  logError: vi.fn(),
}));

import { GET, POST } from "@/app/api/visitor-count/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makePostRequest(headers?: Record<string, string>) {
  return new NextRequest("http://localhost/api/visitor-count", {
    method: "POST",
    headers,
  });
}

// ── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  mockGet.mockReset();
  mockIncr.mockReset();
  mockSetex.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── GET Tests ────────────────────────────────────────────────────────────────

describe("GET /api/visitor-count", () => {
  it("returns the stored visitor count", async () => {
    mockGet.mockResolvedValue(42);

    const response = await GET();
    const body = await response.json();

    expect(body).toEqual({ count: 42 });
  });

  it("returns 0 when no count is stored (null)", async () => {
    mockGet.mockResolvedValue(null);

    const response = await GET();
    const body = await response.json();

    expect(body).toEqual({ count: 0 });
  });

  it("falls back to 0 gracefully when Redis throws", async () => {
    mockGet.mockRejectedValue(new Error("Redis connection refused"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ count: 0 });
  });

  it("sets the correct Cache-Control header", async () => {
    mockGet.mockResolvedValue(10);

    const response = await GET();

    expect(response.headers.get("Cache-Control")).toBe(VISITOR_COUNT_CACHE_HEADERS.GET);
  });
});

// ── POST Tests ───────────────────────────────────────────────────────────────

describe("POST /api/visitor-count", () => {
  it("increments count for a new visitor (not recently counted)", async () => {
    // First call: recentKey check → not found
    mockGet.mockResolvedValueOnce(null);
    mockIncr.mockResolvedValue(43);
    mockSetex.mockResolvedValue("OK");

    const response = await POST(makePostRequest());
    const body = await response.json();

    expect(body).toEqual({ count: 43 });
    expect(mockIncr).toHaveBeenCalledWith(VISITOR_COUNT_CONFIG.REDIS_KEY_PREFIX);
    expect(mockSetex).toHaveBeenCalledWith(
      expect.stringContaining(VISITOR_COUNT_CONFIG.REDIS_IP_KEY_PREFIX),
      VISITOR_COUNTER_CONFIG.IP_DEDUPLICATION_TTL_SECONDS,
      true,
    );
  });

  it("sets Cache-Control to no-store on successful increment", async () => {
    mockGet.mockResolvedValueOnce(null);
    mockIncr.mockResolvedValue(1);
    mockSetex.mockResolvedValue("OK");

    const response = await POST(makePostRequest());

    expect(response.headers.get("Cache-Control")).toBe(VISITOR_COUNT_CACHE_HEADERS.POST);
  });

  it("returns current count with alreadyCounted when visitor was recently counted", async () => {
    // First call: recentKey check → already counted
    mockGet.mockResolvedValueOnce(true);
    // Second call: get current count
    mockGet.mockResolvedValueOnce(42);

    const response = await POST(makePostRequest());
    const body = await response.json();

    expect(body).toEqual({ count: 42, alreadyCounted: true });
    expect(mockIncr).not.toHaveBeenCalled();
  });

  it("falls back to current count when incr throws", async () => {
    // recentKey check → not found
    mockGet.mockResolvedValueOnce(null);
    // incr fails
    mockIncr.mockRejectedValue(new Error("Redis write error"));
    // Fallback get succeeds
    mockGet.mockResolvedValueOnce(99);

    const response = await POST(makePostRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ count: 99 });
  });

  it("returns 0 when both incr and fallback get throw", async () => {
    mockGet.mockResolvedValueOnce(null);
    mockIncr.mockRejectedValue(new Error("Redis write error"));
    mockGet.mockRejectedValueOnce(new Error("Redis read error"));

    const response = await POST(makePostRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ count: 0 });
  });

  // ── IP Extraction ──────────────────────────────────────────────────────────

  describe("IP extraction from headers", () => {
    it("uses the first IP from x-forwarded-for (comma-separated)", async () => {
      mockGet.mockResolvedValueOnce(null);
      mockIncr.mockResolvedValue(1);
      mockSetex.mockResolvedValue("OK");

      await POST(makePostRequest({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }));

      expect(mockSetex).toHaveBeenCalledWith(
        `${VISITOR_COUNT_CONFIG.REDIS_IP_KEY_PREFIX}1.2.3.4`,
        VISITOR_COUNTER_CONFIG.IP_DEDUPLICATION_TTL_SECONDS,
        true,
      );
    });

    it("falls back to x-real-ip when x-forwarded-for is absent", async () => {
      mockGet.mockResolvedValueOnce(null);
      mockIncr.mockResolvedValue(1);
      mockSetex.mockResolvedValue("OK");

      await POST(makePostRequest({ "x-real-ip": "10.0.0.1" }));

      expect(mockSetex).toHaveBeenCalledWith(
        `${VISITOR_COUNT_CONFIG.REDIS_IP_KEY_PREFIX}10.0.0.1`,
        VISITOR_COUNTER_CONFIG.IP_DEDUPLICATION_TTL_SECONDS,
        true,
      );
    });

    it('uses "unknown" when no IP headers are present', async () => {
      mockGet.mockResolvedValueOnce(null);
      mockIncr.mockResolvedValue(1);
      mockSetex.mockResolvedValue("OK");

      await POST(makePostRequest());

      expect(mockSetex).toHaveBeenCalledWith(
        `${VISITOR_COUNT_CONFIG.REDIS_IP_KEY_PREFIX}unknown`,
        VISITOR_COUNTER_CONFIG.IP_DEDUPLICATION_TTL_SECONDS,
        true,
      );
    });
  });
});
