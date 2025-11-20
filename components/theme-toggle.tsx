"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { invalidateFontCache } from "@/components/ui/ascii-text";

const ASCIIText = dynamic(() => import("@/components/ui/ascii-text"), {
  ssr: false,
  loading: () => null,
});

type ThemeState = "system" | "light" | "dark";

interface ThemeInfo {
  shortLabel: string;
  nextShort: string;
  ariaLabel: string;
  opacity: string;
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    invalidateFontCache();
  }, [theme]);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // If theme is undefined, initialize it to system
    if (theme === undefined) {
      setTheme("system");
      return;
    }

    const currentTheme = theme as ThemeState;
    if (currentTheme === "system") {
      setTheme("light");
    } else if (currentTheme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  // Calculate theme info - only after mount to avoid hydration issues
  const themeInfo = useMemo<ThemeInfo | null>(() => {
    if (!mounted) return null;

    const currentTheme = (theme as ThemeState) ?? "system";

    if (currentTheme === "system") {
      const actualTheme = resolvedTheme ?? "light";
      return {
        shortLabel: "System",
        nextShort: "Light",
        ariaLabel: `Toggle theme (Current: System (${actualTheme}), Next: Light)`,
        opacity: "opacity-85",
      };
    }

    if (currentTheme === "light") {
      return {
        shortLabel: "Light",
        nextShort: "Dark",
        ariaLabel: "Toggle theme (Current: Light, Next: Dark)",
        opacity: "opacity-100",
      };
    }

    // dark
    return {
      shortLabel: "Dark",
      nextShort: "System",
      ariaLabel: "Toggle theme (Current: Dark, Next: System)",
      opacity: "opacity-70",
    };
  }, [theme, resolvedTheme, mounted]);

  // Use static defaults for button attributes until mounted to prevent hydration issues
  const buttonAriaLabel = themeInfo?.ariaLabel ?? "Toggle theme";

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 animate-in fade-in duration-300">
      <button
        onClick={toggleTheme}
        className="group flex flex-col items-center gap-1 bg-background/95 dark:bg-background/95 backdrop-blur-md border border-border/50 rounded-lg p-0 shadow-lg hover:opacity-80 transition-all duration-200 touch-manipulation"
        aria-label={buttonAriaLabel}
        type="button"
      >
        <div
          ref={containerRef}
          className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0"
          style={{ pointerEvents: "none" }}
        >
          {shouldLoad && (
            <ASCIIText
              text="💡"
              enableWaves={false}
              asciiFontSize={2}
              textFontSize={72}
              planeBaseHeight={22}
              enableMouseInteraction={false}
            />
          )}
        </div>
        {mounted && themeInfo && (
          <span className="text-xs font-medium text-foreground/90 leading-none pb-2">
            {themeInfo.shortLabel}
          </span>
        )}
      </button>
    </div>
  );
}
