import Script from "next/script";
import { RESOURCE_HINTS } from "@/lib/constants";

export function ResourceHints() {
  return (
    <>
      {/* Inject resource hints early for performance */}
      <Script
        id="resource-hints"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const hints = ${JSON.stringify(RESOURCE_HINTS)};
              
              hints.forEach(function(hint) {
                var link = document.createElement('link');
                Object.keys(hint).forEach(function(key) {
                  if (key === 'crossOrigin') {
                    link.crossOrigin = hint[key];
                  } else {
                    link.setAttribute(key, hint[key]);
                  }
                });
                
                var existing = document.querySelector('link[rel="' + hint.rel + '"][href="' + hint.href + '"]');
                if (!existing) {
                  document.head.appendChild(link);
                }
              });
            })();
          `,
        }}
      />
    </>
  );
}
