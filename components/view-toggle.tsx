"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export function ViewToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const isHuman = pathname === "/human" || pathname === "/";
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Aggressively prefetch both routes immediately
    const prefetchRoutes = () => {
      router.prefetch("/human");
      router.prefetch("/robot");
    };

    // Prefetch immediately
    prefetchRoutes();

    // Keep prefetching periodically to ensure they stay cached
    const interval = setInterval(prefetchRoutes, 2000);

    // Also prefetch on visibility change (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        prefetchRoutes();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

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

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 bg-background/95 dark:bg-background/95 backdrop-blur-md border border-border/50 rounded-lg px-4 py-2.5 shadow-lg">
        <Link
          href="/human"
          onClick={(e) => handleToggle(e, "/human")}
          prefetch={true}
          onMouseEnter={() => router.prefetch("/human")}
          className={`
            flex items-center gap-2 text-xs font-medium font-mono transition-all duration-10 ease-out
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
              w-3 h-3 rounded-full border-2 transition-all duration-10 ease-out
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
          href="/robot"
          onClick={(e) => handleToggle(e, "/robot")}
          prefetch={true}
          onMouseEnter={() => router.prefetch("/robot")}
          className={`
            flex items-center gap-2 text-xs font-medium font-mono transition-all duration-10 ease-out
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
              w-3 h-3 rounded-full border-2 transition-all duration-10 ease-out
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
