"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Prefetches both /human and /machine routes on initial mount
 * to enable instant navigation. Next.js caches prefetched routes,
 * so we only need to prefetch once.
 */
export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch both routes once on mount
    // Next.js will cache these, and Link components will handle
    // additional prefetching on hover
    router.prefetch("/human");
    router.prefetch("/machine");
  }, [router]);

  return null;
}
