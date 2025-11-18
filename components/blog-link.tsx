"use client";

import { Button } from "@/components/ui/button";
import { LINKS } from "@/lib/constants";

export function BlogLink() {
  return (
    <Button variant="social" size="lg" asChild>
      <a
        href={LINKS.BLOG}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 group"
      >
        <span className="text-base inline-flex items-center leading-none">
          🍝
        </span>
        <span>
          <span className="underline decoration-dotted decoration-2 underline-offset-3 decoration-foreground/30 group-hover:text-rose-400 group-hover:decoration-rose-400 dark:group-hover:text-rose-300 dark:group-hover:decoration-rose-300 transition-colors">
            B
          </span>
          o
          <span className="underline decoration-dotted decoration-2 underline-offset-3 decoration-foreground/30 group-hover:text-rose-400 group-hover:decoration-rose-400 dark:group-hover:text-rose-300 dark:group-hover:decoration-rose-300 transition-colors">
            log
          </span>
          nese
        </span>
      </a>
    </Button>
  );
}
