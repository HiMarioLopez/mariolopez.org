"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Aggressively prefetches both /human and /robot routes
 * to ensure instant navigation with zero network delay
 */
export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch both routes immediately
    router.prefetch("/human");
    router.prefetch("/robot");

    // Keep prefetching to maintain cache
    const prefetchInterval = setInterval(() => {
      router.prefetch("/human");
      router.prefetch("/robot");
    }, 1000); // Every second to keep cache fresh

    return () => clearInterval(prefetchInterval);
  }, [router]);

  return null;
}

