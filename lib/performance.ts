// Performance monitoring utilities

export function reportWebVitals(metric: any) {
  // Send to analytics endpoint or logging service
  if (process.env.NODE_ENV === 'production') {
    // You can send to your analytics service here
    // Example: sendToAnalytics(metric);
  }
  
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
}

export function measurePerformance() {
  if (typeof window === 'undefined') return;

  // Measure Core Web Vitals
  if ('PerformanceObserver' in window) {
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        reportWebVitals({
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          id: lastEntry.id,
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          reportWebVitals({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            id: entry.name,
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[];
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        reportWebVitals({
          name: 'CLS',
          value: clsValue,
          id: 'cls',
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === 'first-contentful-paint') {
            reportWebVitals({
              name: 'FCP',
              value: entry.startTime,
              id: entry.name,
            });
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Time to First Byte (TTFB)
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.entryType === 'navigation') {
            const ttfb = entry.responseStart - entry.requestStart;
            reportWebVitals({
              name: 'TTFB',
              value: ttfb,
              id: 'ttfb',
            });
          }
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      // Silently fail if PerformanceObserver is not supported
      console.error('Performance monitoring error:', error);
    }
  }
}

// Measure resource loading performance
export function measureResourceTiming() {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  resources.forEach((resource) => {
    const duration = resource.responseEnd - resource.startTime;
    
    // Log slow resources (>1s) in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`Slow resource: ${resource.name} took ${duration.toFixed(2)}ms`);
    }
  });
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Measure performance after page load
  if (document.readyState === 'complete') {
    measurePerformance();
    measureResourceTiming();
  } else {
    window.addEventListener('load', () => {
      measurePerformance();
      measureResourceTiming();
    });
  }
}

