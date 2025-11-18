// Performance monitoring utilities

import type {
  WebVitalsMetric,
  LayoutShiftEntry,
  LCPEntry,
  FirstInputEntry,
} from "./types";
import { PERFORMANCE_THRESHOLDS } from "./constants";

/**
 * Reports Web Vitals metrics
 *
 * @param metric - Web Vitals metric data
 */
export function reportWebVitals(metric: WebVitalsMetric): void {
  // Send to analytics endpoint or logging service
  if (process.env.NODE_ENV === "production") {
    // You can send to your analytics service here
    // Example: sendToAnalytics(metric);
  }

  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.log(metric);
  }
}

/**
 * Measures Core Web Vitals and other performance metrics
 */
export function measurePerformance(): void {
  if (typeof window === "undefined") return;

  // Measure Core Web Vitals
  if ("PerformanceObserver" in window) {
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as unknown as LCPEntry;
        reportWebVitals({
          name: "LCP",
          value:
            lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime,
          id: lastEntry.id || "lcp",
        });
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as unknown as FirstInputEntry;
          reportWebVitals({
            name: "FID",
            value: fidEntry.processingStart - fidEntry.startTime,
            id: fidEntry.name,
          });
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const clsEntry = entry as unknown as LayoutShiftEntry;
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
          }
        });
        reportWebVitals({
          name: "CLS",
          value: clsValue,
          id: "cls",
        });
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });

      // First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === "first-contentful-paint") {
            reportWebVitals({
              name: "FCP",
              value: entry.startTime,
              id: entry.name,
            });
          }
        });
      });
      fcpObserver.observe({ entryTypes: ["paint"] });

      // Time to First Byte (TTFB)
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const navEntry = entry as PerformanceNavigationTiming;
          if (navEntry.entryType === "navigation") {
            const ttfb = navEntry.responseStart - navEntry.requestStart;
            reportWebVitals({
              name: "TTFB",
              value: ttfb,
              id: "ttfb",
            });
          }
        });
      });
      navigationObserver.observe({ entryTypes: ["navigation"] });
    } catch (error) {
      // Silently fail if PerformanceObserver is not supported
      if (process.env.NODE_ENV === "development") {
        console.error("Performance monitoring error:", error);
      }
    }
  }
}

/**
 * Measures resource loading performance
 * Logs warnings for slow resources in development
 */
export function measureResourceTiming(): void {
  if (typeof window === "undefined" || !("performance" in window)) return;

  const resources = performance.getEntriesByType(
    "resource"
  ) as PerformanceResourceTiming[];

  resources.forEach((resource) => {
    const duration = resource.responseEnd - resource.startTime;

    // Log slow resources in development
    if (
      process.env.NODE_ENV === "development" &&
      duration > PERFORMANCE_THRESHOLDS.SLOW_RESOURCE_MS
    ) {
      console.warn(
        `Slow resource: ${resource.name} took ${duration.toFixed(2)}ms`
      );
    }
  });
}

/**
 * Initializes performance monitoring
 * Sets up observers for Core Web Vitals and resource timing
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === "undefined") return;

  // Measure performance after page load
  if (document.readyState === "complete") {
    measurePerformance();
    measureResourceTiming();
  } else {
    window.addEventListener("load", () => {
      measurePerformance();
      measureResourceTiming();
    });
  }
}
