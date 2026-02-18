"use client";

import { AudioLines, Globe, Monitor, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AVAILABILITY_DISPLAY,
  AVAILABILITY_STATUSES,
  LINKS,
  NOW_PLAYING_CONFIG,
  TIME_CONSTANTS,
  VISITOR_COUNTER_CONFIG,
} from "@/lib/constants";
import { useAvailabilityStatus } from "@/lib/hooks/use-availability-status";
import { useRecentlyPlayed } from "@/lib/hooks/use-recently-played";
import { formatTimeAgo, getPlatformColor } from "@/lib/utils";

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

function formatDurationMs(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / TIME_CONSTANTS.SECONDS_PER_MINUTE);
  const seconds = totalSeconds % TIME_CONSTANTS.SECONDS_PER_MINUTE;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function StatusBar({ lang, mode, dict }: StatusBarProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const availabilityStatus = useAvailabilityStatus();
  const { data: recentlyPlayed, isPending: isRecentlyPlayedPending } = useRecentlyPlayed();
  const display = AVAILABILITY_DISPLAY[availabilityStatus];
  const locale = lang === "es-MX" ? "es-MX" : "en-US";
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
  const shouldShowMusicPlayer = mode === "human";
  const platformColor = recentlyPlayed?.platform ? getPlatformColor(recentlyPlayed.platform) : null;

  const playbackSnapshot = useMemo(() => {
    if (!recentlyPlayed?.timestamp) {
      return null;
    }

    const startedAtMs = new Date(recentlyPlayed.timestamp).getTime();
    if (!Number.isFinite(startedAtMs)) {
      return null;
    }

    const elapsedMs = nowMs - startedAtMs;
    const durationMs =
      typeof recentlyPlayed.durationMs === "number" && recentlyPlayed.durationMs > 0
        ? recentlyPlayed.durationMs
        : null;

    const activeWindowMs = Math.max(
      NOW_PLAYING_CONFIG.RECENT_PLAY_WINDOW_MS,
      (durationMs ?? 0) + NOW_PLAYING_CONFIG.INGESTION_BUFFER_MS,
    );

    const isLikelyNowPlaying =
      elapsedMs >= -NOW_PLAYING_CONFIG.FUTURE_TIMESTAMP_TOLERANCE_MS && elapsedMs <= activeWindowMs;

    const safeElapsedMs = Math.max(0, elapsedMs);
    const displayElapsedMs = durationMs ? Math.min(safeElapsedMs, durationMs) : safeElapsedMs;
    const progressDenominator = durationMs ?? NOW_PLAYING_CONFIG.RECENT_PLAY_WINDOW_MS;
    const progressRatio = Math.min(Math.max(safeElapsedMs / progressDenominator, 0), 1);

    return {
      durationMs,
      displayElapsedMs,
      elapsedMs: safeElapsedMs,
      isLikelyNowPlaying,
      progressPercent: progressRatio * 100,
    };
  }, [recentlyPlayed?.timestamp, recentlyPlayed?.durationMs, nowMs]);

  const playedAgo = useMemo(() => {
    if (!playbackSnapshot || !recentlyPlayed?.timestamp) {
      return "";
    }

    return formatTimeAgo(recentlyPlayed.timestamp, locale);
  }, [playbackSnapshot, recentlyPlayed?.timestamp, locale]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, NOW_PLAYING_CONFIG.UPDATE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      try {
        const res = await fetch("/api/visitor-count");
        if (!cancelled && res.ok) {
          const data = await res.json();
          setVisitorCount(data.count);
        }
      } catch {
        // Silently fail - visitor count is non-critical
      }
    }

    fetchCount();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-5 sm:px-6 pb-3 pt-6 pointer-events-none bg-gradient-to-t from-background via-background/80 to-transparent">
      <div className="max-w-[680px] mx-auto">
        <div className="bg-card border border-border rounded-lg pointer-events-auto overflow-hidden">
          {shouldShowMusicPlayer && (isRecentlyPlayedPending || (recentlyPlayed && playbackSnapshot)) && (
            <div className="border-b border-border/80 px-3 sm:px-4 py-2.5">
              {isRecentlyPlayedPending ? (
                <div className="flex items-center gap-2.5">
                  <span className="skeleton h-6 w-6 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="skeleton block h-2.5 w-28 rounded" />
                    <span className="skeleton block h-3 w-48 max-w-full rounded" />
                  </div>
                </div>
              ) : recentlyPlayed && playbackSnapshot ? (
                <a
                  href={recentlyPlayed.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${musicOpenTrack}: ${recentlyPlayed.song} — ${recentlyPlayed.artist}`}
                  className="-mx-3 sm:-mx-4 -my-2.5 block px-3 sm:px-4 py-2.5 hover:bg-accent/35 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                        playbackSnapshot.isLikelyNowPlaying
                          ? "border-transparent bg-background/70"
                          : "border-border bg-background text-muted-foreground/60"
                      }`}
                      style={
                        playbackSnapshot.isLikelyNowPlaying
                          ? {
                              borderColor: `${platformColor ?? "#34d399"}66`,
                              boxShadow: `0 0 0 1px ${platformColor ?? "#34d399"}26 inset, 0 0 14px ${platformColor ?? "#34d399"}55`,
                            }
                          : undefined
                      }
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          playbackSnapshot.isLikelyNowPlaying
                            ? "animate-pulse"
                            : "bg-muted-foreground/40"
                        }`}
                        style={
                          playbackSnapshot.isLikelyNowPlaying
                            ? {
                                backgroundColor: platformColor ?? "#34d399",
                                boxShadow: `0 0 12px ${platformColor ?? "#34d399"}cc`,
                              }
                            : undefined
                        }
                      />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10px] leading-none">
                        <span
                          className={`tracking-[0.13em] uppercase ${
                            playbackSnapshot.isLikelyNowPlaying
                              ? "text-foreground/90"
                              : "text-muted-foreground/60"
                          }`}
                          style={
                            playbackSnapshot.isLikelyNowPlaying
                              ? {
                                  color: platformColor ?? "#34d399",
                                  textShadow: `0 0 10px ${platformColor ?? "#34d399"}66`,
                                }
                              : undefined
                          }
                        >
                          {playbackSnapshot.isLikelyNowPlaying
                            ? musicNowPlaying
                            : musicRecentlyPlayed}
                        </span>
                        <span className="text-border">/</span>
                        <span className="text-muted-foreground/60">{recentlyPlayed.platform}</span>
                        {playbackSnapshot.isLikelyNowPlaying && (
                          <AudioLines
                            size={10}
                            className="animate-pulse"
                            style={{ color: platformColor ?? "#34d399" }}
                          />
                        )}
                      </div>

                      <p className="mt-1 text-[11px] text-foreground/90 truncate">
                        {recentlyPlayed.song} — {recentlyPlayed.artist}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground/55">
                        <span className="truncate">
                          {musicPlayed} {playedAgo}
                        </span>
                        <span className="text-border">·</span>
                        <span className="tabular-nums whitespace-nowrap">
                          {formatDurationMs(playbackSnapshot.displayElapsedMs)} /{" "}
                          {playbackSnapshot.durationMs
                            ? formatDurationMs(playbackSnapshot.durationMs)
                            : musicUnknownDuration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 h-[3px] w-full rounded-full bg-border/70 overflow-hidden">
                    <span
                      className={`block h-full rounded-full transition-[width] duration-1000 ease-linear ${
                        playbackSnapshot.isLikelyNowPlaying
                          ? "bg-emerald-500/90"
                          : "bg-muted-foreground/50"
                      }`}
                      style={{
                        width: `${playbackSnapshot.progressPercent}%`,
                        ...(playbackSnapshot.isLikelyNowPlaying && platformColor
                          ? { backgroundColor: platformColor }
                          : {}),
                      }}
                    />
                  </div>
                </a>
              ) : null}
            </div>
          )}

          <div className="px-3 sm:px-4 py-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground/60">
            {/* Left side */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`${display.textClass} flex items-center gap-1.5 rounded-sm px-1 py-0.5 cursor-pointer transition-colors transition-opacity hover:bg-accent/40 hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border/70`}
                    aria-label={
                      locale === "es-MX"
                        ? "Ver horarios de disponibilidad"
                        : "View availability schedule"
                    }
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${display.dotClass}${display.pulse ? " animate-pulse" : ""}`}
                    />
                    <span className="hidden sm:inline">
                      {display.label[locale].toLocaleLowerCase(locale)}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="start"
                  sideOffset={8}
                  className="w-[220px] p-0 font-mono"
                >
                  <div className="px-3 pt-2.5 pb-1.5 border-b border-border">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
                      {locale === "es-MX" ? "Disponibilidad" : "Availability"}
                    </span>
                  </div>
                  <div className="px-3 py-2 space-y-2.5">
                    {AVAILABILITY_STATUSES.map((key) => {
                      const s = AVAILABILITY_DISPLAY[key];
                      const isActive = key === availabilityStatus;
                      return (
                        <div key={key} className="flex items-start gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full mt-[5px] shrink-0 ${s.dotClass}${s.pulse ? " animate-pulse" : ""}`}
                          />
                          <div className="min-w-0">
                            <div className={`text-[11px] font-medium leading-tight ${s.textClass}`}>
                              {s.label[locale]}
                              {isActive && (
                                <span className="ml-1.5 text-[9px] text-muted-foreground/50 font-normal">
                                  ←
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground/50 leading-snug mt-px">
                              {s.desc[locale]}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-3 pt-1 pb-2 border-t border-border">
                    <span className="text-[10px] text-muted-foreground/40">
                      {locale === "es-MX"
                        ? "Horarios en hora central (CT)"
                        : "All times Central US"}
                    </span>
                  </div>
                </PopoverContent>
              </Popover>

              <span className="hidden sm:inline text-muted-foreground/40">Houston, TX</span>

              {/* Visitor count */}
              <span className="w-px h-3 bg-border" />
              <span className="tabular-nums tracking-tight">
                {visitorCount !== null
                  ? visitorCount
                      .toString()
                      .padStart(
                        VISITOR_COUNTER_CONFIG.DIGIT_COUNT,
                        VISITOR_COUNTER_CONFIG.PADDING_CHAR,
                      )
                  : VISITOR_COUNTER_CONFIG.DEFAULT_DISPLAY}
                <span className="hidden sm:inline"> hits</span>
              </span>

              {/* View toggle */}
              <span className="w-px h-3 bg-border" />
              <div className="flex items-center gap-0 rounded border border-border overflow-hidden">
                {mode === "human" ? (
                  <span className="px-1.5 py-0.5 bg-foreground text-background text-[10px]">
                    {dict.human}
                  </span>
                ) : (
                  <Link
                    href={`/${lang}`}
                    aria-label={dict.aria_switch_human}
                    className="px-1.5 py-0.5 text-[10px] text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {dict.human}
                  </Link>
                )}
                {mode === "machine" ? (
                  <span className="px-1.5 py-0.5 bg-foreground text-background text-[10px]">
                    {dict.machine}
                  </span>
                ) : (
                  <Link
                    href={`/${lang}/machine`}
                    aria-label={dict.aria_switch_machine}
                    className="px-1.5 py-0.5 text-[10px] text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {dict.machine}
                  </Link>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Theme select */}
              {mounted && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-accent hover:text-foreground transition-colors"
                      aria-label={dict.aria_toggle_theme}
                    >
                      {theme === "light" ? (
                        <Sun size={12} />
                      ) : theme === "dark" ? (
                        <Moon size={12} />
                      ) : (
                        <Monitor size={12} />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="end"
                    className="min-w-[100px] font-mono text-[11px] text-muted-foreground"
                  >
                    <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                      <DropdownMenuRadioItem value="system">{dict.auto}</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="light">{dict.light}</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark">{dict.dark}</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <span className="w-px h-3 bg-border" />

              {/* Language select */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-accent hover:text-foreground transition-colors"
                    aria-label={dict.aria_toggle_language}
                    title={dict.language}
                  >
                    <Globe size={12} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="end"
                  className="min-w-[100px] font-mono text-[11px] text-muted-foreground"
                >
                  <DropdownMenuRadioGroup
                    value={lang}
                    onValueChange={(value) => {
                      const segments = pathname.split("/");
                      if (segments.length > 1) {
                        segments[1] = value;
                        router.push(segments.join("/"));
                      }
                    }}
                  >
                    <DropdownMenuRadioItem value="en-US">English</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="es-MX">Español</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <span className="w-px h-3 bg-border" />
              <span className="hidden sm:inline">&copy; 2026</span>
              <a
                href={LINKS.SITE_SOURCE}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                src
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
