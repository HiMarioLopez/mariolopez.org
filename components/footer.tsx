"use client";

import { useState, useEffect } from "react";

export function Footer() {
  const [buildTimestamp, setBuildTimestamp] = useState<string>("");

  useEffect(() => {
    // Only set timestamp on client to avoid hydration mismatch
    const timestamp = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
    setBuildTimestamp(timestamp);
  }, []);

  return (
    <footer className="relative mt-8 py-6 md:mt-0 md:absolute md:bottom-0 md:left-0 md:right-0 md:py-8 text-muted-foreground text-sm z-10 text-center w-full">
      <div>
        © 2025, Mario Lopez Martinez.{" "}
        <a
          href="https://github.com/HiMarioLopez"
          target="_blank"
          rel="noopener noreferrer"
          className="link-accent"
        >
          Source
        </a>
        .
      </div>
      <div className="mt-2">
        <span className="text-muted-foreground/80">
          {buildTimestamp ? `Last updated ${buildTimestamp}.` : "Last updated."}
        </span>
      </div>
    </footer>
  );
}
