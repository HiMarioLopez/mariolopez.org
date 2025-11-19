"use client";

import { useRecentlyPlayed } from "@/lib/hooks/use-recently-played";
import { useFormatTimeAgo } from "@/lib/hooks/use-format-time-ago";
import { useMemo } from "react";

/**
 * Client Component that generates the dynamic recently-played section string
 * This is the only part that needs to be client-side due to data fetching
 */
export function useRecentlyPlayedSection(): string {
  const { data: recentlyPlayed } = useRecentlyPlayed();
  const timeAgo = useFormatTimeAgo(recentlyPlayed?.timestamp);

  return useMemo(() => {
    if (!recentlyPlayed || !timeAgo) {
      return "";
    }

    return `My most recently played song on ${recentlyPlayed.platform} is "${recentlyPlayed.song}" by ${recentlyPlayed.artist} (played ${timeAgo}).

Listen: ${recentlyPlayed.url}
`;
  }, [recentlyPlayed, timeAgo]);
}
