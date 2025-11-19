import Script from "next/script";
import { RESOURCE_HINTS } from "@/lib/constants";

/**
 * Optimized resource hints using native link tags injected via Script.
 * Uses beforeInteractive strategy to ensure hints are added before page load.
 * More efficient than previous implementation - uses direct DOM element creation
 * without JSON parsing or DOMParser overhead.
 */
export function ResourceHints() {
  // Pre-serialize hints for efficient injection
  const hintsData = RESOURCE_HINTS.map((hint) => {
    const base = {
      rel: hint.rel,
      href: hint.href,
    };
    if ("crossOrigin" in hint && hint.crossOrigin) {
      return { ...base, crossOrigin: hint.crossOrigin };
    }
    return base;
  });

  return (
    <Script
      id="resource-hints"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const hints = ${JSON.stringify(hintsData)};
            hints.forEach(function(hint) {
              var existing = document.querySelector('link[rel="' + hint.rel + '"][href="' + hint.href + '"]');
              if (!existing) {
                var link = document.createElement('link');
                link.rel = hint.rel;
                link.href = hint.href;
                if (hint.crossOrigin) {
                  link.crossOrigin = hint.crossOrigin;
                }
                document.head.appendChild(link);
              }
            });
          })();
        `,
      }}
    />
  );
}
