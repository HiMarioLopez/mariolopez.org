"use client";

import { memo, useState } from "react";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRecentlyPlayed } from "@/lib/hooks/use-recently-played";
import { formatTimeAgo, getPlatformColor } from "@/lib/utils";
import { SONG_LINK_COLORS } from "@/lib/constants";

export const RecentlyPlayed = memo(function RecentlyPlayed() {
  const { data: recentlyPlayed, isPending } = useRecentlyPlayed();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  const platformColors = recentlyPlayed
    ? getPlatformColor(recentlyPlayed.platform)
    : null;

  const platformColor =
    platformColors && resolvedTheme === "dark"
      ? platformColors.dark
      : platformColors?.light;

  const songLinkColor =
    resolvedTheme === "dark" ? SONG_LINK_COLORS.dark : SONG_LINK_COLORS.light;

  return (
    <TooltipProvider>
      {isPending ? (
        <p className="text-xl md:text-lg text-muted-foreground leading-relaxed font-light">
          My most recently played song on{" "}
          <span className="skeleton inline-block h-[1.2em] w-24 align-middle rounded">
            Apple Music
          </span>{" "}
          is{" "}
          <span className="skeleton inline-block h-[1.2em] w-32 align-middle rounded">
            Song Name
          </span>{" "}
          by{" "}
          <span className="skeleton inline-block h-[1.2em] w-28 align-middle rounded">
            Artist Name
          </span>
          .
        </p>
      ) : recentlyPlayed ? (
        <p className="text-xl md:text-lg text-muted-foreground leading-relaxed font-light">
          My most recently played song on{" "}
          <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
            <TooltipTrigger asChild>
              <span
                className="cursor-help touch-manipulation transition-colors"
                style={{
                  color: platformColor,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setTooltipOpen(!tooltipOpen);
                }}
              >
                {recentlyPlayed.platform}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Played {formatTimeAgo(recentlyPlayed.timestamp)}</p>
            </TooltipContent>
          </Tooltip>{" "}
          is{" "}
          <a
            href={recentlyPlayed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-light underline decoration-wavy underline-offset-4 transition-colors song-link"
            style={
              {
                color: songLinkColor,
                textDecorationColor: songLinkColor,
                "--song-link-color": songLinkColor,
              } as React.CSSProperties & { "--song-link-color": string }
            }
          >
            {recentlyPlayed.song} by {recentlyPlayed.artist}
          </a>
          .
        </p>
      ) : null}
    </TooltipProvider>
  );
});
