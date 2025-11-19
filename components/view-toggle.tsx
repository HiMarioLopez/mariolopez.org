"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export function ViewToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const isHuman = pathname === "/human" || pathname === "/";
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleToggle = (e: React.MouseEvent, targetPath: string) => {
    if (isTransitioning || pathname === targetPath) {
      e.preventDefault();
      return;
    }

    // Navigate immediately - no delays
    router.push(targetPath);

    // Minimal transition state for visual feedback only
    setIsTransitioning(true);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 10);
  };

  return (
    <div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in duration-300 sm:top-6"
    >
      <div className="flex items-center gap-2 sm:gap-4 bg-background/95 dark:bg-background/95 backdrop-blur-md border border-border/50 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg">
        <Link
          href="/human"
          onClick={(e) => handleToggle(e, "/human")}
          prefetch={true}
          className={`
            flex items-center gap-1.5 sm:gap-2 text-xs font-medium font-mono transition-all duration-10 ease-out
            ${
              isHuman
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }
            ${isTransitioning ? "opacity-60" : "cursor-pointer"}
          `}
          aria-label="Switch to Human view"
        >
          <div
            className={`
              w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 transition-all duration-10 ease-out shrink-0
              ${
                isHuman
                  ? "border-foreground bg-foreground"
                  : "border-muted-foreground bg-transparent"
              }
            `}
          />
          HUMAN
        </Link>

        <Link
          href="/machine"
          onClick={(e) => handleToggle(e, "/machine")}
          prefetch={true}
          className={`
            flex items-center gap-1.5 sm:gap-2 text-xs font-medium font-mono transition-all duration-10 ease-out
            ${
              !isHuman
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }
            ${isTransitioning ? "opacity-60" : "cursor-pointer"}
          `}
          aria-label="Switch to Machine view"
        >
          <div
            className={`
              w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 transition-all duration-10 ease-out shrink-0
              ${
                !isHuman
                  ? "border-foreground bg-foreground"
                  : "border-muted-foreground bg-transparent"
              }
            `}
          />
          MACHINE
        </Link>
      </div>
    </div>
  );
}
