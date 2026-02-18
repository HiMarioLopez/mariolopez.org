"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoutePrefetcherProps {
  lang: string;
}

/**
 * Prefetches the non-current route on initial mount to enable instant navigation.
 * Next.js Link components already prefetch on hover, so we only need to prefetch
 * the route the user isn't currently on.
 */
export function RoutePrefetcher({ lang }: RoutePrefetcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const normalizedPathname =
      pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
    const humanPath = `/${lang}`;
    const machinePath = `/${lang}/machine`;

    // Only prefetch the route the user isn't currently on.
    // Next.js Link components handle hover prefetching automatically.
    const isHuman = normalizedPathname === "/" || normalizedPathname === humanPath;
    const isMachine = normalizedPathname === machinePath;

    if (isHuman) {
      router.prefetch(machinePath);
    } else if (isMachine) {
      router.prefetch(humanPath);
    }
  }, [lang, router, pathname]);

  return null;
}
