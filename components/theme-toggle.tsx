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
  const { theme, setTheme } = useTheme();
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const toggleTheme = () => {
    // Cycle through: system -> light -> dark -> system
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  return (
    <div className="fixed bottom-3 right-3 z-50">
      <button
        onClick={toggleTheme}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        aria-label="Toggle theme"
      >
        <div
          ref={containerRef}
          className="relative w-16 h-16 flex items-center justify-center"
          style={{ maxWidth: "64px", maxHeight: "64px" }}
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
      </button>
    </div>
  );
}
