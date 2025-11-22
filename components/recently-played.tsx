"use client";

import { memo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRecentlyPlayed } from "@/lib/hooks/use-recently-played";
import { useFormatTimeAgo } from "@/lib/hooks/use-format-time-ago";
import { getPlatformColor } from "@/lib/utils";
import { SONG_LINK_COLOR } from "@/lib/constants";

interface RecentlyPlayedProps {
  dict: {
    part1: string;
    part2: string;
    part3: string;
    played: string;
  };
}

export const RecentlyPlayed = memo(function RecentlyPlayed({
  dict,
}: RecentlyPlayedProps) {
  const { data: recentlyPlayed, isPending } = useRecentlyPlayed();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const timeAgo = useFormatTimeAgo(recentlyPlayed?.timestamp);

  const platformColor = recentlyPlayed
    ? getPlatformColor(recentlyPlayed.platform)
    : null;

  const { part1, part2, part3, played: playedLabel } = dict;

  return (
    <TooltipProvider>
      {isPending ? (
        <p className="text-xl md:text-lg text-muted-foreground leading-relaxed font-light">
          {part1}{" "}
          <span className="skeleton inline-block h-[1.2em] w-24 align-middle rounded">
            Apple Music
          </span>{" "}
          {part2}{" "}
          <span className="skeleton inline-block h-[1.2em] w-32 align-middle rounded">
            Song Name
          </span>{" "}
          {part3}{" "}
          <span className="skeleton inline-block h-[1.2em] w-28 align-middle rounded">
            Artist Name
          </span>
          .
        </p>
      ) : recentlyPlayed ? (
        <p className="text-xl md:text-lg text-muted-foreground leading-relaxed font-light">
          {part1}{" "}
          <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
            <TooltipTrigger asChild>
              <span
                className="cursor-help touch-manipulation transition-colors"
                style={{
                  color: platformColor ?? undefined,
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
              {timeAgo ? (
                <p>
                  {playedLabel} {timeAgo}
                </p>
              ) : null}
            </TooltipContent>
          </Tooltip>{" "}
          {part2}{" "}
          <a
            href={recentlyPlayed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-light underline decoration-dotted underline-offset-4 transition-colors song-link"
            style={
              {
                color: SONG_LINK_COLOR,
                textDecorationColor: SONG_LINK_COLOR,
                "--song-link-color": SONG_LINK_COLOR,
              } as React.CSSProperties & { "--song-link-color": string }
            }
          >
            {`"${recentlyPlayed.song}" ${part3} ${recentlyPlayed.artist}`}
          </a>
          .
        </p>
      ) : null}
    </TooltipProvider>
  );
});
