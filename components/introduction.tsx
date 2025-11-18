"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRecentlyPlayed } from "@/lib/hooks/use-recently-played";
import { formatTimeAgo, getPlatformColor } from "@/lib/utils";
import { LINKS } from "@/lib/constants";

export function Introduction() {
  const { data: recentlyPlayed, isPending } = useRecentlyPlayed();
  
  const platformClassName = recentlyPlayed
    ? getPlatformColor(recentlyPlayed.platform)
    : "";

  return (
    <TooltipProvider>
      <div className="space-y-4 px-6 sm:px-0">
        <p className="text-xl md:text-lg text-muted-foreground leading-relaxed font-light">
          I'm a{" "}
          <a
            href={LINKS.VERCEL_CAREERS}
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent"
          >
            Platform Architect
          </a>
          , working with some brilliant folks at{" "}
          <a
            href={LINKS.VERCEL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-foreground/90 underline decoration-dotted decoration-foreground/70 hover:text-foreground hover:decoration-foreground transition-colors font-medium underline-offset-4"
          >
            ▲ Vercel
          </a>
          , solving the most challenging problems in the industry for our
          wonderful{" "}
          <a
            href={LINKS.VERCEL_CUSTOMERS}
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent"
          >
            customers
          </a>
          .
        </p>

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
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={`cursor-help ${platformClassName}`}>
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

        <p className="text-lg md:text-base text-muted-foreground font-light">
          <a href={LINKS.EMAIL_HUMAN} className="link-accent">
            Hit me up
          </a>
          , I don't bite!
        </p>
      </div>
    </TooltipProvider>
  );
}
