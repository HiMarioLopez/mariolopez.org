import { useQuery } from "@tanstack/react-query";
import type { RecentlyPlayed } from "@/lib/types";

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
    staleTime: 60 * 1000, // Consider data fresh for 60 seconds
  });
}

