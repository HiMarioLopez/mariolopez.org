import Script from "next/script";

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
              const hints = [
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
                { rel: 'preconnect', href: 'https://music.mariolopez.org' },
                { rel: 'dns-prefetch', href: 'https://vercel.com' },
                { rel: 'dns-prefetch', href: 'https://github.com' },
                { rel: 'dns-prefetch', href: 'https://www.linkedin.com' },
                { rel: 'preload', href: '/icon.svg', as: 'image', type: 'image/svg+xml' }
              ];
              
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

