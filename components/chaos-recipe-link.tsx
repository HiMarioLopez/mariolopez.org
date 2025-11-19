"use client";

import Image from "next/image";
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
        <Image
          src="/images/CRELogo.png"
          alt="Chaos Recipe Enhancer logo"
          width={32}
          height={32}
          className="h-5 w-auto rounded-sm grayscale transition-all duration-200 group-hover:grayscale-0"
          quality={90}
        />
        <span>Chaos Recipe Enhancer</span>
      </a>
    </Button>
  );
}
