import { useQuery } from "@tanstack/react-query";
import { CACHE_CONFIG } from "@/lib/config";

interface VisitorCountResponse {
  count: number;
}

interface UseVisitorCountOptions {
  increment?: boolean;
}

async function fetchCurrentVisitorCount(signal?: AbortSignal): Promise<number | null> {
  const response = await fetch("/api/visitor-count", { signal });
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as VisitorCountResponse;
  return typeof data.count === "number" ? data.count : null;
}

async function fetchVisitorCount({
  signal,
  increment = false,
}: {
  signal?: AbortSignal;
  increment?: boolean;
}): Promise<number | null> {
  if (!increment) {
    return fetchCurrentVisitorCount(signal);
  }

  try {
    const incrementResponse = await fetch("/api/visitor-count", {
      method: "POST",
      signal,
    });

    if (incrementResponse.ok) {
      const data = (await incrementResponse.json()) as VisitorCountResponse;
      return typeof data.count === "number" ? data.count : null;
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
  }

  return fetchCurrentVisitorCount(signal);
}

export function useVisitorCount({ increment = false }: UseVisitorCountOptions = {}) {
  return useQuery<number | null>({
    queryKey: ["visitor-count", increment ? "increment" : "read"],
    queryFn: ({ signal }) => fetchVisitorCount({ signal, increment }),
    staleTime: CACHE_CONFIG.REVALIDATE_SECONDS * 1000,
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
  });
}
