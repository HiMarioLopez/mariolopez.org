import { AudioLines } from "lucide-react";
import { TIME_CONSTANTS } from "@/lib/constants";
import type { PlaybackSnapshot } from "@/lib/hooks/use-playback-snapshot";
import type { RecentlyPlayed } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";

type StatusBarLocale = "en-US" | "es-MX";

interface StatusBarMusicStripProps {
  shouldShowMusicPlayer: boolean;
  isPending: boolean;
  recentlyPlayed: RecentlyPlayed | null | undefined;
  playbackSnapshot: PlaybackSnapshot | null;
  platformColor: string | null;
  locale: StatusBarLocale;
  nowPlayingLabel: string;
  recentlyPlayedLabel: string;
  playedLabel: string;
  openTrackLabel: string;
  unknownDurationLabel: string;
}

function formatDurationMs(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / TIME_CONSTANTS.SECONDS_PER_MINUTE);
  const seconds = totalSeconds % TIME_CONSTANTS.SECONDS_PER_MINUTE;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function StatusBarMusicStrip({
  shouldShowMusicPlayer,
  isPending,
  recentlyPlayed,
  playbackSnapshot,
  platformColor,
  locale,
  nowPlayingLabel,
  recentlyPlayedLabel,
  playedLabel,
  openTrackLabel,
  unknownDurationLabel,
}: StatusBarMusicStripProps) {
  if (!shouldShowMusicPlayer) {
    return null;
  }

  if (isPending) {
    return (
      <div className="border-b border-border/80 px-3 sm:px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="skeleton h-6 w-6 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1">
            <span className="skeleton block h-2.5 w-28 rounded" />
            <span className="skeleton block h-3 w-48 max-w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!recentlyPlayed || !playbackSnapshot) {
    return null;
  }

  const playedAgo = formatTimeAgo(recentlyPlayed.timestamp, locale);

  return (
    <div className="border-b border-border/80 px-3 sm:px-4 py-2.5">
      <a
        href={recentlyPlayed.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${openTrackLabel}: ${recentlyPlayed.song} — ${recentlyPlayed.artist}`}
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
                playbackSnapshot.isLikelyNowPlaying ? "animate-pulse" : "bg-muted-foreground/40"
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
                {playbackSnapshot.isLikelyNowPlaying ? nowPlayingLabel : recentlyPlayedLabel}
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
                {playedLabel} {playedAgo}
              </span>
              <span className="text-border">·</span>
              <span className="tabular-nums whitespace-nowrap">
                {formatDurationMs(playbackSnapshot.displayElapsedMs)} /{" "}
                {playbackSnapshot.durationMs
                  ? formatDurationMs(playbackSnapshot.durationMs)
                  : unknownDurationLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 h-[3px] w-full rounded-full bg-border/70 overflow-hidden">
          <span
            className={`block h-full rounded-full transition-[width] duration-1000 ease-linear ${
              playbackSnapshot.isLikelyNowPlaying ? "bg-emerald-500/90" : "bg-muted-foreground/50"
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
    </div>
  );
}
