"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { VISITOR_COUNTER_CONFIG } from "@/lib/constants";

interface VisitorCounterProps {
  className?: string;
}

/**
 * Digital segment display component for a single digit
 * Retro 7-segment style with cleaner proportions
 */
function DigitDisplay({
  digit,
  className,
  disabled = false,
}: {
  digit: string;
  className?: string;
  disabled?: boolean;
}) {
  // Segment patterns for digits 0-9
  const segments: Record<string, boolean[]> = {
    "0": [true, true, true, true, true, true, false],
    "1": [false, true, true, false, false, false, false],
    "2": [true, true, false, true, true, false, true],
    "3": [true, true, true, true, false, false, true],
    "4": [false, true, true, false, false, true, true],
    "5": [true, false, true, true, false, true, true],
    "6": [true, false, true, true, true, true, true],
    "7": [true, true, true, false, false, false, false],
    "8": [true, true, true, true, true, true, true],
    "9": [true, true, true, true, false, true, true],
    " ": [false, false, false, false, false, false, false],
  };

  const active = segments[digit] || segments[" "];

  return (
    <div className={cn("relative w-[14px] h-[20px]", className)}>
      {/* Segment A (top) */}
      <div
        className={cn(
          "absolute top-0 left-0.5 right-0.5 h-px",
          disabled
            ? "bg-gray-300/20 dark:bg-gray-600/15"
            : active[0]
              ? "bg-gray-700 dark:bg-gray-300"
              : "bg-gray-300/30 dark:bg-gray-600/20"
        )}
      />
      {/* Segment B (top right) */}
      <div
        className={cn(
          "absolute top-px right-0 bottom-[calc(50%-0.5px)] w-px",
          disabled
            ? "bg-gray-300/20 dark:bg-gray-600/15"
            : active[1]
              ? "bg-gray-700 dark:bg-gray-300"
              : "bg-gray-300/30 dark:bg-gray-600/20"
        )}
      />
      {/* Segment C (bottom right) */}
      <div
        className={cn(
          "absolute top-[calc(50%+0.5px)] right-0 bottom-px w-px",
          disabled
            ? "bg-gray-300/20 dark:bg-gray-600/15"
            : active[2]
              ? "bg-gray-700 dark:bg-gray-300"
              : "bg-gray-300/30 dark:bg-gray-600/20"
        )}
      />
      {/* Segment D (bottom) */}
      <div
        className={cn(
          "absolute bottom-0 left-0.5 right-0.5 h-px",
          disabled
            ? "bg-gray-300/20 dark:bg-gray-600/15"
            : active[3]
              ? "bg-gray-700 dark:bg-gray-300"
              : "bg-gray-300/30 dark:bg-gray-600/20"
        )}
      />
      {/* Segment E (bottom left) */}
      <div
        className={cn(
          "absolute top-[calc(50%+0.5px)] left-0 bottom-px w-px",
          disabled
            ? "bg-gray-300/20 dark:bg-gray-600/15"
            : active[4]
              ? "bg-gray-700 dark:bg-gray-300"
              : "bg-gray-300/30 dark:bg-gray-600/20"
        )}
      />
      {/* Segment F (top left) */}
      <div
        className={cn(
          "absolute top-px left-0 bottom-[calc(50%-0.5px)] w-px",
          disabled
            ? "bg-gray-300/20 dark:bg-gray-600/15"
            : active[5]
              ? "bg-gray-700 dark:bg-gray-300"
              : "bg-gray-300/30 dark:bg-gray-600/20"
        )}
      />
      {/* Segment G (middle) */}
      <div
        className={cn(
          "absolute top-1/2 left-0.5 right-0.5 h-px -translate-y-1/2",
          disabled
            ? "bg-gray-300/20 dark:bg-gray-600/15"
            : active[6]
              ? "bg-gray-700 dark:bg-gray-300"
              : "bg-gray-300/30 dark:bg-gray-600/20"
        )}
      />
    </div>
  );
}

/**
 * Visitor counter component with digital segment display
 * Similar to Josh W. Comeau's blog post counter
 */
export function VisitorCounter({ className }: VisitorCounterProps) {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchAndIncrement() {
      try {
        // First, increment the count
        const incrementResponse = await fetch("/api/visitor-count", {
          method: "POST",
        });

        if (!mounted) return;

        if (incrementResponse.ok) {
          const data = await incrementResponse.json();
          setCount(data.count);
        } else {
          // If increment fails, try to get current count
          const getResponse = await fetch("/api/visitor-count");
          if (getResponse.ok) {
            const data = await getResponse.json();
            setCount(data.count);
          }
        }
      } catch (error) {
        // Silently fail - don't break the page
        // Error is expected if Redis is not configured
        if (process.env.NODE_ENV === "development") {
          console.warn("Failed to fetch visitor count:", error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchAndIncrement();

    return () => {
      mounted = false;
    };
  }, []);

  // Format count as N-digit string with leading zeros
  const countString =
    count !== null
      ? count
          .toString()
          .padStart(
            VISITOR_COUNTER_CONFIG.DIGIT_COUNT,
            VISITOR_COUNTER_CONFIG.PADDING_CHAR
          )
      : VISITOR_COUNTER_CONFIG.DEFAULT_DISPLAY;
  const digits = countString.split("");

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {/* Label */}
      <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono tracking-wide text-center leading-tight">
        {VISITOR_COUNTER_CONFIG.LABEL}
      </div>

      {/* Counter box - retro pixel aesthetic */}
      <div className="bg-gray-100 dark:bg-gray-900/60 border border-gray-300/80 dark:border-gray-700/80 rounded-sm px-1.5 py-1 shadow-sm">
        <div className="flex gap-0.5 items-center justify-center">
          {digits.map((digit: string, index: number) => (
            <DigitDisplay
              key={index}
              digit={digit}
              disabled={isLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
