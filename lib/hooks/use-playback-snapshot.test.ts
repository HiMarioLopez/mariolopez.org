import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NOW_PLAYING_CONFIG } from "@/lib/constants";
import { usePlaybackSnapshot } from "@/lib/hooks/use-playback-snapshot";

// ── Helpers ──────────────────────────────────────────────────────────────────

const BASE_TIME = new Date("2026-01-15T12:00:00.000Z").getTime();

/** Returns an ISO timestamp offset from BASE_TIME by `offsetMs` milliseconds. */
function tsAt(offsetMs: number): string {
  return new Date(BASE_TIME + offsetMs).toISOString();
}

// ── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(BASE_TIME);
});

afterEach(() => {
  vi.useRealTimers();
});

// ── Null returns ─────────────────────────────────────────────────────────────

describe("null returns", () => {
  it("returns null when no timestamp is provided", () => {
    const { result } = renderHook(() => usePlaybackSnapshot({}));
    expect(result.current).toBeNull();
  });

  it("returns null when timestamp is undefined", () => {
    const { result } = renderHook(() => usePlaybackSnapshot({ timestamp: undefined }));
    expect(result.current).toBeNull();
  });

  it("returns null when timestamp is an empty string", () => {
    const { result } = renderHook(() => usePlaybackSnapshot({ timestamp: "" }));
    expect(result.current).toBeNull();
  });

  it("returns null for an invalid (NaN) timestamp", () => {
    const { result } = renderHook(() => usePlaybackSnapshot({ timestamp: "not-a-date" }));
    expect(result.current).toBeNull();
  });
});

// ── isLikelyNowPlaying ──────────────────────────────────────────────────────

describe("isLikelyNowPlaying", () => {
  it("is true when track started 1 minute ago with 4 min duration", () => {
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(-60_000),
        durationMs: 240_000,
      }),
    );
    expect(result.current?.isLikelyNowPlaying).toBe(true);
  });

  it("is false when track started 10 minutes ago with 4 min duration", () => {
    // activeWindowMs = max(300000, 240000+120000) = 360000
    // elapsed = 600000 > 360000 → false
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(-600_000),
        durationMs: 240_000,
      }),
    );
    expect(result.current?.isLikelyNowPlaying).toBe(false);
  });

  it("is true when track started 4 minutes ago with no duration", () => {
    // elapsed = 240000, activeWindowMs = max(300000, 0+120000) = 300000
    // 240000 <= 300000 → true
    const { result } = renderHook(() => usePlaybackSnapshot({ timestamp: tsAt(-240_000) }));
    expect(result.current?.isLikelyNowPlaying).toBe(true);
  });

  it("is false when track started 6 minutes ago with no duration", () => {
    // elapsed = 360000, activeWindowMs = max(300000, 0+120000) = 300000
    // 360000 > 300000 → false
    const { result } = renderHook(() => usePlaybackSnapshot({ timestamp: tsAt(-360_000) }));
    expect(result.current?.isLikelyNowPlaying).toBe(false);
  });

  it("is true for a future timestamp within tolerance (30s ahead)", () => {
    // elapsed = -30000, >= -45000 → true
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(30_000),
        durationMs: 240_000,
      }),
    );
    expect(result.current?.isLikelyNowPlaying).toBe(true);
  });

  it("is false for a future timestamp beyond tolerance (60s ahead)", () => {
    // elapsed = -60000, < -45000 → false
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(60_000),
        durationMs: 240_000,
      }),
    );
    expect(result.current?.isLikelyNowPlaying).toBe(false);
  });

  it("is true at exactly the future tolerance boundary", () => {
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(NOW_PLAYING_CONFIG.FUTURE_TIMESTAMP_TOLERANCE_MS),
        durationMs: 240_000,
      }),
    );
    // elapsed = -45000, >= -45000 → true
    expect(result.current?.isLikelyNowPlaying).toBe(true);
  });

  it("is true at exactly the active window boundary", () => {
    // activeWindowMs = max(300000, 240000+120000) = 360000
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(-360_000),
        durationMs: 240_000,
      }),
    );
    // elapsed = 360000 <= 360000 → true
    expect(result.current?.isLikelyNowPlaying).toBe(true);
  });

  it("is false 1ms past the active window boundary", () => {
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(-360_001),
        durationMs: 240_000,
      }),
    );
    expect(result.current?.isLikelyNowPlaying).toBe(false);
  });
});

// ── progressPercent ──────────────────────────────────────────────────────────

describe("progressPercent", () => {
  it("returns 50% when halfway through a 4 min track", () => {
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(-120_000),
        durationMs: 240_000,
      }),
    );
    expect(result.current?.progressPercent).toBe(50);
  });

  it("caps at 100% when elapsed exceeds duration", () => {
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(-300_000),
        durationMs: 240_000,
      }),
    );
    expect(result.current?.progressPercent).toBe(100);
  });

  it("uses RECENT_PLAY_WINDOW_MS as denominator when no duration", () => {
    // elapsed = 150000, progress = 150000 / 300000 = 50%
    const { result } = renderHook(() => usePlaybackSnapshot({ timestamp: tsAt(-150_000) }));
    expect(result.current?.progressPercent).toBe(50);
  });

  it("caps at 100% without duration when elapsed exceeds window", () => {
    const { result } = renderHook(() => usePlaybackSnapshot({ timestamp: tsAt(-600_000) }));
    expect(result.current?.progressPercent).toBe(100);
  });

  it("returns 0% for a future timestamp (elapsed clamped to 0)", () => {
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(10_000),
        durationMs: 240_000,
      }),
    );
    expect(result.current?.progressPercent).toBe(0);
  });
});

// ── displayElapsedMs ─────────────────────────────────────────────────────────

describe("displayElapsedMs", () => {
  it("returns elapsed when under duration", () => {
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(-120_000),
        durationMs: 240_000,
      }),
    );
    expect(result.current?.displayElapsedMs).toBe(120_000);
  });

  it("caps at durationMs when elapsed exceeds duration", () => {
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(-300_000),
        durationMs: 240_000,
      }),
    );
    expect(result.current?.displayElapsedMs).toBe(240_000);
  });

  it("returns raw safe elapsed when no duration", () => {
    const { result } = renderHook(() => usePlaybackSnapshot({ timestamp: tsAt(-120_000) }));
    expect(result.current?.displayElapsedMs).toBe(120_000);
  });

  it("clamps to 0 for future timestamps without duration", () => {
    const { result } = renderHook(() => usePlaybackSnapshot({ timestamp: tsAt(10_000) }));
    expect(result.current?.displayElapsedMs).toBe(0);
  });
});

// ── elapsedMs ────────────────────────────────────────────────────────────────

describe("elapsedMs", () => {
  it("returns positive elapsed time", () => {
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(-120_000),
        durationMs: 240_000,
      }),
    );
    expect(result.current?.elapsedMs).toBe(120_000);
  });

  it("clamps to 0 for future timestamps (never negative)", () => {
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(30_000),
        durationMs: 240_000,
      }),
    );
    expect(result.current?.elapsedMs).toBe(0);
  });

  it("is 0 when timestamp equals current time", () => {
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(0),
        durationMs: 240_000,
      }),
    );
    expect(result.current?.elapsedMs).toBe(0);
  });
});

// ── durationMs in snapshot ───────────────────────────────────────────────────

describe("durationMs in snapshot", () => {
  it("returns valid positive durationMs as-is", () => {
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(-60_000),
        durationMs: 240_000,
      }),
    );
    expect(result.current?.durationMs).toBe(240_000);
  });

  it("returns null for zero durationMs", () => {
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(-60_000),
        durationMs: 0,
      }),
    );
    expect(result.current?.durationMs).toBeNull();
  });

  it("returns null for negative durationMs", () => {
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(-60_000),
        durationMs: -100,
      }),
    );
    expect(result.current?.durationMs).toBeNull();
  });

  it("returns null when durationMs is undefined", () => {
    const { result } = renderHook(() => usePlaybackSnapshot({ timestamp: tsAt(-60_000) }));
    expect(result.current?.durationMs).toBeNull();
  });
});

// ── Interval updates ─────────────────────────────────────────────────────────

describe("interval updates", () => {
  it("updates snapshot when timer ticks", () => {
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(-60_000),
        durationMs: 240_000,
      }),
    );

    const initialElapsed = result.current?.elapsedMs;
    expect(initialElapsed).toBe(60_000);

    act(() => {
      vi.advanceTimersByTime(NOW_PLAYING_CONFIG.UPDATE_INTERVAL_MS);
    });

    expect(result.current?.elapsedMs).toBe(60_000 + NOW_PLAYING_CONFIG.UPDATE_INTERVAL_MS);
  });

  it("updates progress over multiple ticks", () => {
    const { result } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(0),
        durationMs: 10_000,
      }),
    );

    expect(result.current?.progressPercent).toBe(0);

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(result.current?.progressPercent).toBe(50);

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(result.current?.progressPercent).toBe(100);
  });

  it("cleans up interval on unmount", () => {
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");

    const { unmount } = renderHook(() =>
      usePlaybackSnapshot({
        timestamp: tsAt(-60_000),
        durationMs: 240_000,
      }),
    );

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    clearIntervalSpy.mockRestore();
  });
});
