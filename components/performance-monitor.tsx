"use client";

import { useEffect } from "react";
import { initPerformanceMonitoring } from "@/lib/performance";

/**
 * Deferred initialization helper using requestIdleCallback with fallback
 * Ensures performance monitoring doesn't block critical rendering path
 * @returns Cleanup function to cancel deferred execution
 */
function deferInitialization(callback: () => void): (() => void) | undefined {
  if (typeof window === "undefined") return undefined;

  // Use requestIdleCallback if available (preferred for non-blocking execution)
  if ("requestIdleCallback" in window) {
    const idleCallbackId = window.requestIdleCallback(
      callback,
      { timeout: 2000 }, // Fallback timeout: execute after 2s even if browser never becomes idle
    );

    // Cleanup function to cancel if component unmounts
    return () => {
      window.cancelIdleCallback(idleCallbackId);
    };
  } else {
    // Fallback for browsers without requestIdleCallback support
    // Defer until after initial render and first paint
    const timeoutId = setTimeout(callback, 0);
    return () => {
      clearTimeout(timeoutId);
    };
  }
}

export function PerformanceMonitor() {
  useEffect(() => {
    const cleanup = deferInitialization(() => {
      try {
        initPerformanceMonitoring();
      } catch (error) {
        // Silently fail - performance monitoring errors shouldn't affect the app
        // Log in development for debugging
        if (process.env.NODE_ENV === "development") {
          console.error("Performance monitoring initialization failed:", error);
        }
      }
    });

    return cleanup;
  }, []);

  return null; // This component doesn't render anything
}
