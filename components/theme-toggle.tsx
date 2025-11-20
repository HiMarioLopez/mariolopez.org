"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { invalidateFontCache } from "@/components/ui/ascii-text";

const ASCIIText = dynamic(() => import("@/components/ui/ascii-text"), {
  ssr: false,
  loading: () => null, // Don't show loading state for decorative element
});

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [shouldLoad, setShouldLoad] = useState(false);
  // Track mount state to prevent hydration mismatches with resolvedTheme
  // resolvedTheme can differ between server and client, so we only use it after mount
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lazy load ASCIIText when component is visible (using intersection observer)
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

    return () => {
      observer.disconnect();
    };
  }, []);

  // Invalidate font cache when theme changes
  useEffect(() => {
    invalidateFontCache();
  }, [theme]);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Cycle through: system -> light -> dark -> system
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  // Get theme display info - use safe defaults during SSR to prevent hydration mismatch
  const getThemeInfo = () => {
    const currentTheme = theme ?? "system";
    
    let nextTheme: string;
    let nextShort: string;
    let currentLabel: string;
    let shortLabel: string;
    let opacity: string;
    
    if (currentTheme === "system") {
      // Only use resolvedTheme after mount to avoid hydration mismatch
      // resolvedTheme can differ between server and client
      const actualTheme = mounted ? (resolvedTheme ?? "light") : "light";
      currentLabel = `System (${actualTheme})`;
      shortLabel = "System";
      nextTheme = "Light";
      nextShort = "Light";
      opacity = "opacity-85";
    } else if (currentTheme === "light") {
      currentLabel = "Light";
      shortLabel = "Light";
      nextTheme = "Dark";
      nextShort = "Dark";
      opacity = "opacity-100";
    } else {
      currentLabel = "Dark";
      shortLabel = "Dark";
      nextTheme = "System";
      nextShort = "System";
      opacity = "opacity-70";
    }
    
    return { currentLabel, shortLabel, nextTheme, nextShort, opacity };
  };

  const { currentLabel, shortLabel, nextTheme, nextShort, opacity } = getThemeInfo();

  return (
    <div className="fixed bottom-3 right-3 z-50">
      <button
        onClick={toggleTheme}
        className={`group flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-all duration-200 ${opacity} touch-manipulation`}
        aria-label={`Toggle theme (Current: ${currentLabel}, Next: ${nextTheme})`}
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
        <div className="flex flex-col items-center gap-0.5 min-w-[60px]">
          <span className="text-xs font-medium text-foreground/80 leading-none">
            {shortLabel}
          </span>
          <span className="text-[10px] text-muted-foreground leading-none">
            → {nextShort}
          </span>
        </div>
      </button>
    </div>
  );
}
