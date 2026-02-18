import { useEffect, useMemo, useState } from "react";
import { NOW_PLAYING_CONFIG } from "@/lib/constants";

interface UsePlaybackSnapshotOptions {
  timestamp?: string;
  durationMs?: number;
}

export interface PlaybackSnapshot {
  durationMs: number | null;
  displayElapsedMs: number;
  elapsedMs: number;
  isLikelyNowPlaying: boolean;
  progressPercent: number;
}

export function usePlaybackSnapshot({
  timestamp,
  durationMs,
}: UsePlaybackSnapshotOptions): PlaybackSnapshot | null {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, NOW_PLAYING_CONFIG.UPDATE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return useMemo(() => {
    if (!timestamp) {
      return null;
    }

    const startedAtMs = new Date(timestamp).getTime();
    if (!Number.isFinite(startedAtMs)) {
      return null;
    }

    const elapsedMs = nowMs - startedAtMs;
    const resolvedDurationMs = typeof durationMs === "number" && durationMs > 0 ? durationMs : null;

    const activeWindowMs = Math.max(
      NOW_PLAYING_CONFIG.RECENT_PLAY_WINDOW_MS,
      (resolvedDurationMs ?? 0) + NOW_PLAYING_CONFIG.INGESTION_BUFFER_MS,
    );

    const isLikelyNowPlaying =
      elapsedMs >= -NOW_PLAYING_CONFIG.FUTURE_TIMESTAMP_TOLERANCE_MS && elapsedMs <= activeWindowMs;

    const safeElapsedMs = Math.max(0, elapsedMs);
    const displayElapsedMs = resolvedDurationMs
      ? Math.min(safeElapsedMs, resolvedDurationMs)
      : safeElapsedMs;
    const progressDenominator = resolvedDurationMs ?? NOW_PLAYING_CONFIG.RECENT_PLAY_WINDOW_MS;
    const progressRatio = Math.min(Math.max(safeElapsedMs / progressDenominator, 0), 1);

    return {
      durationMs: resolvedDurationMs,
      displayElapsedMs,
      elapsedMs: safeElapsedMs,
      isLikelyNowPlaying,
      progressPercent: progressRatio * 100,
    };
  }, [durationMs, nowMs, timestamp]);
}
