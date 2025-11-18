import { useQuery } from "@tanstack/react-query";
import type { RecentlyPlayed } from "@/lib/types";
import { CACHE_CONFIG } from "@/lib/config";

async function fetchRecentlyPlayed(): Promise<RecentlyPlayed | null> {
  const response = await fetch("/api/recently-played");
  
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
    queryFn: fetchRecentlyPlayed,
    staleTime: CACHE_CONFIG.REVALIDATE_SECONDS * 1000, // Consider data fresh for configured seconds
  });
}

