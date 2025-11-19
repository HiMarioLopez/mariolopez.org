"use client";

import { useState, useEffect } from "react";
import { BUILD_CONFIG } from "@/lib/config";
import { LINKS, LOCALE_CONFIG } from "@/lib/constants";

export function Footer() {
  // Format date only on client side to avoid hydration mismatch
  // Using useState/useEffect to ensure it only runs after hydration
  const [buildTimestamp, setBuildTimestamp] = useState<string | null>(null);

  useEffect(() => {
    const buildTime = BUILD_CONFIG.BUILD_TIME;
    if (!buildTime) return;
    setBuildTimestamp(
      new Date(buildTime).toLocaleString(LOCALE_CONFIG.DEFAULT, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      })
    );
  }, []);

  return (
    <footer className="relative mt-auto py-6 md:py-8 text-muted-foreground text-sm z-10 text-center w-full">
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
      {buildTimestamp && (
        <div className="mt-2">
          <span className="text-muted-foreground/80">
            Last updated {buildTimestamp}.
          </span>
        </div>
      )}
    </footer>
  );
}
