"use client";

import { Button } from "@/components/ui/button";
import { LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BlogLink({ className }: { className?: string }) {
  return (
    <Button variant="social" size="lg" className={cn("w-full sm:w-auto px-3 sm:px-6", className)} asChild>
      <a
        href={LINKS.BLOG}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 group"
      >
        <span className="text-base inline-flex items-center leading-none icon-grayscale-hover shrink-0">
          🍝
        </span>
        <span className="truncate">
          <span className="underline decoration-dotted decoration-2 underline-offset-3 transition-colors text-rose-400 decoration-rose-400 sm:text-inherit sm:decoration-foreground/30 sm:group-hover:text-rose-400 sm:group-hover:decoration-rose-400">
            B
          </span>
          o
          <span className="underline decoration-dotted decoration-2 underline-offset-3 transition-colors text-rose-400 decoration-rose-400 sm:text-inherit sm:decoration-foreground/30 sm:group-hover:text-rose-400 sm:group-hover:decoration-rose-400">
            log
          </span>
          nese
        </span>
      </a>
    </Button>
  );
}
