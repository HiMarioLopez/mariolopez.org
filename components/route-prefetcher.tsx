"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Prefetches the non-current route on initial mount to enable instant navigation.
 * Next.js Link components already prefetch on hover, so we only need to prefetch
 * the route the user isn't currently on.
 */
export function RoutePrefetcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only prefetch the route the user isn't currently on
    // Next.js Link components handle hover prefetching automatically
    const isHuman = pathname === "/human" || pathname === "/";
    if (isHuman) {
      router.prefetch("/machine");
    } else {
      router.prefetch("/human");
    }
  }, [router, pathname]);

  return null;
}
