"use client";

import { StatusBarLeftControls } from "@/components/status-bar-left-controls";
import { StatusBarMusicStrip } from "@/components/status-bar-music-strip";
import { StatusBarRightControls } from "@/components/status-bar-right-controls";
import { useAvailabilityStatus } from "@/lib/hooks/use-availability-status";
import { usePlaybackSnapshot } from "@/lib/hooks/use-playback-snapshot";
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
      now_playing: string;
      recently_played: string;
      played: string;
      open_track: string;
      unknown_duration: string;
    };
  };
}

type StatusBarLocale = "en-US" | "es-MX";

function resolveLocale(lang: string): StatusBarLocale {
  return lang === "es-MX" ? "es-MX" : "en-US";
}

export function StatusBar({ lang, mode, dict }: StatusBarProps) {
  const locale = resolveLocale(lang);
  const availabilityStatus = useAvailabilityStatus();
  const { data: recentlyPlayed, isPending: isRecentlyPlayedPending } = useRecentlyPlayed();
  const { data: visitorCount } = useVisitorCount();
  const playbackSnapshot = usePlaybackSnapshot({
    timestamp: recentlyPlayed?.timestamp,
    durationMs: recentlyPlayed?.durationMs,
  });
  const resolvedVisitorCount = typeof visitorCount === "number" ? visitorCount : null;
  const shouldShowMusicPlayer = mode === "human";
  const platformColor = recentlyPlayed?.platform ? getPlatformColor(recentlyPlayed.platform) : null;
  const musicNowPlaying =
    dict.music?.now_playing ?? (locale === "es-MX" ? "Sonando ahora" : "Now Playing");
  const musicRecentlyPlayed =
    dict.music?.recently_played ??
    (locale === "es-MX" ? "Reproducida recientemente" : "Recently Played");
  const musicPlayed = dict.music?.played ?? (locale === "es-MX" ? "reproducida" : "played");
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
            isPending={isRecentlyPlayedPending}
            recentlyPlayed={recentlyPlayed}
            playbackSnapshot={playbackSnapshot}
            platformColor={platformColor}
            locale={locale}
            nowPlayingLabel={musicNowPlaying}
            recentlyPlayedLabel={musicRecentlyPlayed}
            playedLabel={musicPlayed}
            openTrackLabel={musicOpenTrack}
            unknownDurationLabel={musicUnknownDuration}
          />

          <div className="px-3 sm:px-4 py-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground/60">
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
            />
            <StatusBarRightControls
              lang={lang}
              autoLabel={dict.auto}
              lightLabel={dict.light}
              darkLabel={dict.dark}
              ariaToggleTheme={dict.aria_toggle_theme}
              languageLabel={dict.language}
              ariaToggleLanguage={dict.aria_toggle_language}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
