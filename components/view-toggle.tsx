"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

type ThemeState = "system" | "light" | "dark";

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200);

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

  const themeInfo = useMemo(() => {
    if (!mounted) return null;

    const currentTheme = (theme as ThemeState) ?? "system";

    if (currentTheme === "system") {
      const actualTheme = resolvedTheme ?? "light";
      return {
        icon: Monitor,
        label: "AUTO",
        ariaLabel: `Toggle theme (Current: System (${actualTheme}), Next: Light)`,
      };
    }

    if (currentTheme === "light") {
      return {
        icon: Sun,
        label: "LIGHT",
        ariaLabel: "Toggle theme (Current: Light, Next: Dark)",
      };
    }

    return {
      icon: Moon,
      label: "DARK",
      ariaLabel: "Toggle theme (Current: Dark, Next: System)",
    };
  }, [theme, resolvedTheme, mounted]);

  if (!mounted || !themeInfo) {
    return (
      <button
        className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-all duration-200 touch-manipulation"
        aria-label="Toggle theme"
        type="button"
        disabled
      >
        <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
        <span className="text-xs font-medium font-mono text-muted-foreground">AUTO</span>
      </button>
    );
  }

  const Icon = themeInfo.icon;

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-all duration-200 touch-manipulation"
      aria-label={themeInfo.ariaLabel}
      type="button"
    >
      <Icon
        key={theme}
        className={`w-4 h-4 sm:w-5 sm:h-5 text-foreground shrink-0 transition-transform duration-150 ease-out ${
          isAnimating ? "scale-110" : "scale-100"
        }`}
      />
      <span className="text-xs font-medium font-mono text-foreground/90">{themeInfo.label}</span>
    </button>
  );
}

export function ViewToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const isHuman = pathname === "/human" || pathname === "/";
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleToggle = (e: React.MouseEvent, targetPath: string) => {
    if (isTransitioning || pathname === targetPath) {
      e.preventDefault();
      return;
    }

    // Navigate immediately - no delays
    router.push(targetPath);

    // Minimal transition state for visual feedback only
    setIsTransitioning(true);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 10);
  };

  return (
    <div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in duration-300 sm:top-6"
    >
      <div className="flex items-center gap-2 sm:gap-3 bg-background/95 dark:bg-background/95 backdrop-blur-md border border-border/50 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg">
        <Link
          href="/human"
          onClick={(e) => handleToggle(e, "/human")}
          prefetch={true}
          className={`
            flex items-center gap-1.5 sm:gap-2 text-xs font-medium font-mono transition-all duration-10 ease-out
            ${
              isHuman
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }
            ${isTransitioning ? "opacity-60" : "cursor-pointer"}
          `}
          aria-label="Switch to Human view"
        >
          <div
            className={`
              w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 transition-all duration-10 ease-out shrink-0
              ${
                isHuman
                  ? "border-foreground bg-foreground"
                  : "border-muted-foreground bg-transparent"
              }
            `}
          />
          HUMAN
        </Link>

        <Link
          href="/machine"
          onClick={(e) => handleToggle(e, "/machine")}
          prefetch={true}
          className={`
            flex items-center gap-1.5 sm:gap-2 text-xs font-medium font-mono transition-all duration-10 ease-out
            ${
              !isHuman
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }
            ${isTransitioning ? "opacity-60" : "cursor-pointer"}
          `}
          aria-label="Switch to Machine view"
        >
          <div
            className={`
              w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 transition-all duration-10 ease-out shrink-0
              ${
                !isHuman
                  ? "border-foreground bg-foreground"
                  : "border-muted-foreground bg-transparent"
              }
            `}
          />
          MACHINE
        </Link>

        <div className="h-4 sm:h-5 w-[1.5px] bg-foreground/30 mx-0.5 sm:mx-1" />

        <ThemeToggle />
      </div>
    </div>
  );
}
