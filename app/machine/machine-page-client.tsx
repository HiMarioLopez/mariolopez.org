"use client";

import { ViewToggle } from "@/components/view-toggle";
import { CopyButton } from "@/components/copy-button";
import { MachineContentDisplay } from "@/components/machine-content-display";
import { useRecentlyPlayedSection } from "@/components/machine-recently-played";
import { useMemo } from "react";

interface MachinePageClientProps {
  contentBefore: string;
  contentAfter: string;
}

/**
 * Client Component wrapper for the machine page
 * Handles the copy button which needs access to the full content
 */
export function MachinePageClient({
  contentBefore,
  contentAfter,
}: MachinePageClientProps) {
  const { content: recentlyPlayedSection } = useRecentlyPlayedSection();

  // Compute full content for the copy button
  const fullContent = useMemo(() => {
    return contentBefore + recentlyPlayedSection + contentAfter;
  }, [contentBefore, recentlyPlayedSection, contentAfter]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ViewToggle />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <CopyButton content={fullContent} />
      </div>
      <div className="flex items-center justify-center min-h-screen p-8 pt-24">
        <div className="max-w-3xl w-full animate-in fade-in slide-in-from-bottom-4 duration-20">
          <MachineContentDisplay
            contentBefore={contentBefore}
            contentAfter={contentAfter}
          />
        </div>
      </div>
    </div>
  );
}
