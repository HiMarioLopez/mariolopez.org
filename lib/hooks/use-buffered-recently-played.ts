import { useEffect, useMemo, useState } from "react";
import { NOW_PLAYING_CONFIG } from "@/lib/constants";
import { type PlaybackSnapshot, usePlaybackSnapshot } from "@/lib/hooks/use-playback-snapshot";
import type { RecentlyPlayed } from "@/lib/types";

interface BufferedRecentlyPlayedResult {
  recentlyPlayed: RecentlyPlayed | null;
  playbackSnapshot: PlaybackSnapshot | null;
}

function normalizeText(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function parseTimestampMs(timestamp: string): number | null {
  const parsedTimestampMs = Date.parse(timestamp);
  return Number.isFinite(parsedTimestampMs) ? parsedTimestampMs : null;
}

function hasSameTrackIdentity(
  currentTrack: RecentlyPlayed,
  incomingTrack: RecentlyPlayed,
): boolean {
  return (
    normalizeText(currentTrack.song) === normalizeText(incomingTrack.song) &&
    normalizeText(currentTrack.artist) === normalizeText(incomingTrack.artist) &&
    normalizeText(currentTrack.platform) === normalizeText(incomingTrack.platform)
  );
}

function getTrackSignature(track: RecentlyPlayed | null | undefined): string {
  if (!track) {
    return "";
  }

  return [
    track.song,
    track.artist,
    track.platform,
    track.url,
    track.timestamp,
    track.durationMs ?? "",
    track.artworkUrl ?? "",
    track.artworkColors?.backgroundColor ?? "",
    track.artworkColors?.textColor1 ?? "",
    track.artworkColors?.textColor2 ?? "",
    track.artworkColors?.textColor3 ?? "",
    track.artworkColors?.textColor4 ?? "",
  ].join("\u0001");
}

function areTracksEqual(
  currentTrack: RecentlyPlayed | null | undefined,
  incomingTrack: RecentlyPlayed | null | undefined,
): boolean {
  return getTrackSignature(currentTrack) === getTrackSignature(incomingTrack);
}

function mergeTrackWithDurationFallback(
  currentTrack: RecentlyPlayed,
  incomingTrack: RecentlyPlayed,
): RecentlyPlayed {
  return {
    ...incomingTrack,
    durationMs: incomingTrack.durationMs ?? currentTrack.durationMs,
  };
}

function mergeActiveTrack(
  currentTrack: RecentlyPlayed,
  incomingTrack: RecentlyPlayed,
): RecentlyPlayed {
  const mergedTrack = mergeTrackWithDurationFallback(currentTrack, incomingTrack);
  const currentStartedAtMs = parseTimestampMs(currentTrack.timestamp);
  const incomingStartedAtMs = parseTimestampMs(incomingTrack.timestamp);

  if (currentStartedAtMs === null || incomingStartedAtMs === null) {
    return mergedTrack;
  }

  const timestampDriftMs = incomingStartedAtMs - currentStartedAtMs;

  if (timestampDriftMs <= NOW_PLAYING_CONFIG.SAME_TRACK_TIMESTAMP_DRIFT_TOLERANCE_MS) {
    return {
      ...mergedTrack,
      timestamp: currentTrack.timestamp,
    };
  }

  return mergedTrack;
}

function shouldConfidentlySwitchTracks(
  currentTrack: RecentlyPlayed,
  incomingTrack: RecentlyPlayed,
): boolean {
  const currentStartedAtMs = parseTimestampMs(currentTrack.timestamp);
  const incomingStartedAtMs = parseTimestampMs(incomingTrack.timestamp);

  if (currentStartedAtMs === null || incomingStartedAtMs === null) {
    return true;
  }

  return incomingStartedAtMs - currentStartedAtMs >= NOW_PLAYING_CONFIG.TRACK_SWITCH_DELTA_MS;
}

/**
 * Keeps a stable track visible during active playback and buffers noisy updates.
 * This avoids UI flicker from intermittent null payloads or same-track timestamp drift.
 */
export function useBufferedRecentlyPlayed(
  incomingTrack: RecentlyPlayed | null | undefined,
): BufferedRecentlyPlayedResult {
  const [displayTrack, setDisplayTrack] = useState<RecentlyPlayed | null>(
    () => incomingTrack ?? null,
  );
  const [queuedTrack, setQueuedTrack] = useState<RecentlyPlayed | null>(null);
  const playbackSnapshot = usePlaybackSnapshot({
    timestamp: displayTrack?.timestamp,
    durationMs: displayTrack?.durationMs,
  });
  const isDisplayTrackLikelyNowPlaying = playbackSnapshot?.isLikelyNowPlaying ?? false;

  useEffect(() => {
    if (!incomingTrack) {
      if (isDisplayTrackLikelyNowPlaying) {
        return;
      }

      if (queuedTrack) {
        if (!areTracksEqual(displayTrack, queuedTrack)) {
          setDisplayTrack(queuedTrack);
        }
        setQueuedTrack(null);
        return;
      }

      if (displayTrack !== null) {
        setDisplayTrack(null);
      }
      return;
    }

    if (!displayTrack) {
      setDisplayTrack(incomingTrack);
      if (queuedTrack !== null) {
        setQueuedTrack(null);
      }
      return;
    }

    if (hasSameTrackIdentity(displayTrack, incomingTrack)) {
      const nextTrack = isDisplayTrackLikelyNowPlaying
        ? mergeActiveTrack(displayTrack, incomingTrack)
        : mergeTrackWithDurationFallback(displayTrack, incomingTrack);

      if (!areTracksEqual(displayTrack, nextTrack)) {
        setDisplayTrack(nextTrack);
      }

      if (queuedTrack !== null) {
        setQueuedTrack(null);
      }
      return;
    }

    const shouldSwitchImmediately =
      !isDisplayTrackLikelyNowPlaying || shouldConfidentlySwitchTracks(displayTrack, incomingTrack);

    if (shouldSwitchImmediately) {
      if (!areTracksEqual(displayTrack, incomingTrack)) {
        setDisplayTrack(incomingTrack);
      }
      if (queuedTrack !== null) {
        setQueuedTrack(null);
      }
      return;
    }

    if (!areTracksEqual(queuedTrack, incomingTrack)) {
      setQueuedTrack(incomingTrack);
    }
  }, [displayTrack, incomingTrack, isDisplayTrackLikelyNowPlaying, queuedTrack]);

  useEffect(() => {
    if (!queuedTrack || isDisplayTrackLikelyNowPlaying) {
      return;
    }

    if (!areTracksEqual(displayTrack, queuedTrack)) {
      setDisplayTrack(queuedTrack);
    }
    setQueuedTrack(null);
  }, [displayTrack, isDisplayTrackLikelyNowPlaying, queuedTrack]);

  return useMemo(
    () => ({
      recentlyPlayed: displayTrack,
      playbackSnapshot,
    }),
    [displayTrack, playbackSnapshot],
  );
}
