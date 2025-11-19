import { useQuery } from "@tanstack/react-query";
import type { RecentlyPlayed } from "@/lib/types";
import { CACHE_CONFIG } from "@/lib/config";

async function fetchRecentlyPlayed({
  signal,
}: {
  signal?: AbortSignal;
}): Promise<RecentlyPlayed | null> {
  const response = await fetch("/api/recently-played", {
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

export function useRecentlyPlayed() {
  return useQuery<RecentlyPlayed | null>({
    queryKey: ["recently-played"],
    queryFn: ({ signal }) => fetchRecentlyPlayed({ signal }),
    staleTime: CACHE_CONFIG.REVALIDATE_SECONDS * 1000, // Consider data fresh for configured seconds
    retry: 1, // Retry once on failure for better error recovery
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff, max 30s
  });
}

