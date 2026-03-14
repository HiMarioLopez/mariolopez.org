import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cn, formatTimeAgo, getPlatformColor } from "@/lib/utils";

// ── cn ───────────────────────────────────────────────────────────────────────

describe("cn", () => {
  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });

  it("returns a single class name unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("joins multiple class names with a space", () => {
    expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
  });

  it("filters out undefined", () => {
    expect(cn("a", undefined, "b")).toBe("a b");
  });

  it("filters out null", () => {
    expect(cn("a", null, "b")).toBe("a b");
  });

  it("filters out false", () => {
    expect(cn("a", false, "b")).toBe("a b");
  });

  it("filters out empty string", () => {
    expect(cn("a", "", "b")).toBe("a b");
  });

  it("filters mixed falsy values", () => {
    expect(cn(undefined, null, false, "", "only")).toBe("only");
  });

  it("returns empty string when all inputs are falsy", () => {
    expect(cn(undefined, null, false, "")).toBe("");
  });
});

// ── getPlatformColor ─────────────────────────────────────────────────────────

describe("getPlatformColor", () => {
  it('returns Spotify green for "spotify"', () => {
    expect(getPlatformColor("spotify")).toBe("#1DB954");
  });

  it("is case-insensitive for Spotify", () => {
    expect(getPlatformColor("Spotify")).toBe("#1DB954");
    expect(getPlatformColor("SPOTIFY")).toBe("#1DB954");
  });

  it('matches partial platform names containing "spotify"', () => {
    expect(getPlatformColor("spotify-web")).toBe("#1DB954");
  });

  it('returns Apple Music red for "apple"', () => {
    expect(getPlatformColor("apple")).toBe("#FA243C");
  });

  it("is case-insensitive for Apple", () => {
    expect(getPlatformColor("Apple Music")).toBe("#FA243C");
    expect(getPlatformColor("APPLE")).toBe("#FA243C");
  });

  it("returns null for unknown platforms", () => {
    expect(getPlatformColor("youtube")).toBeNull();
    expect(getPlatformColor("tidal")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getPlatformColor("")).toBeNull();
  });
});

// ── formatTimeAgo ────────────────────────────────────────────────────────────

describe("formatTimeAgo", () => {
  // Fixed reference: 2025-06-15T12:00:00.000Z
  const NOW_MS = new Date("2025-06-15T12:00:00.000Z").getTime();

  /** Build an ISO timestamp that is `secondsAgo` seconds before NOW_MS */
  const ago = (secondsAgo: number): string => new Date(NOW_MS - secondsAgo * 1000).toISOString();

  /** Build an ISO timestamp that is `secondsAhead` seconds after NOW_MS */
  const ahead = (secondsAhead: number): string =>
    new Date(NOW_MS + secondsAhead * 1000).toISOString();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Empty / falsy input ──────────────────────────────────────────────────

  it('returns "" for empty string timestamp', () => {
    expect(formatTimeAgo("")).toBe("");
  });

  // ── Future timestamps ────────────────────────────────────────────────────

  it('returns "just now" for future timestamps', () => {
    expect(formatTimeAgo(ahead(60))).toBe("just now");
  });

  // ── Seconds bracket ──────────────────────────────────────────────────────

  it('returns "just now" for 0 seconds ago', () => {
    expect(formatTimeAgo(ago(0))).toBe("just now");
  });

  it('returns "just now" for 30 seconds ago', () => {
    expect(formatTimeAgo(ago(30))).toBe("just now");
  });

  it('returns "just now" for 59 seconds ago', () => {
    expect(formatTimeAgo(ago(59))).toBe("just now");
  });

  // ── Boundary: exactly 60 seconds → 1 minute ─────────────────────────────

  it('returns "1 minute ago" at exactly 60 seconds', () => {
    expect(formatTimeAgo(ago(60))).toBe("1 minute ago");
  });

  // ── Minutes bracket ──────────────────────────────────────────────────────

  it('returns "1 minute ago" for 1 minute', () => {
    expect(formatTimeAgo(ago(60))).toBe("1 minute ago");
  });

  it('returns "30 minutes ago" for 30 minutes', () => {
    expect(formatTimeAgo(ago(30 * 60))).toBe("30 minutes ago");
  });

  it('returns "59 minutes ago" for 59 minutes', () => {
    expect(formatTimeAgo(ago(59 * 60))).toBe("59 minutes ago");
  });

  // ── Boundary: exactly 60 minutes → 1 hour ───────────────────────────────

  it('returns "1 hour ago" at exactly 60 minutes', () => {
    expect(formatTimeAgo(ago(60 * 60))).toBe("1 hour ago");
  });

  // ── Hours bracket ────────────────────────────────────────────────────────

  it('returns "5 hours ago" for 5 hours', () => {
    expect(formatTimeAgo(ago(5 * 60 * 60))).toBe("5 hours ago");
  });

  it('returns "23 hours ago" for 23 hours', () => {
    expect(formatTimeAgo(ago(23 * 60 * 60))).toBe("23 hours ago");
  });

  // ── Boundary: exactly 24 hours → 1 day ──────────────────────────────────

  it('returns "1 day ago" at exactly 24 hours', () => {
    expect(formatTimeAgo(ago(24 * 60 * 60))).toBe("1 day ago");
  });

  // ── Days bracket ─────────────────────────────────────────────────────────

  it('returns "3 days ago" for 3 days', () => {
    expect(formatTimeAgo(ago(3 * 24 * 60 * 60))).toBe("3 days ago");
  });

  it('returns "6 days ago" for 6 days', () => {
    expect(formatTimeAgo(ago(6 * 24 * 60 * 60))).toBe("6 days ago");
  });

  // ── Boundary: exactly 7 days → 1 week ───────────────────────────────────

  it('returns "1 week ago" at exactly 7 days', () => {
    expect(formatTimeAgo(ago(7 * 24 * 60 * 60))).toBe("1 week ago");
  });

  // ── Weeks bracket ────────────────────────────────────────────────────────

  it('returns "2 weeks ago" for 14 days', () => {
    expect(formatTimeAgo(ago(14 * 24 * 60 * 60))).toBe("2 weeks ago");
  });

  it('returns "3 weeks ago" for 21 days', () => {
    expect(formatTimeAgo(ago(21 * 24 * 60 * 60))).toBe("3 weeks ago");
  });

  // ── Boundary: 4 weeks (28 days) → months bracket ────────────────────────

  it('returns "1 month ago" at 30 days', () => {
    expect(formatTimeAgo(ago(30 * 24 * 60 * 60))).toBe("1 month ago");
  });

  // ── Months bracket ──────────────────────────────────────────────────────

  it('returns "6 months ago" for ~180 days', () => {
    expect(formatTimeAgo(ago(180 * 24 * 60 * 60))).toBe("6 months ago");
  });

  it('returns "11 months ago" for ~330 days', () => {
    expect(formatTimeAgo(ago(330 * 24 * 60 * 60))).toBe("11 months ago");
  });

  // ── Boundary: 12 months → years bracket ─────────────────────────────────

  it('returns "1 year ago" at 365 days (12+ months triggers years bracket)', () => {
    expect(formatTimeAgo(ago(365 * 24 * 60 * 60))).toBe("1 year ago");
  });

  // ── Years bracket ────────────────────────────────────────────────────────

  it('returns "1 year ago" for 365 days', () => {
    expect(formatTimeAgo(ago(365 * 24 * 60 * 60))).toBe("1 year ago");
  });

  it('returns "3 years ago" for ~1095 days', () => {
    expect(formatTimeAgo(ago(3 * 365 * 24 * 60 * 60))).toBe("3 years ago");
  });

  // ── Spanish locale (es-MX) ──────────────────────────────────────────────

  describe('locale "es-MX"', () => {
    it("uses English JUST_NOW for future timestamps (before locale branch)", () => {
      expect(formatTimeAgo(ahead(10), "es-MX")).toBe("just now");
    });

    it("uses English JUST_NOW for < 60 seconds (before locale branch)", () => {
      expect(formatTimeAgo(ago(30), "es-MX")).toBe("just now");
    });

    it('returns "hace 1 minuto" for 1 minute (AGO before number)', () => {
      expect(formatTimeAgo(ago(60), "es-MX")).toBe("hace 1 minuto");
    });

    it('returns "hace 30 minutos" for 30 minutes', () => {
      expect(formatTimeAgo(ago(30 * 60), "es-MX")).toBe("hace 30 minutos");
    });

    it('returns "hace 5 horas" for 5 hours', () => {
      expect(formatTimeAgo(ago(5 * 60 * 60), "es-MX")).toBe("hace 5 horas");
    });

    it('returns "hace 3 días" for 3 days', () => {
      expect(formatTimeAgo(ago(3 * 24 * 60 * 60), "es-MX")).toBe("hace 3 días");
    });

    it('returns "hace 2 semanas" for 2 weeks', () => {
      expect(formatTimeAgo(ago(14 * 24 * 60 * 60), "es-MX")).toBe("hace 2 semanas");
    });

    it('returns "hace 6 meses" for ~180 days', () => {
      expect(formatTimeAgo(ago(180 * 24 * 60 * 60), "es-MX")).toBe("hace 6 meses");
    });

    it('returns "hace 3 años" for ~1095 days', () => {
      expect(formatTimeAgo(ago(3 * 365 * 24 * 60 * 60), "es-MX")).toBe("hace 3 años");
    });
  });

  // ── Default locale fallback ──────────────────────────────────────────────

  it("defaults to en-US when no locale is provided", () => {
    expect(formatTimeAgo(ago(120))).toBe("2 minutes ago");
  });

  it("falls back to en-US for unsupported locale", () => {
    expect(formatTimeAgo(ago(120), "fr-FR")).toBe("2 minutes ago");
  });
});
