"use client";

import { useMemo } from "react";
import { CopyButton } from "@/components/copy-button";
import { MachineContentDisplay } from "@/components/machine-content-display";
import { useRecentlyPlayedSection } from "@/components/machine-recently-played";
import { StatusBar } from "@/components/status-bar";

interface MachinePageClientProps {
  contentBefore: string;
  contentAfter: string;
  lang: "en-US" | "es-MX";
  recentlyPlayedTemplate: string;
  dict: {
    copy_button: {
      label: string;
      copied: string;
      aria_label: string;
    };
  };
}

export function MachinePageClient({
  contentBefore,
  contentAfter,
  lang,
  recentlyPlayedTemplate,
  dict,
}: MachinePageClientProps) {
  const { content: recentlyPlayedSection } = useRecentlyPlayedSection(recentlyPlayedTemplate);

  const fullContent = useMemo(() => {
    return contentBefore + recentlyPlayedSection + contentAfter;
  }, [contentBefore, recentlyPlayedSection, contentAfter]);

  return (
    <div className="min-h-screen bg-background text-foreground font-mono antialiased">
      <div className="flex items-center justify-center min-h-screen p-6 sm:p-8">
        <div className="max-w-3xl w-full">
          <MachineContentDisplay
            contentBefore={contentBefore}
            contentAfter={contentAfter}
            recentlyPlayedTemplate={recentlyPlayedTemplate}
          />
          <div className="h-20" />
        </div>
      </div>

      {/* Copy button fixed top center */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <CopyButton content={fullContent} dict={dict.copy_button} />
      </div>

      <StatusBar lang={lang} mode="machine" />
    </div>
  );
}
