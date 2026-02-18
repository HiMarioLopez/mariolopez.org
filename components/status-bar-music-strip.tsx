import { AudioLines } from "lucide-react";
import Image from "next/image";
import { PLATFORMS, TIME_CONSTANTS } from "@/lib/constants";
import type { PlaybackSnapshot } from "@/lib/hooks/use-playback-snapshot";
import type { ArtworkColors, RecentlyPlayed } from "@/lib/types";
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

const DEFAULT_ARTWORK_SIZE = 96;

function formatDurationMs(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / TIME_CONSTANTS.SECONDS_PER_MINUTE);
  const seconds = totalSeconds % TIME_CONSTANTS.SECONDS_PER_MINUTE;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function resolveArtworkUrl(artworkUrl: string | undefined, size: number = DEFAULT_ARTWORK_SIZE) {
  if (!artworkUrl) {
    return undefined;
  }

  const normalizedArtworkUrl = artworkUrl.trim();
  if (normalizedArtworkUrl.length === 0) {
    return undefined;
  }

  return normalizedArtworkUrl.replaceAll("{w}", String(size)).replaceAll("{h}", String(size));
}

function normalizeHexColor(color: string | undefined): string | undefined {
  if (!color) {
    return undefined;
  }

  const normalizedColor = color.trim().toLowerCase();
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/.test(normalizedColor) ? normalizedColor : undefined;
}

function hexToRgb(color: string): [number, number, number] | null {
  const normalizedColor = normalizeHexColor(color);
  if (!normalizedColor) {
    return null;
  }

  const hexValue = normalizedColor.slice(1);

  if (hexValue.length === 3) {
    const [r, g, b] = hexValue.split("");
    return [r + r, g + g, b + b].map((chunk) => Number.parseInt(chunk, 16)) as [
      number,
      number,
      number,
    ];
  }

  return [
    Number.parseInt(hexValue.slice(0, 2), 16),
    Number.parseInt(hexValue.slice(2, 4), 16),
    Number.parseInt(hexValue.slice(4, 6), 16),
  ];
}

function toRgba(color: string, alpha: number): string {
  const rgbColor = hexToRgb(color);

  if (!rgbColor) {
    return `rgba(29, 185, 84, ${alpha})`;
  }

  return `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, ${alpha})`;
}

function getGradientPalette(artworkColors: ArtworkColors | undefined, fallbackColor: string) {
  const colors = [
    normalizeHexColor(artworkColors?.backgroundColor),
    normalizeHexColor(artworkColors?.textColor2),
    normalizeHexColor(artworkColors?.textColor1),
    normalizeHexColor(artworkColors?.textColor3),
    normalizeHexColor(artworkColors?.textColor4),
    normalizeHexColor(fallbackColor),
  ].filter((value): value is string => Boolean(value));

  const uniqueColors = [...new Set(colors)];

  if (uniqueColors.length >= 3) {
    return uniqueColors.slice(0, 3);
  }

  if (uniqueColors.length === 2) {
    return [uniqueColors[0], uniqueColors[1], uniqueColors[0]];
  }

  const safeFallback = normalizeHexColor(fallbackColor) ?? PLATFORMS.SPOTIFY.color;
  return [safeFallback, safeFallback, safeFallback];
}

function getMusicStripGradient(
  artworkColors: ArtworkColors | undefined,
  fallbackColor: string,
): string {
  const [colorA, colorB, colorC] = getGradientPalette(artworkColors, fallbackColor);

  return `radial-gradient(90% 100% at 0% 0%, ${toRgba(colorB, 0.22)} 0%, transparent 62%), linear-gradient(112deg, ${toRgba(colorA, 0.24)} 0%, ${toRgba(colorB, 0.2)} 48%, ${toRgba(colorC, 0.14)} 100%)`;
}

function getProgressGradient(
  artworkColors: ArtworkColors | undefined,
  fallbackColor: string,
): string {
  const [colorA, colorB, colorC] = getGradientPalette(artworkColors, fallbackColor);
  return `linear-gradient(90deg, ${colorA} 0%, ${colorB} 55%, ${colorC} 100%)`;
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
          <span className="skeleton h-9 w-9 rounded-md" />
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
  const accentColor =
    normalizeHexColor(recentlyPlayed.artworkColors?.textColor1) ??
    normalizeHexColor(platformColor ?? undefined) ??
    PLATFORMS.SPOTIFY.color;
  const artworkUrl = resolveArtworkUrl(recentlyPlayed.artworkUrl);
  const stripGradient = getMusicStripGradient(recentlyPlayed.artworkColors, accentColor);
  const progressGradient = getProgressGradient(recentlyPlayed.artworkColors, accentColor);

  return (
    <div className="border-b border-border/80 px-3 sm:px-4 py-2.5">
      <a
        href={recentlyPlayed.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${openTrackLabel}: ${recentlyPlayed.song} — ${recentlyPlayed.artist}`}
        className="group relative -mx-3 sm:-mx-4 -my-2.5 block overflow-hidden px-3 sm:px-4 py-2.5 transition-colors hover:bg-accent/20"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-85 transition-opacity duration-300 group-hover:opacity-100"
          style={{ backgroundImage: stripGradient }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20"
        />

        <div className="relative flex items-center gap-2.5">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-border/80 bg-background/70">
            {artworkUrl ? (
              <Image
                src={artworkUrl}
                alt=""
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="inline-flex h-full w-full items-center justify-center text-muted-foreground/60">
                <AudioLines size={14} />
              </span>
            )}
          </div>
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
                        color: accentColor,
                      }
                    : undefined
                }
              >
                {playbackSnapshot.isLikelyNowPlaying ? nowPlayingLabel : recentlyPlayedLabel}
              </span>
              <span className="text-border">/</span>
              <span className="text-muted-foreground/60">{recentlyPlayed.platform}</span>
              {playbackSnapshot.isLikelyNowPlaying && (
                <AudioLines size={10} className="animate-pulse" style={{ color: accentColor }} />
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

        <div className="relative mt-2 h-[3px] w-full overflow-hidden rounded-full bg-border/70">
          <span
            className={`block h-full rounded-full transition-[width] duration-1000 ease-linear ${
              playbackSnapshot.isLikelyNowPlaying ? "bg-emerald-500/90" : "bg-muted-foreground/50"
            }`}
            style={{
              width: `${playbackSnapshot.progressPercent}%`,
              ...(playbackSnapshot.isLikelyNowPlaying ? { backgroundImage: progressGradient } : {}),
            }}
          />
        </div>
      </a>
    </div>
  );
}
