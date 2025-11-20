"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ChaosRecipeLink({ className }: { className?: string }) {
  return (
    <Button 
      variant="social" 
      size="lg" 
      className={cn("w-full sm:w-auto px-3 sm:px-6", className)} 
      asChild
    >
      <a
        href={LINKS.CHAOS_RECIPE_ENHANCER}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 group"
      >
        <Image
          src="/images/CRELogo.png"
          alt="Chaos Recipe Enhancer logo"
          width={32}
          height={32}
          className="h-5 w-auto rounded-sm icon-grayscale-hover shrink-0"
          quality={90}
        />
        <span className="truncate">Chaos Recipe Enhancer</span>
      </a>
    </Button>
  );
}
