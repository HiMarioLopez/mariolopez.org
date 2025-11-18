"use client";

import { LINKS } from "@/lib/constants";

export function Introduction() {
  return (
    <div className="space-y-4 px-6 sm:px-0">
      <p className="text-xl md:text-lg text-muted-foreground leading-relaxed font-light">
        I'm a{" "}
        <a
          href={LINKS.VERCEL_CAREERS}
          target="_blank"
          rel="noopener noreferrer"
          className="link-accent"
        >
          Platform Architect
        </a>
        , working with some brilliant folks at{" "}
        <a
          href={LINKS.VERCEL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-foreground/90 underline decoration-dotted decoration-foreground/70 hover:text-foreground hover:decoration-foreground transition-colors font-medium underline-offset-4"
        >
          ▲ Vercel
        </a>
        , solving the most challenging problems in the industry for our
        wonderful{" "}
        <a
          href={LINKS.VERCEL_CUSTOMERS}
          target="_blank"
          rel="noopener noreferrer"
          className="link-accent"
        >
          customers
        </a>
        .
      </p>
    </div>
  );
}
