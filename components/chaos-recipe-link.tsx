"use client";

import { Button } from "@/components/ui/button";
import { LINKS } from "@/lib/constants";

export function ChaosRecipeLink() {
  return (
    <Button variant="social" size="lg" asChild>
      <a
        href={LINKS.CHAOS_RECIPE_ENHANCER}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 group"
      >
        <picture className="flex items-center justify-center">
          <source srcSet="/images/CRELogo.webp" type="image/webp" />
          <img
            src="/images/CRELogo.png"
            alt="Chaos Recipe Enhancer logo"
            width={32}
            height={32}
            loading="lazy"
            decoding="async"
            className="h-5 w-auto rounded-sm grayscale transition-all duration-200 group-hover:grayscale-0"
          />
        </picture>
        <span>Chaos Recipe Enhancer</span>
      </a>
    </Button>
  );
}
