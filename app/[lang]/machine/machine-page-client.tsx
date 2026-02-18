"use client";

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
      music: {
        now_playing: string;
        recently_played: string;
        played: string;
        open_track: string;
        unknown_duration: string;
      };
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

  const fullContent = contentBefore + recentlyPlayedSection + contentAfter;

  return (
    <div className="min-h-screen bg-background text-foreground font-mono antialiased">
      <div className="flex items-center justify-center min-h-screen p-6 sm:p-8">
        <div className="max-w-[680px] w-full">
          <MachineContentDisplay
            contentBefore={contentBefore}
            contentAfter={contentAfter}
            recentlyPlayedTemplate={recentlyPlayedTemplate}
          />
          <div className="h-36 sm:h-20" />
        </div>
      </div>

      {/* Copy button fixed top center */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <CopyButton content={fullContent} dict={dict.copy_button} />
      </div>

      <StatusBar lang={lang} mode="machine" dict={dict.view_toggle} />
    </div>
  );
}
