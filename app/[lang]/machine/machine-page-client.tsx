"use client";

import { useMemo } from "react";
import { CopyButton } from "@/components/copy-button";
import { MachineContentDisplay } from "@/components/machine-content-display";
import { useRecentlyPlayedSection } from "@/components/machine-recently-played";
import { ViewToggle } from "@/components/view-toggle";

interface MachinePageClientProps {
  contentBefore: string;
  contentAfter: string;
  lang: "en-US" | "es-MX";
  recentlyPlayedTemplate: string;
  dict: {
    view_toggle: {
      human: string;
      machine: string;
      auto: string;
      light: string;
      dark: string;
      aria_switch_human: string;
      aria_switch_machine: string;
      aria_toggle_theme: string;
      language: string;
      aria_toggle_language: string;
    };
    copy_button: {
      label: string;
      copied: string;
      aria_label: string;
    };
  };
}

/**
 * Client Component wrapper for the machine page
 * Handles the copy button which needs access to the full content
 */
export function MachinePageClient({
  contentBefore,
  contentAfter,
  lang,
  recentlyPlayedTemplate,
  dict,
}: MachinePageClientProps) {
  const { content: recentlyPlayedSection } = useRecentlyPlayedSection(recentlyPlayedTemplate);

  // Compute full content for the copy button
  const fullContent = useMemo(() => {
    return contentBefore + recentlyPlayedSection + contentAfter;
  }, [contentBefore, recentlyPlayedSection, contentAfter]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ViewToggle dict={dict.view_toggle} lang={lang} />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <CopyButton content={fullContent} dict={dict.copy_button} />
      </div>
      <div className="flex items-center justify-center min-h-screen p-8 pt-24">
        <div className="max-w-3xl w-full">
          <MachineContentDisplay
            contentBefore={contentBefore}
            contentAfter={contentAfter}
            recentlyPlayedTemplate={recentlyPlayedTemplate}
          />
        </div>
      </div>
    </div>
  );
}
