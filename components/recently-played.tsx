"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRecentlyPlayed } from "@/lib/hooks/use-recently-played";
import { formatTimeAgo, getPlatformColor } from "@/lib/utils";
import { useState } from "react";

export function RecentlyPlayed() {
  const { data: recentlyPlayed, isPending } = useRecentlyPlayed();
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const platformClassName = recentlyPlayed
    ? getPlatformColor(recentlyPlayed.platform)
    : "";

  return (
    <TooltipProvider>
      {isPending ? (
        <p className="text-xl md:text-lg text-muted-foreground leading-relaxed font-light px-6 sm:px-0">
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
        <p className="text-xl md:text-lg text-muted-foreground leading-relaxed font-light px-6 sm:px-0">
          My most recently played song on{" "}
          <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
            <TooltipTrigger asChild>
              <span
                className={`cursor-help touch-manipulation ${platformClassName}`}
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
            className={`font-light ${platformClassName}`}
          >
            {recentlyPlayed.song}
          </a>{" "}
          by{" "}
          <span className="font-light text-foreground/90">
            {recentlyPlayed.artist}
          </span>
          .
        </p>
      ) : null}
    </TooltipProvider>
  );
}

