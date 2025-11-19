"use client";

import { useRecentlyPlayed } from "@/lib/hooks/use-recently-played";
import { formatTimeAgo } from "@/lib/utils";
import { useMemo } from "react";

/**
 * Client Component that generates the dynamic recently-played section string
 * This is the only part that needs to be client-side due to data fetching
 */
export function useRecentlyPlayedSection(): string {
  const { data: recentlyPlayed } = useRecentlyPlayed();

  return useMemo(() => {
    if (!recentlyPlayed) {
      return "";
    }

    return `My most recently played song on ${recentlyPlayed.platform} is "${
      recentlyPlayed.song
    }" by ${recentlyPlayed.artist} (played ${formatTimeAgo(
      recentlyPlayed.timestamp
    )}).

Listen: ${recentlyPlayed.url}
`;
  }, [recentlyPlayed]);
}
