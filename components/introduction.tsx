"use client";

import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecentlyPlayed {
  song: string;
  artist: string;
  platform: string;
  url: string;
  timestamp: string;
}

function formatTimeAgo(timestamp: string): string {
  if (!timestamp) return "";

  const now = new Date();
  const playedAt = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - playedAt.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
}

function getPlatformColor(platform: string): string {
  const platformLower = platform.toLowerCase();
  if (platformLower.includes("apple")) {
    // Apple Music colors: Pink/Red
    return "text-[#FA243C] dark:text-[#FF6B9D] underline decoration-dotted decoration-[#FA243C] dark:decoration-[#FF6B9D] hover:text-[#FA243C]/80 dark:hover:text-[#FF6B9D]/80 hover:decoration-[#FA243C]/80 dark:hover:decoration-[#FF6B9D]/80 transition-colors";
  } else if (platformLower.includes("spotify")) {
    // Spotify colors: Green
    return "text-[#1DB954] dark:text-[#1ED760] underline decoration-dotted decoration-[#1DB954] dark:decoration-[#1ED760] hover:text-[#1DB954]/80 dark:hover:text-[#1ED760]/80 hover:decoration-[#1DB954]/80 dark:hover:decoration-[#1ED760]/80 transition-colors";
  }
  // Default: Apple Music colors
  return "text-[#FA243C] dark:text-[#FF6B9D] underline decoration-dotted decoration-[#FA243C] dark:decoration-[#FF6B9D] hover:text-[#FA243C]/80 dark:hover:text-[#FF6B9D]/80 hover:decoration-[#FA243C]/80 dark:hover:decoration-[#FF6B9D]/80 transition-colors";
}

export function Introduction() {
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayed | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch recently played song on client side to avoid hydration mismatch
    setIsLoading(true);
    fetch("/api/recently-played")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch");
        }
        return res.json();
      })
      .then((data) => {
        if (
          data.song &&
          data.artist &&
          data.platform &&
          data.url &&
          data.timestamp
        ) {
          setRecentlyPlayed(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching recently played song:", error);
        // Silently fail - don't show error to user
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const platformClassName = recentlyPlayed
    ? getPlatformColor(recentlyPlayed.platform)
    : "";

  return (
    <TooltipProvider>
      <div className="space-y-4 px-6 sm:px-0">
        <p className="text-xl md:text-lg text-muted-foreground leading-relaxed font-light">
          I'm a{" "}
          <a
            href="https://vercel.com/careers/platform-architect-5176710004"
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent"
          >
            Platform Architect
          </a>
          , working with some brilliant folks at{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-foreground/90 underline decoration-dotted decoration-foreground/70 hover:text-foreground hover:decoration-foreground transition-colors font-medium"
          >
            ▲ Vercel
          </a>
          , solving the most challenging problems in the industry for our
          wonderful{" "}
          <a
            href="https://vercel.com/customers"
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent"
          >
            customers
          </a>
          .
        </p>

        {isLoading ? (
          <p className="text-xl md:text-lg text-muted-foreground leading-relaxed font-light">
            My most recently played song on{" "}
            <span className="skeleton inline-block h-[1.2em] w-28 align-middle" />{" "}
            is{" "}
            <span className="skeleton inline-block h-[1.2em] w-40 align-middle" />{" "}
            by{" "}
            <span className="skeleton inline-block h-[1.2em] w-36 align-middle" />
            .
          </p>
        ) : (
          recentlyPlayed && (
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
                className={`font-medium ${platformClassName}`}
              >
                {recentlyPlayed.song}
              </a>{" "}
              by{" "}
              <span className="font-medium text-foreground/90">
                {recentlyPlayed.artist}
              </span>
              .
            </p>
          )
        )}

        <p className="text-lg md:text-base text-muted-foreground font-light">
          <a href="mailto:contact@mariolopez.org" className="link-accent">
            Hit me up
          </a>
          , I don't bite!
        </p>
      </div>
    </TooltipProvider>
  );
}
