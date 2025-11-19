"use client";

import { useRecentlyPlayedSection } from "./machine-recently-played";
import { useMemo } from "react";

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
  const recentlyPlayedSection = useRecentlyPlayedSection();

  const plainTextContent = useMemo(() => {
    return contentBefore + recentlyPlayedSection + contentAfter;
  }, [contentBefore, recentlyPlayedSection, contentAfter]);

  return (
    <pre className="font-mono text-sm text-foreground whitespace-pre-wrap leading-relaxed">
      {plainTextContent}
    </pre>
  );
}
