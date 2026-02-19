import { useQuery } from "@tanstack/react-query";
import { NOW_PLAYING_CONFIG, QUERY_CONFIG } from "@/lib/constants";
import type { RecentlyPlayed } from "@/lib/types";

async function fetchRecentlyPlayed({
  signal,
}: {
  signal?: AbortSignal;
}): Promise<RecentlyPlayed | null> {
  const response = await fetch("/api/recently-played", {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error("Failed to fetch recently played");
  }

  return response.json();
}

function parseTimestampMs(timestamp: string | undefined): number | null {
  if (!timestamp) {
    return null;
  }

  const parsedTimestamp = Date.parse(timestamp);
  return Number.isFinite(parsedTimestamp) ? parsedTimestamp : null;
}

function getAdaptiveRefetchIntervalMs(track: RecentlyPlayed | null | undefined): number {
  const startedAtMs = parseTimestampMs(track?.timestamp);
  if (startedAtMs === null) {
    return QUERY_CONFIG.RECENTLY_PLAYED_IDLE_REFETCH_INTERVAL_MS;
  }

  const elapsedMs = Date.now() - startedAtMs;
  const resolvedDurationMs =
    typeof track?.durationMs === "number" && track.durationMs > 0 ? track.durationMs : null;

  const activeWindowMs = Math.max(
    NOW_PLAYING_CONFIG.RECENT_PLAY_WINDOW_MS,
    (resolvedDurationMs ?? 0) + NOW_PLAYING_CONFIG.INGESTION_BUFFER_MS,
  );

  const isLikelyNowPlaying =
    elapsedMs >= -NOW_PLAYING_CONFIG.FUTURE_TIMESTAMP_TOLERANCE_MS && elapsedMs <= activeWindowMs;

  return isLikelyNowPlaying
    ? QUERY_CONFIG.RECENTLY_PLAYED_ACTIVE_REFETCH_INTERVAL_MS
    : QUERY_CONFIG.RECENTLY_PLAYED_IDLE_REFETCH_INTERVAL_MS;
}

export function useRecentlyPlayed() {
  return useQuery<RecentlyPlayed | null>({
    queryKey: ["recently-played"],
    queryFn: ({ signal }) => fetchRecentlyPlayed({ signal }),
    staleTime: 0,
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
    refetchInterval: (query) => getAdaptiveRefetchIntervalMs(query.state.data),
    retry: 1, // Retry once on failure for better error recovery
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff, max 30s
  });
}
