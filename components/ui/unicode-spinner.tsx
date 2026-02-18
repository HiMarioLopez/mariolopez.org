"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { UNICODE_SPINNERS, type UnicodeSpinnerName } from "@/lib/unicode-spinners";
import { cn } from "@/lib/utils";

interface UnicodeSpinnerProps {
  name?: UnicodeSpinnerName;
  className?: string;
  reducedMotionSymbol?: string;
  fixedWidthCh?: number;
  style?: CSSProperties;
}

export function UnicodeSpinner({
  name = "waverows",
  className,
  reducedMotionSymbol = ".",
  fixedWidthCh,
  style,
}: UnicodeSpinnerProps) {
  const spinner = UNICODE_SPINNERS[name] ?? UNICODE_SPINNERS.waverows;
  const { frames } = spinner;
  const [frameIndex, setFrameIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const frameWidthCh = useMemo(
    () => Math.max(1, ...frames.map((frame) => Array.from(frame).length)),
    [frames],
  );

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
    setFrameIndex(0);

    if (prefersReducedMotion) {
      return;
    }

    const activeSpinner = UNICODE_SPINNERS[name] ?? UNICODE_SPINNERS.waverows;
    if (activeSpinner.frames.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setFrameIndex((currentFrame) => (currentFrame + 1) % activeSpinner.frames.length);
    }, activeSpinner.interval);

    return () => {
      window.clearInterval(timer);
    };
  }, [name, prefersReducedMotion]);

  const frame = useMemo(() => {
    if (prefersReducedMotion) {
      return reducedMotionSymbol;
    }

    return frames[frameIndex] ?? frames[0] ?? reducedMotionSymbol;
  }, [frameIndex, prefersReducedMotion, reducedMotionSymbol, frames]);

  const mergedStyle = useMemo(
    () => ({
      width: `${fixedWidthCh ?? frameWidthCh}ch`,
      ...style,
    }),
    [fixedWidthCh, frameWidthCh, style],
  );

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex select-none items-center justify-center whitespace-pre font-mono tabular-nums",
        className,
      )}
      style={mergedStyle}
    >
      {frame}
    </span>
  );
}
