import { useState, useEffect, useMemo, useRef, startTransition } from "react";
import { BREAKPOINTS } from "@/lib/constants";

/**
 * Custom hook to detect if the viewport matches a media query
 * Uses native MediaQueryList API for optimal performance (no resize listener needed)
 *
 * @param query - Media query string or breakpoint key (e.g., "SM" checks if width < SM breakpoint)
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string | keyof typeof BREAKPOINTS): boolean {
  // Convert breakpoint key to media query string if needed
  // For breakpoint keys, check if screen is smaller than the breakpoint (mobile-first)
  const mediaQuery = useMemo(
    () =>
      query in BREAKPOINTS
        ? `(max-width: ${BREAKPOINTS[query as keyof typeof BREAKPOINTS] - 1}px)`
        : query,
    [query]
  );

  const [matches, setMatches] = useState(() => {
    // Lazy initialization ensures this only runs on client side
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(mediaQuery).matches;
  });

  const prevMediaQueryRef = useRef(mediaQuery);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(mediaQuery);
    
    // Only update state if mediaQuery actually changed (not on initial mount)
    if (prevMediaQueryRef.current !== mediaQuery) {
      prevMediaQueryRef.current = mediaQuery;
      // Use startTransition to mark this as a non-urgent update
      startTransition(() => {
        setMatches(mediaQueryList.matches);
      });
    }

    // Use the native change event listener (more performant than resize)
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers support addEventListener on MediaQueryList
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", handler);
      return () => mediaQueryList.removeEventListener("change", handler);
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(handler);
      return () => mediaQueryList.removeListener(handler);
    }
  }, [mediaQuery]);

  return matches;
}

