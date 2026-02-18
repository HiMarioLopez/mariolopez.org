"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface OverflowMetrics {
  isOverflowing: boolean;
  distancePx: number;
  durationSeconds: number;
}

interface OverflowAutoScrollTextProps {
  text: string;
  className?: string;
  gapPx?: number;
  speedPxPerSecond?: number;
  startDelayMs?: number;
  title?: string;
}

const DEFAULT_OVERFLOW_METRICS: OverflowMetrics = {
  isOverflowing: false,
  distancePx: 0,
  durationSeconds: 0,
};

const MIN_SCROLL_DURATION_SECONDS = 4;
const OVERFLOW_TOLERANCE_PX = 1;

export function OverflowAutoScrollText({
  text,
  className,
  gapPx = 24,
  speedPxPerSecond = 28,
  startDelayMs = 1200,
  title,
}: OverflowAutoScrollTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  const [overflowMetrics, setOverflowMetrics] = useState<OverflowMetrics>(DEFAULT_OVERFLOW_METRICS);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) {
      return;
    }

    if (text.length === 0) {
      setOverflowMetrics((currentMetrics) =>
        currentMetrics.isOverflowing ? DEFAULT_OVERFLOW_METRICS : currentMetrics,
      );
      return;
    }

    const updateOverflowMetrics = () => {
      const containerWidth = container.clientWidth;
      const textWidth = measure.scrollWidth;

      if (
        containerWidth <= 0 ||
        textWidth <= 0 ||
        textWidth <= containerWidth + OVERFLOW_TOLERANCE_PX
      ) {
        setOverflowMetrics((currentMetrics) =>
          currentMetrics.isOverflowing ? DEFAULT_OVERFLOW_METRICS : currentMetrics,
        );
        return;
      }

      const distancePx = textWidth + gapPx;
      const durationSeconds = Math.max(MIN_SCROLL_DURATION_SECONDS, distancePx / speedPxPerSecond);

      setOverflowMetrics((currentMetrics) => {
        if (
          currentMetrics.isOverflowing &&
          Math.abs(currentMetrics.distancePx - distancePx) < 0.5 &&
          Math.abs(currentMetrics.durationSeconds - durationSeconds) < 0.05
        ) {
          return currentMetrics;
        }

        return {
          isOverflowing: true,
          distancePx,
          durationSeconds,
        };
      });
    };

    updateOverflowMetrics();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(updateOverflowMetrics);
    observer.observe(container);
    observer.observe(measure);

    return () => {
      observer.disconnect();
    };
  }, [gapPx, speedPxPerSecond, text]);

  const shouldAnimate = overflowMetrics.isOverflowing && !prefersReducedMotion;
  const marqueeStyle = useMemo(() => {
    if (!shouldAnimate) {
      return undefined;
    }

    return {
      "--music-marquee-distance": `${overflowMetrics.distancePx}px`,
      "--music-marquee-duration": `${overflowMetrics.durationSeconds}s`,
      "--music-marquee-delay": `${startDelayMs}ms`,
    } as CSSProperties;
  }, [overflowMetrics.distancePx, overflowMetrics.durationSeconds, shouldAnimate, startDelayMs]);

  return (
    <span
      ref={containerRef}
      className={cn("relative block overflow-hidden whitespace-nowrap", className)}
      title={title ?? text}
    >
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute invisible whitespace-nowrap"
      >
        {text}
      </span>

      {shouldAnimate ? (
        <span className="music-text-marquee inline-flex whitespace-nowrap" style={marqueeStyle}>
          <span>{text}</span>
          <span aria-hidden="true" className="inline-block" style={{ width: `${gapPx}px` }} />
          <span aria-hidden="true">{text}</span>
        </span>
      ) : (
        <span className="block truncate">{text}</span>
      )}
    </span>
  );
}
