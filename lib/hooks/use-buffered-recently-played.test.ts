import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { useBufferedRecentlyPlayed } from "@/lib/hooks/use-buffered-recently-played";
import type { PlaybackSnapshot } from "@/lib/hooks/use-playback-snapshot";
import type { RecentlyPlayed } from "@/lib/types";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/hooks/use-playback-snapshot", () => ({
  usePlaybackSnapshot: vi.fn(),
}));

import { usePlaybackSnapshot } from "@/lib/hooks/use-playback-snapshot";

const mockUsePlaybackSnapshot = usePlaybackSnapshot as Mock;

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeTrack(overrides?: Partial<RecentlyPlayed>): RecentlyPlayed {
  return {
    song: "Test Song",
    artist: "Test Artist",
    platform: "Spotify",
    url: "https://example.com/track",
    timestamp: "2025-01-01T12:00:00Z",
    ...overrides,
  };
}

function makeSnapshot(overrides?: Partial<PlaybackSnapshot>): PlaybackSnapshot {
  return {
    durationMs: null,
    displayElapsedMs: 0,
    elapsedMs: 0,
    isLikelyNowPlaying: false,
    progressPercent: 0,
    ...overrides,
  };
}

function mockPlaying(playing: boolean) {
  mockUsePlaybackSnapshot.mockReturnValue(makeSnapshot({ isLikelyNowPlaying: playing }));
}

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockUsePlaybackSnapshot.mockReset();
  mockPlaying(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Initial State ────────────────────────────────────────────────────────────

describe("useBufferedRecentlyPlayed", () => {
  describe("initial state", () => {
    it("returns null recentlyPlayed when incoming is null", () => {
      const { result } = renderHook(() => useBufferedRecentlyPlayed(null));

      expect(result.current.recentlyPlayed).toBeNull();
    });

    it("returns null recentlyPlayed when incoming is undefined", () => {
      const { result } = renderHook(() => useBufferedRecentlyPlayed(undefined));

      expect(result.current.recentlyPlayed).toBeNull();
    });

    it("returns the incoming track when provided", () => {
      const track = makeTrack();
      const { result } = renderHook(() => useBufferedRecentlyPlayed(track));

      expect(result.current.recentlyPlayed).toEqual(track);
    });

    it("exposes the playbackSnapshot from usePlaybackSnapshot", () => {
      const snapshot = makeSnapshot({ isLikelyNowPlaying: true, elapsedMs: 5000 });
      mockUsePlaybackSnapshot.mockReturnValue(snapshot);

      const { result } = renderHook(() => useBufferedRecentlyPlayed(makeTrack()));

      expect(result.current.playbackSnapshot).toBe(snapshot);
    });

    it("returns null playbackSnapshot when usePlaybackSnapshot returns null", () => {
      mockUsePlaybackSnapshot.mockReturnValue(null);

      const { result } = renderHook(() => useBufferedRecentlyPlayed(null));

      expect(result.current.playbackSnapshot).toBeNull();
    });
  });

  // ── Null Incoming While Playing ──────────────────────────────────────────

  describe("null incoming while playing", () => {
    it("retains display track when isLikelyNowPlaying is true and incoming becomes null", () => {
      const track = makeTrack();
      mockPlaying(true);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: track as RecentlyPlayed | null } },
      );

      expect(result.current.recentlyPlayed).toEqual(track);

      rerender({ incoming: null });

      expect(result.current.recentlyPlayed).toEqual(track);
    });

    it("clears display track when isLikelyNowPlaying is false and incoming becomes null", () => {
      const track = makeTrack();
      mockPlaying(false);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: track as RecentlyPlayed | null } },
      );

      expect(result.current.recentlyPlayed).toEqual(track);

      rerender({ incoming: null });

      expect(result.current.recentlyPlayed).toBeNull();
    });
  });

  // ── Same Track Identity ────────────────────────────────────────────────

  describe("same track identity (same song+artist+platform)", () => {
    it("keeps original timestamp when playing and drift is within tolerance", () => {
      const originalTimestamp = "2025-01-01T12:00:00Z";
      const driftedTimestamp = "2025-01-01T12:01:00Z"; // 60s drift, within 90s tolerance
      const track = makeTrack({ timestamp: originalTimestamp });
      const updatedTrack = makeTrack({ timestamp: driftedTimestamp });

      mockPlaying(true);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: track } },
      );

      rerender({ incoming: updatedTrack });

      expect(result.current.recentlyPlayed?.timestamp).toBe(originalTimestamp);
    });

    it("uses new timestamp when playing and drift exceeds tolerance", () => {
      const originalTimestamp = "2025-01-01T12:00:00Z";
      // 91s drift, beyond 90s tolerance
      const driftedTimestamp = "2025-01-01T12:01:31Z";
      const track = makeTrack({ timestamp: originalTimestamp });
      const updatedTrack = makeTrack({ timestamp: driftedTimestamp });

      mockPlaying(true);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: track } },
      );

      rerender({ incoming: updatedTrack });

      expect(result.current.recentlyPlayed?.timestamp).toBe(driftedTimestamp);
    });

    it("uses incoming timestamp when not playing (duration fallback merge only)", () => {
      const originalTimestamp = "2025-01-01T12:00:00Z";
      const newTimestamp = "2025-01-01T12:00:30Z"; // 30s drift
      const track = makeTrack({ timestamp: originalTimestamp });
      const updatedTrack = makeTrack({ timestamp: newTimestamp });

      mockPlaying(false);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: track } },
      );

      rerender({ incoming: updatedTrack });

      expect(result.current.recentlyPlayed?.timestamp).toBe(newTimestamp);
    });

    it("merges durationMs from incoming when display track lacks it", () => {
      const track = makeTrack({ durationMs: undefined });
      const updatedTrack = makeTrack({ durationMs: 240000 });

      mockPlaying(true);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: track } },
      );

      rerender({ incoming: updatedTrack });

      expect(result.current.recentlyPlayed?.durationMs).toBe(240000);
    });

    it("matches tracks case-insensitively with trimmed whitespace", () => {
      const track = makeTrack({ song: "Test Song", artist: "Test Artist" });
      const caseVariant = makeTrack({
        song: "  test song  ",
        artist: "  TEST ARTIST  ",
        timestamp: "2025-01-01T12:00:30Z",
      });

      mockPlaying(false);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: track } },
      );

      rerender({ incoming: caseVariant });

      // Should be treated as same track (merged), not a different track switch
      // The timestamp should be the incoming timestamp since not playing
      expect(result.current.recentlyPlayed?.timestamp).toBe("2025-01-01T12:00:30Z");
      expect(result.current.recentlyPlayed?.song).toBe("  test song  ");
    });
  });

  // ── Different Track Switching ──────────────────────────────────────────

  describe("different track switching", () => {
    it("switches immediately when not playing", () => {
      const trackA = makeTrack({ song: "Song A" });
      const trackB = makeTrack({ song: "Song B" });

      mockPlaying(false);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: trackA } },
      );

      rerender({ incoming: trackB });

      expect(result.current.recentlyPlayed?.song).toBe("Song B");
    });

    it("switches immediately when playing and timestamp delta >= TRACK_SWITCH_DELTA_MS (confident switch)", () => {
      const trackA = makeTrack({ song: "Song A", timestamp: "2025-01-01T12:00:00Z" });
      const trackB = makeTrack({ song: "Song B", timestamp: "2025-01-01T12:00:03Z" }); // 3s delta >= 2s

      mockPlaying(true);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: trackA } },
      );

      rerender({ incoming: trackB });

      expect(result.current.recentlyPlayed?.song).toBe("Song B");
    });

    it("queues track when playing and timestamp delta < TRACK_SWITCH_DELTA_MS", () => {
      const trackA = makeTrack({ song: "Song A", timestamp: "2025-01-01T12:00:00Z" });
      const trackB = makeTrack({ song: "Song B", timestamp: "2025-01-01T12:00:01Z" }); // 1s delta < 2s

      mockPlaying(true);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: trackA } },
      );

      rerender({ incoming: trackB });

      // Track B should be queued, not displayed
      expect(result.current.recentlyPlayed?.song).toBe("Song A");
    });

    it("switches immediately when playing and timestamps are unparseable", () => {
      const trackA = makeTrack({ song: "Song A", timestamp: "invalid" });
      const trackB = makeTrack({ song: "Song B", timestamp: "also-invalid" });

      mockPlaying(true);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: trackA } },
      );

      rerender({ incoming: trackB });

      // shouldConfidentlySwitchTracks returns true for unparseable timestamps
      expect(result.current.recentlyPlayed?.song).toBe("Song B");
    });
  });

  // ── Queued Track Promotion ─────────────────────────────────────────────

  describe("queued track promotion", () => {
    it("promotes queued track when isLikelyNowPlaying becomes false", () => {
      const trackA = makeTrack({ song: "Song A", timestamp: "2025-01-01T12:00:00Z" });
      const trackB = makeTrack({ song: "Song B", timestamp: "2025-01-01T12:00:01Z" }); // 1s < 2s, will be queued

      mockPlaying(true);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: trackA } },
      );

      // Queue track B (delta < 2s while playing)
      rerender({ incoming: trackB });
      expect(result.current.recentlyPlayed?.song).toBe("Song A");

      // Stop playing → queued track promoted
      mockPlaying(false);
      rerender({ incoming: trackB });

      expect(result.current.recentlyPlayed?.song).toBe("Song B");
    });

    it("settles to null when incoming becomes null and not playing (queued track promoted then cleared)", () => {
      const trackA = makeTrack({ song: "Song A", timestamp: "2025-01-01T12:00:00Z" });
      const trackB = makeTrack({ song: "Song B", timestamp: "2025-01-01T12:00:01Z" });

      mockPlaying(true);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: trackA as RecentlyPlayed | null } },
      );

      // Queue track B
      rerender({ incoming: trackB });
      expect(result.current.recentlyPlayed?.song).toBe("Song A");

      // Null incoming + not playing → queued track transiently promoted, then cleared
      // because the next effect cycle sees null incoming + not playing + no queue
      mockPlaying(false);
      rerender({ incoming: null });

      expect(result.current.recentlyPlayed).toBeNull();
    });

    it("promotes queued track and retains it when promoted track is still playing", () => {
      const trackA = makeTrack({ song: "Song A", timestamp: "2025-01-01T12:00:00Z" });
      const trackB = makeTrack({ song: "Song B", timestamp: "2025-01-01T12:00:01Z" });

      mockPlaying(true);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: trackA as RecentlyPlayed | null } },
      );

      // Queue track B (delta < 2s while playing)
      rerender({ incoming: trackB });
      expect(result.current.recentlyPlayed?.song).toBe("Song A");

      // Playing stops → second effect promotes queued track
      // Then mock returns playing=true for the promoted track so null incoming retains it
      let callCount = 0;
      mockUsePlaybackSnapshot.mockImplementation(() => {
        callCount++;
        // First call during the rerender: not playing (triggers promotion)
        // Subsequent calls: playing (retains promoted track against null incoming)
        return makeSnapshot({ isLikelyNowPlaying: callCount > 1 });
      });
      rerender({ incoming: null as RecentlyPlayed | null });

      expect(result.current.recentlyPlayed?.song).toBe("Song B");
    });
  });

  // ── Deduplication ──────────────────────────────────────────────────────

  describe("deduplication (areTracksEqual)", () => {
    it("does not update state when rerendering with an identical track", () => {
      const track = makeTrack();

      mockPlaying(false);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: track } },
      );

      const firstRef = result.current.recentlyPlayed;

      // Rerender with a structurally identical but new object reference
      rerender({ incoming: { ...track } });

      // Display track should be the same reference (no state update)
      expect(result.current.recentlyPlayed).toBe(firstRef);
    });

    it("detects difference when artworkColors change", () => {
      const track = makeTrack({
        artworkColors: { backgroundColor: "#000" },
      });
      const updatedTrack = makeTrack({
        artworkColors: { backgroundColor: "#fff" },
      });

      mockPlaying(false);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: track } },
      );

      rerender({ incoming: updatedTrack });

      expect(result.current.recentlyPlayed?.artworkColors?.backgroundColor).toBe("#fff");
    });
  });

  // ── Duration Fallback Merging ──────────────────────────────────────────

  describe("duration fallback merging", () => {
    it("keeps display durationMs when incoming lacks it (same track, playing)", () => {
      const track = makeTrack({ durationMs: 180000 });
      const updatedTrack = makeTrack({ durationMs: undefined, timestamp: "2025-01-01T12:00:30Z" });

      mockPlaying(true);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: track } },
      );

      rerender({ incoming: updatedTrack });

      expect(result.current.recentlyPlayed?.durationMs).toBe(180000);
    });

    it("keeps display durationMs when incoming lacks it (same track, not playing)", () => {
      const track = makeTrack({ durationMs: 180000 });
      const updatedTrack = makeTrack({ durationMs: undefined, timestamp: "2025-01-01T12:00:30Z" });

      mockPlaying(false);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: track } },
      );

      rerender({ incoming: updatedTrack });

      expect(result.current.recentlyPlayed?.durationMs).toBe(180000);
    });

    it("picks up incoming durationMs when display track lacks it", () => {
      const track = makeTrack({ durationMs: undefined });
      const updatedTrack = makeTrack({ durationMs: 210000, timestamp: "2025-01-01T12:00:30Z" });

      mockPlaying(false);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: track } },
      );

      rerender({ incoming: updatedTrack });

      expect(result.current.recentlyPlayed?.durationMs).toBe(210000);
    });

    it("prefers incoming durationMs when both have it", () => {
      const track = makeTrack({ durationMs: 180000 });
      const updatedTrack = makeTrack({ durationMs: 200000, timestamp: "2025-01-01T12:00:30Z" });

      mockPlaying(false);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: track } },
      );

      rerender({ incoming: updatedTrack });

      expect(result.current.recentlyPlayed?.durationMs).toBe(200000);
    });
  });

  // ── Edge Cases ─────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("sets display track when incoming arrives after initial null", () => {
      const track = makeTrack();

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: null as RecentlyPlayed | null } },
      );

      expect(result.current.recentlyPlayed).toBeNull();

      rerender({ incoming: track });

      expect(result.current.recentlyPlayed).toEqual(track);
    });

    it("accepts new incoming track after display was null", () => {
      const trackC = makeTrack({ song: "Song C" });

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: null as RecentlyPlayed | null } },
      );

      expect(result.current.recentlyPlayed).toBeNull();

      rerender({ incoming: trackC });

      expect(result.current.recentlyPlayed?.song).toBe("Song C");
    });

    it("passes displayTrack timestamp and durationMs to usePlaybackSnapshot", () => {
      const track = makeTrack({ timestamp: "2025-06-01T10:00:00Z", durationMs: 300000 });

      renderHook(() => useBufferedRecentlyPlayed(track));

      expect(mockUsePlaybackSnapshot).toHaveBeenCalledWith({
        timestamp: "2025-06-01T10:00:00Z",
        durationMs: 300000,
      });
    });

    it("passes undefined to usePlaybackSnapshot when no display track", () => {
      renderHook(() => useBufferedRecentlyPlayed(null));

      expect(mockUsePlaybackSnapshot).toHaveBeenCalledWith({
        timestamp: undefined,
        durationMs: undefined,
      });
    });

    it("handles exact boundary of SAME_TRACK_TIMESTAMP_DRIFT_TOLERANCE_MS (90s)", () => {
      const originalTimestamp = "2025-01-01T12:00:00Z";
      // Exactly 90s drift — within tolerance (<=)
      const exactBoundary = "2025-01-01T12:01:30Z";
      const track = makeTrack({ timestamp: originalTimestamp });
      const updatedTrack = makeTrack({ timestamp: exactBoundary });

      mockPlaying(true);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: track } },
      );

      rerender({ incoming: updatedTrack });

      // Exactly at boundary → keeps original (<=)
      expect(result.current.recentlyPlayed?.timestamp).toBe(originalTimestamp);
    });

    it("handles exact boundary of TRACK_SWITCH_DELTA_MS (2s)", () => {
      const trackA = makeTrack({ song: "Song A", timestamp: "2025-01-01T12:00:00Z" });
      // Exactly 2s delta — switches immediately (>=)
      const trackB = makeTrack({ song: "Song B", timestamp: "2025-01-01T12:00:02Z" });

      mockPlaying(true);

      const { result, rerender } = renderHook(
        ({ incoming }) => useBufferedRecentlyPlayed(incoming),
        { initialProps: { incoming: trackA } },
      );

      rerender({ incoming: trackB });

      expect(result.current.recentlyPlayed?.song).toBe("Song B");
    });
  });
});
