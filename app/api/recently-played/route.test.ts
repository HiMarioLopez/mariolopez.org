import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/recently-played/route";
import { logError } from "@/lib/errors";
import { getRecentlyPlayed } from "@/lib/recently-played";
import type { RecentlyPlayed } from "@/lib/types";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/recently-played", () => ({
  getRecentlyPlayed: vi.fn(),
}));

vi.mock("@/lib/errors", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/errors")>();
  return {
    ...original,
    logError: vi.fn(),
  };
});

// ── Fixtures ─────────────────────────────────────────────────────────────────

const mockTrack: RecentlyPlayed = {
  song: "Test Song",
  artist: "Test Artist",
  platform: "Spotify",
  url: "https://open.spotify.com/track/123",
  timestamp: "2025-01-01T12:00:00Z",
  durationMs: 240000,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function expectNoStoreHeaders(res: Response) {
  expect(res.headers.get("Cache-Control")).toBe("no-store");
  expect(res.headers.get("CDN-Cache-Control")).toBe("no-store");
  expect(res.headers.get("Vercel-CDN-Cache-Control")).toBe("no-store");
}

// ── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  vi.mocked(getRecentlyPlayed).mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Success Path ─────────────────────────────────────────────────────────────

describe("GET /api/recently-played – success", () => {
  it("returns 200 with track data when getRecentlyPlayed resolves", async () => {
    vi.mocked(getRecentlyPlayed).mockResolvedValue(mockTrack);

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(mockTrack);
  });

  it("sets no-store cache headers on success", async () => {
    vi.mocked(getRecentlyPlayed).mockResolvedValue(mockTrack);

    const res = await GET();

    expectNoStoreHeaders(res);
  });
});

// ── No Track Data ────────────────────────────────────────────────────────────

describe("GET /api/recently-played – no track data", () => {
  it("returns 404 with error body when getRecentlyPlayed returns null", async () => {
    vi.mocked(getRecentlyPlayed).mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({
      error: "No track data found from either source",
      code: "NO_TRACK_DATA",
    });
  });

  it("sets no-store cache headers on 404", async () => {
    vi.mocked(getRecentlyPlayed).mockResolvedValue(null);

    const res = await GET();

    expectNoStoreHeaders(res);
  });
});

// ── Error Path ───────────────────────────────────────────────────────────────

describe("GET /api/recently-played – error handling", () => {
  it("returns 500 with error body when getRecentlyPlayed throws", async () => {
    vi.mocked(getRecentlyPlayed).mockRejectedValue(new Error("Network failure"));

    const res = await GET();

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({
      error: "Network failure",
      code: "FETCH_ERROR",
    });
  });

  it("calls logError with the thrown error and context string", async () => {
    const error = new Error("Network failure");
    vi.mocked(getRecentlyPlayed).mockRejectedValue(error);

    await GET();

    expect(logError).toHaveBeenCalledWith(error, "Error fetching recently played song");
  });

  it("sets no-store cache headers on 500", async () => {
    vi.mocked(getRecentlyPlayed).mockRejectedValue(new Error("Network failure"));

    const res = await GET();

    expectNoStoreHeaders(res);
  });

  it("returns generic message for non-Error thrown values", async () => {
    vi.mocked(getRecentlyPlayed).mockRejectedValue("string error");

    const res = await GET();

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({
      error: "An unexpected error occurred",
      code: "FETCH_ERROR",
    });
  });
});
