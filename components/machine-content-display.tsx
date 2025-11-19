"use client";

import { useRecentlyPlayedSection } from "./machine-recently-played";
import { useState, useMemo } from "react";

interface MachineContentDisplayProps {
  contentBefore: string;
  contentAfter: string;
}

/**
 * Client Component that composes static and dynamic content
 * Only the minimal dynamic part is computed client-side
 * Static content is pre-generated on the server
 */
export function MachineContentDisplay({
  contentBefore,
  contentAfter,
}: MachineContentDisplayProps) {
  const [mounted] = useState(() => {
    // Lazy initialization ensures this only runs on client side
    return true;
  });
  const recentlyPlayedSection = useRecentlyPlayedSection();

  const plainTextContent = useMemo(() => {
    // Only include dynamic section after mount to avoid hydration mismatch
    return (
      contentBefore + (mounted ? recentlyPlayedSection : "") + contentAfter
    );
  }, [contentBefore, contentAfter, recentlyPlayedSection, mounted]);

  return (
    <pre className="font-mono text-sm text-foreground whitespace-pre-wrap leading-relaxed">
      {plainTextContent}
    </pre>
  );
}
