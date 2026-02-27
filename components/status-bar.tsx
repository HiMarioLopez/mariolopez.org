"use client";

import { useState } from "react";

import { StatusBarLeftControls } from "@/components/status-bar-left-controls";
import { StatusBarMusicStrip } from "@/components/status-bar-music-strip";
import { StatusBarRightControls } from "@/components/status-bar-right-controls";
import { useAvailabilityStatus } from "@/lib/hooks/use-availability-status";
import { useBufferedRecentlyPlayed } from "@/lib/hooks/use-buffered-recently-played";
import { useRecentlyPlayed } from "@/lib/hooks/use-recently-played";
import { useVisitorCount } from "@/lib/hooks/use-visitor-count";
import { getPlatformColor } from "@/lib/utils";

interface StatusBarProps {
  lang: string;
  mode: "human" | "machine";
  dict: {
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
      now_playing_on: string;
      last_played_on: string;
      open_track: string;
      unknown_duration: string;
    };
  };
}

type StatusBarLocale = "en-US" | "es-MX";

function resolveLocale(lang: string): StatusBarLocale {
  return lang === "es-MX" ? "es-MX" : "en-US";
}

export type StatusBarFlyoutId = "availability" | "theme" | "language" | null;

export function StatusBar({ lang, mode, dict }: StatusBarProps) {
  const locale = resolveLocale(lang);
  const [openFlyout, setOpenFlyout] = useState<StatusBarFlyoutId>(null);
  const availabilityStatus = useAvailabilityStatus();
  const { data: recentlyPlayedFromQuery, isPending: isRecentlyPlayedPending } = useRecentlyPlayed();
  const { recentlyPlayed, playbackSnapshot } = useBufferedRecentlyPlayed(recentlyPlayedFromQuery);
  const { data: visitorCount } = useVisitorCount();
  const resolvedVisitorCount = typeof visitorCount === "number" ? visitorCount : null;
  const shouldShowMusicPlayer = mode === "human";
  const platformColor = recentlyPlayed?.platform ? getPlatformColor(recentlyPlayed.platform) : null;
  const musicNowPlayingOn =
    dict.music?.now_playing_on ?? (locale === "es-MX" ? "Sonando en" : "Now Playing on");
  const musicLastPlayedOn =
    dict.music?.last_played_on ??
    (locale === "es-MX" ? "Ultima reproduccion en" : "Last played on");
  const musicOpenTrack =
    dict.music?.open_track ?? (locale === "es-MX" ? "Abrir cancion" : "Open track");
  const musicUnknownDuration =
    dict.music?.unknown_duration ?? (locale === "es-MX" ? "ventana estimada" : "estimated window");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-5 sm:px-6 pb-5 sm:pb-3 pt-6 pointer-events-none bg-gradient-to-t from-background via-background/80 to-transparent">
      <div className="max-w-[680px] mx-auto">
        <div className="bg-card border border-border rounded-lg pointer-events-auto overflow-hidden">
          <StatusBarMusicStrip
            shouldShowMusicPlayer={shouldShowMusicPlayer}
            isPending={isRecentlyPlayedPending && !recentlyPlayed}
            recentlyPlayed={recentlyPlayed}
            playbackSnapshot={playbackSnapshot}
            platformColor={platformColor}
            locale={locale}
            nowPlayingOnLabel={musicNowPlayingOn}
            lastPlayedOnLabel={musicLastPlayedOn}
            openTrackLabel={musicOpenTrack}
            unknownDurationLabel={musicUnknownDuration}
          />

          <div className="px-3 sm:px-4 py-2 flex items-center justify-between text-[10px] font-mono text-text-tertiary">
            <StatusBarLeftControls
              lang={lang}
              mode={mode}
              locale={locale}
              availabilityStatus={availabilityStatus}
              visitorCount={resolvedVisitorCount}
              humanLabel={dict.human}
              machineLabel={dict.machine}
              ariaSwitchHuman={dict.aria_switch_human}
              ariaSwitchMachine={dict.aria_switch_machine}
              openFlyout={openFlyout}
              setOpenFlyout={setOpenFlyout}
            />
            <StatusBarRightControls
              lang={lang}
              autoLabel={dict.auto}
              lightLabel={dict.light}
              darkLabel={dict.dark}
              ariaToggleTheme={dict.aria_toggle_theme}
              languageLabel={dict.language}
              ariaToggleLanguage={dict.aria_toggle_language}
              openFlyout={openFlyout}
              setOpenFlyout={setOpenFlyout}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
