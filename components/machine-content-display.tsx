"use client";

import { useMemo, useState } from "react";
import { useRecentlyPlayedSection } from "./machine-recently-played";

interface MachineContentDisplayProps {
  contentBefore: string;
  contentAfter: string;
  recentlyPlayedTemplate?: string;
}

/**
 * Skeleton loader for the recently played section
 * Matches the approximate dimensions of the expected text to prevent CLS
 */
function RecentlyPlayedSkeleton() {
  return (
    <>
      My most recently played song on{" "}
      <span className="skeleton inline-block h-[1em] w-[8ch] align-middle">{" ".repeat(8)}</span> is
      &quot;
      <span className="skeleton inline-block h-[1em] w-[10ch] align-middle">{" ".repeat(10)}</span>
      &quot; by{" "}
      <span className="skeleton inline-block h-[1em] w-[14ch] align-middle">{" ".repeat(14)}</span>{" "}
      (played{" "}
      <span className="skeleton inline-block h-[1em] w-[6ch] align-middle">{" ".repeat(6)}</span>
      ).
      {"\n\n"}
      Listen:{" "}
      <span className="skeleton inline-block h-[1em] w-[45ch] align-middle">{" ".repeat(45)}</span>
      {"\n"}
    </>
  );
}

/**
 * Client Component that composes static and dynamic content
 * Only the minimal dynamic part is computed client-side
 * Static content is pre-generated on the server
 */
export function MachineContentDisplay({
  contentBefore,
  contentAfter,
  recentlyPlayedTemplate,
}: MachineContentDisplayProps) {
  const [mounted] = useState(() => {
    // Lazy initialization ensures this only runs on client side
    return true;
  });
  const { content: recentlyPlayedSection, isLoading } =
    useRecentlyPlayedSection(recentlyPlayedTemplate);

  const content = useMemo(() => {
    // Only include dynamic section after mount to avoid hydration mismatch
    if (!mounted) {
      return contentBefore + contentAfter;
    }

    if (isLoading) {
      return null; // Will be handled in JSX below
    }

    return contentBefore + recentlyPlayedSection + contentAfter;
  }, [contentBefore, contentAfter, recentlyPlayedSection, mounted, isLoading]);

  return (
    <pre className="font-mono text-[13px] text-muted-foreground whitespace-pre-wrap leading-relaxed font-normal">
      {isLoading && mounted ? (
        <>
          {contentBefore}
          <RecentlyPlayedSkeleton />
          {contentAfter}
        </>
      ) : (
        content
      )}
    </pre>
  );
}
