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
  const buttonClassName = `group flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-all duration-200 ${themeInfo?.opacity ?? "opacity-85"} touch-manipulation`;
  const buttonAriaLabel = themeInfo?.ariaLabel ?? "Toggle theme";

  return (
    <div className="fixed bottom-3 right-3 z-50">
      <button
        onClick={toggleTheme}
        className={buttonClassName}
        aria-label={buttonAriaLabel}
        type="button"
      >
        <div
          ref={containerRef}
          className="relative w-16 h-16 flex items-center justify-center"
          style={{ maxWidth: "64px", maxHeight: "64px", pointerEvents: "none" }}
        >
          {shouldLoad && (
            <ASCIIText
              text="💡"
              enableWaves={false}
              asciiFontSize={2}
              textFontSize={80}
              planeBaseHeight={25}
              enableMouseInteraction={true}
            />
          )}
        </div>
        {mounted && themeInfo && (
          <div className="flex flex-col items-center gap-0.5 min-w-[60px]">
            <span className="text-xs font-medium text-foreground/80 leading-none">
              {themeInfo.shortLabel}
            </span>
            <span className="text-[10px] text-muted-foreground leading-none">
              → {themeInfo.nextShort}
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
