import { AudioLines } from "lucide-react";
import Image from "next/image";
import { OverflowAutoScrollText } from "@/components/ui/overflow-auto-scroll-text";
import { UnicodeSpinner } from "@/components/ui/unicode-spinner";
import { MUSIC_STRIP_CONFIG, PLATFORMS, TIME_CONSTANTS } from "@/lib/constants";
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
  nowPlayingOnLabel: string;
  lastPlayedOnLabel: string;
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

function hexToHsl(hex: string): [number, number, number] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [0, 0, 0.5];
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  if (delta === 0) return [0, 0, l];
  const s = delta / (1 - Math.abs(2 * l - 1));
  const rawH =
    max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  const h = (rawH * 60 + 360) % 360;
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const rgb =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  const toHexByte = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHexByte(rgb[0])}${toHexByte(rgb[1])}${toHexByte(rgb[2])}`;
}

function isColorVibrant(hex: string): boolean {
  const [, s, l] = hexToHsl(hex);
  return s > 0.25 && l >= 0.15 && l <= 0.85;
}

function boostColor(hex: string): string {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return hex;
  if (isColorVibrant(normalized)) return normalized;
  const [h, rawS, rawL] = hexToHsl(normalized);
  const s = rawS < 0.25 ? Math.max(rawS, 0.55) : rawS;
  const l = rawL < 0.2 ? 0.35 : rawL > 0.85 ? 0.7 : rawL;
  return hslToHex(h, s, l);
}

const GRADIENT_ACCENT_PALETTE: string[] = [
  "#FF6B35", // fire orange
  "#FF3CAC", // hot pink
  "#784BA0", // rich purple
  "#2B86C5", // cerulean blue
  "#00D4AA", // teal mint
  "#FFD93D", // golden yellow
  "#6BCB77", // fresh green
  "#4D96FF", // electric blue
  "#FF6B6B", // coral red
  "#C77DFF", // lavender
  "#FF9F1C", // amber
  "#06D6A0", // emerald mint
];

function getAccentFromPalette(seed: string): string {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) & 0xffffffff;
  }
  const index = Math.abs(hash) % GRADIENT_ACCENT_PALETTE.length;
  return GRADIENT_ACCENT_PALETTE[index] ?? GRADIENT_ACCENT_PALETTE[0] ?? "#FF6B35";
}

function getGradientPalette(artworkColors: ArtworkColors | undefined, fallbackColor: string) {
  const rawColors = [
    normalizeHexColor(artworkColors?.backgroundColor),
    normalizeHexColor(artworkColors?.textColor2),
    normalizeHexColor(artworkColors?.textColor1),
    normalizeHexColor(artworkColors?.textColor3),
    normalizeHexColor(artworkColors?.textColor4),
    normalizeHexColor(fallbackColor),
  ].filter((value): value is string => Boolean(value));
  const boostedColors = [...new Set(rawColors.map(boostColor))];

  if (boostedColors.length < 2) {
    boostedColors.push(getAccentFromPalette(fallbackColor));
  }
  const safeFallback = normalizeHexColor(fallbackColor) ?? PLATFORMS.SPOTIFY.color;
  const colorA = boostedColors[0] ?? boostColor(safeFallback);
  const colorB = boostedColors[1] ?? getAccentFromPalette(fallbackColor);
  const colorC = boostedColors[2] ?? colorA;
  return [colorA, colorB, colorC];
}

function getMusicStripGradient(
  artworkColors: ArtworkColors | undefined,
  fallbackColor: string,
  isLikelyNowPlaying: boolean,
): string {
  const [colorA, colorB, colorC] = getGradientPalette(artworkColors, fallbackColor);
  const radialAlpha = isLikelyNowPlaying ? 0.5 : 0.3;
  const secondaryRadialAlpha = isLikelyNowPlaying ? 0.4 : 0.22;
  const accentRadialAlpha = isLikelyNowPlaying ? 0.35 : 0.18;
  const startAlpha = isLikelyNowPlaying ? 0.45 : 0.28;
  const middleAlpha = isLikelyNowPlaying ? 0.36 : 0.22;
  const endAlpha = isLikelyNowPlaying ? 0.28 : 0.16;

  return [
    `radial-gradient(ellipse 70% 120% at 100% 110%, ${toRgba(colorC, secondaryRadialAlpha)} 0%, transparent 58%)`,
    `radial-gradient(ellipse 90% 110% at 0% 0%, ${toRgba(colorB, radialAlpha)} 0%, transparent 62%)`,
    `radial-gradient(ellipse 60% 80% at 55% -15%, ${toRgba(colorA, accentRadialAlpha)} 0%, transparent 72%)`,
    `linear-gradient(112deg, ${toRgba(colorA, startAlpha)} 0%, ${toRgba(colorB, middleAlpha)} 48%, ${toRgba(colorC, endAlpha)} 100%)`,
  ].join(", ");
}

export function StatusBarMusicStrip({
  shouldShowMusicPlayer,
  isPending,
  recentlyPlayed,
  playbackSnapshot,
  platformColor,
  locale,
  nowPlayingOnLabel,
  lastPlayedOnLabel,
  openTrackLabel,
  unknownDurationLabel,
}: StatusBarMusicStripProps) {
  if (!shouldShowMusicPlayer) {
    return null;
  }

  if (isPending) {
    return (
      <div className="border-b border-border/80 px-3 sm:px-4 py-2.5">
        <div className="relative flex min-h-12 items-stretch gap-2.5">
          <div className="aspect-square self-stretch shrink-0 min-h-12 min-w-12 overflow-hidden rounded-md border border-border/80 bg-background/70">
            <span className="skeleton block h-full w-full rounded-none" />
          </div>
          <div className="min-w-0 flex-1 pl-0.5 sm:pl-1">
            <div className="flex items-center justify-between gap-2">
              <span className="skeleton block h-3 w-32 rounded" />
              <span className="skeleton block h-2.5 w-14 rounded" />
            </div>
            <span className="skeleton mt-1.5 block h-3.5 w-56 max-w-full rounded" />
            <span className="skeleton mt-2 block h-1 w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!recentlyPlayed || !playbackSnapshot) {
    return null;
  }

  const playedAgo = formatTimeAgo(recentlyPlayed.timestamp, locale);
  const isLikelyNowPlaying = playbackSnapshot.isLikelyNowPlaying;
  const platformAccentColor =
    normalizeHexColor(platformColor ?? undefined) ?? PLATFORMS.SPOTIFY.color;
  const isAppleMusicTrack = recentlyPlayed.platform
    .toLowerCase()
    .includes(PLATFORMS.APPLE_MUSIC.source);
  const isSpotifyTrack = recentlyPlayed.platform.toLowerCase().includes(PLATFORMS.SPOTIFY.source);
  const nowPlayingAccentColor = isAppleMusicTrack
    ? PLATFORMS.APPLE_MUSIC.color
    : isSpotifyTrack
      ? PLATFORMS.SPOTIFY.color
      : platformAccentColor;
  const gradientSeedColor =
    normalizeHexColor(recentlyPlayed.artworkColors?.textColor1) ?? platformAccentColor;
  const artworkUrl = resolveArtworkUrl(recentlyPlayed.artworkUrl);
  const stripGradient = getMusicStripGradient(
    recentlyPlayed.artworkColors,
    gradientSeedColor,
    isLikelyNowPlaying,
  );

  const statusAccentSeed = nowPlayingAccentColor;
  const statusDotStyle = isLikelyNowPlaying
    ? {
        backgroundColor: toRgba(statusAccentSeed, 0.92),
        boxShadow: `0 0 0 1px ${toRgba(statusAccentSeed, 0.56)}, 0 0 12px ${toRgba(statusAccentSeed, 0.46)}`,
      }
    : undefined;
  const statusTextColor = `color-mix(in srgb, ${statusAccentSeed} 78%, var(--foreground))`;
  const statusMetaColor = `color-mix(in srgb, ${statusAccentSeed} 40%, var(--foreground))`;
  const statusTextStyle = isLikelyNowPlaying
    ? {
        color: statusTextColor,
      }
    : undefined;
  const statusMetaStyle = isLikelyNowPlaying
    ? {
        color: statusMetaColor,
        opacity: 0.86,
      }
    : undefined;
  const activityIconStyle = isLikelyNowPlaying
    ? {
        color: statusTextColor,
        opacity: 1,
      }
    : undefined;
  const activitySpinnerWidthCh = isAppleMusicTrack
    ? MUSIC_STRIP_CONFIG.APPLE_MUSIC_ACTIVITY_SPINNER_WIDTH_CH
    : undefined;
  const activitySpinnerClassName = isAppleMusicTrack
    ? "text-[8px] leading-[1.2] font-medium"
    : "text-[10px] leading-[1.2] font-medium";
  const trackDisplayLabel = `${recentlyPlayed.song} — ${recentlyPlayed.artist}`;

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
          className="music-strip-gradient pointer-events-none absolute inset-0 opacity-85 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            backgroundImage: stripGradient,
            animationDuration: playbackSnapshot.isLikelyNowPlaying ? "14s" : "22s",
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/[0.15] via-background/[0.04] to-background/[0.32]"
        />

        <div className="relative flex min-h-12 items-stretch gap-2.5">
          <div className="aspect-square self-stretch shrink-0 min-h-12 min-w-12 overflow-hidden rounded-md border border-border/80 bg-background/70">
            {artworkUrl ? (
              <Image
                src={artworkUrl}
                alt=""
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="inline-flex h-full w-full items-center justify-center text-text-tertiary">
                <AudioLines size={14} />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 pl-0.5 sm:pl-1">
            <div className="flex items-center justify-between gap-2 text-[10px] leading-[1.2] text-text-secondary">
              {isLikelyNowPlaying ? (
                <>
                  <span className="min-w-0 inline-flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={statusDotStyle}
                    />
                    <span className="truncate" style={statusTextStyle}>
                      {nowPlayingOnLabel} {recentlyPlayed.platform}
                    </span>
                    <UnicodeSpinner
                      name={MUSIC_STRIP_CONFIG.ACTIVITY_SPINNER_NAME}
                      reducedMotionSymbol={MUSIC_STRIP_CONFIG.REDUCED_MOTION_SYMBOL}
                      fixedWidthCh={activitySpinnerWidthCh}
                      className={`${activitySpinnerClassName} shrink-0`}
                      style={activityIconStyle}
                    />
                  </span>
                  <span
                    className="tabular-nums whitespace-nowrap text-[9px] font-normal tracking-tight sm:text-[10px]"
                    style={statusMetaStyle}
                  >
                    {formatDurationMs(playbackSnapshot.displayElapsedMs)} /{" "}
                    {playbackSnapshot.durationMs
                      ? formatDurationMs(playbackSnapshot.durationMs)
                      : unknownDurationLabel}
                  </span>
                </>
              ) : (
                <span className="min-w-0 inline-flex items-center gap-1.5">
                  <span className="truncate text-text-secondary">
                    {lastPlayedOnLabel} {recentlyPlayed.platform}
                  </span>
                  <span className="shrink-0 text-text-decorative">·</span>
                  <span className="shrink-0 tabular-nums text-text-secondary">{playedAgo}</span>
                </span>
              )}
            </div>

            <OverflowAutoScrollText
              text={trackDisplayLabel}
              className="mt-1.5 text-[11px] text-foreground"
              gapPx={MUSIC_STRIP_CONFIG.TRACK_MARQUEE_GAP_PX}
              speedPxPerSecond={MUSIC_STRIP_CONFIG.TRACK_MARQUEE_SPEED_PX_PER_SECOND}
              startDelayMs={MUSIC_STRIP_CONFIG.TRACK_MARQUEE_START_DELAY_MS}
            />

            <div className="relative mt-2 h-[3px] w-full overflow-hidden rounded-full bg-foreground/[0.12]">
              <span
                className={`block h-full rounded-full transition-[width] duration-1000 ease-linear ${
                  playbackSnapshot.isLikelyNowPlaying ? "" : "bg-muted-foreground/30"
                }`}
                style={{
                  width: `${playbackSnapshot.progressPercent}%`,
                  ...(playbackSnapshot.isLikelyNowPlaying
                    ? {
                        backgroundColor: gradientSeedColor,
                        boxShadow: `0 0 6px ${toRgba(gradientSeedColor, 0.5)}`,
                      }
                    : {}),
                }}
              />
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
