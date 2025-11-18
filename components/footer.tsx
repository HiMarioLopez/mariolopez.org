"use client";

import { useState, useEffect } from "react";
import { BUILD_CONFIG } from "@/lib/config";
import { LINKS } from "@/lib/constants";

export function Footer() {
  const [buildTimestamp, setBuildTimestamp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Format date only on client side to avoid hydration mismatch
    const buildTime = BUILD_CONFIG.BUILD_TIME;
    if (buildTime) {
      const formatted = new Date(buildTime).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      });
      setBuildTimestamp(formatted);
    }
    setIsLoading(false);
  }, []);

  return (
    <footer className="relative mt-auto py-6 md:mt-0 md:absolute md:bottom-0 md:left-0 md:right-0 md:py-8 text-muted-foreground text-sm z-10 text-center w-full">
      <div>
        © 2025, Mario Lopez Martinez.{" "}
        <a
          href={LINKS.SITE_SOURCE}
          target="_blank"
          rel="noopener noreferrer"
          className="link-accent"
        >
          Source
        </a>
        .
      </div>
      {(isLoading || buildTimestamp) && (
        <div className="mt-2">
          <span className="text-muted-foreground/80">
            {isLoading ? (
              <>
                Last updated{" "}
                <span className="skeleton inline-block h-[1.2em] w-57 align-middle rounded">
                  January 15, 2025, 3:45 PM PST
                </span>
                .
              </>
            ) : (
              `Last updated ${buildTimestamp}.`
            )}
          </span>
        </div>
      )}
    </footer>
  );
}
