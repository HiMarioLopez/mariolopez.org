"use client";

import { Globe, Monitor, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ThemeState = "system" | "light" | "dark";

interface ThemeToggleProps {
  dict: {
    auto: string;
    light: string;
    dark: string;
    aria_toggle_theme: string;
  };
}

function ThemeToggle({ dict }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeInfo = useMemo(() => {
    if (!mounted) return null;

    const currentTheme = (theme as ThemeState) ?? "system";

    if (currentTheme === "system") {
      const actualTheme = resolvedTheme ?? "light";
      const actualThemeLabel = actualTheme === "light" ? dict.light : dict.dark;
      return {
        icon: Monitor,
        label: dict.auto,
        ariaLabel: `${dict.aria_toggle_theme} (Current: System (${actualThemeLabel}))`,
      };
    }

    if (currentTheme === "light") {
      return {
        icon: Sun,
        label: dict.light,
        ariaLabel: `${dict.aria_toggle_theme} (Current: ${dict.light})`,
      };
    }

    return {
      icon: Moon,
      label: dict.dark,
      ariaLabel: `${dict.aria_toggle_theme} (Current: ${dict.dark})`,
    };
  }, [theme, resolvedTheme, mounted, dict]);

  if (!mounted || !themeInfo) {
    return (
      <button
        className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-all duration-200 touch-manipulation"
        aria-label={dict.aria_toggle_theme}
        type="button"
        disabled
      >
        <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
        <span className="text-xs font-medium font-mono text-muted-foreground uppercase">
          {dict.auto}
        </span>
      </button>
    );
  }

  const Icon = themeInfo.icon;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-all duration-200 touch-manipulation"
          aria-label={themeInfo.ariaLabel}
          type="button"
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground shrink-0" />
          <span className="text-xs font-medium font-mono text-foreground/90 uppercase">
            {themeInfo.label}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[100px]">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="text-xs font-medium font-mono"
        >
          <Sun className="mr-2 h-4 w-4" />
          {dict.light}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="text-xs font-medium font-mono"
        >
          <Moon className="mr-2 h-4 w-4" />
          {dict.dark}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="text-xs font-medium font-mono"
        >
          <Monitor className="mr-2 h-4 w-4" />
          {dict.auto}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface LanguageToggleProps {
  dict: {
    language: string;
    aria_toggle_language: string;
  };
  lang: string;
}

function LanguageToggle({ dict, lang }: LanguageToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLang: string) => {
    if (newLang === lang) return;

    // Replace the language segment in the path
    const segments = pathname.split("/");
    if (segments.length > 1) {
      segments[1] = newLang;
      const newPath = segments.join("/");
      router.push(newPath);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-all duration-200 touch-manipulation"
          aria-label={dict.aria_toggle_language}
          type="button"
        >
          <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-foreground shrink-0" />
          <span className="text-xs font-medium font-mono text-foreground/90">
            {lang === "en-US" ? "EN" : "ES"}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        <DropdownMenuItem
          onClick={() => switchLanguage("en-US")}
          className="text-xs font-medium font-mono"
        >
          English (en-US)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchLanguage("es-MX")}
          className="text-xs font-medium font-mono"
        >
          Español (es-MX)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ViewToggleProps {
  dict: {
    human: string;
    machine: string;
    auto: string;
    light: string;
    dark: string;
    aria_switch_human: string;
    aria_switch_machine: string;
    aria_toggle_theme: string;
    language: string;
    aria_toggle_language: string;
  };
  lang: string;
}

export function ViewToggle({ dict, lang }: ViewToggleProps) {
  const pathname = usePathname();
  const router = useRouter();
  // Normalize pathname to check if it contains /human
  const isHuman = pathname === `/${lang}/human` || pathname === `/${lang}` || pathname === `/human`; // fallback
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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in duration-300 sm:top-6">
      <div className="flex items-center gap-2 sm:gap-3 bg-background/95 dark:bg-background/95 backdrop-blur-md border border-border/50 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg">
        <Link
          href={`/${lang}/human`}
          onClick={(e) => handleToggle(e, `/${lang}/human`)}
          prefetch={true}
          className={`
            flex items-center gap-1.5 sm:gap-2 text-xs font-medium font-mono transition-all duration-10 ease-out
            ${isHuman ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
            ${isTransitioning ? "opacity-60" : "cursor-pointer"}
          `}
          aria-label={dict.aria_switch_human}
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
          {dict.human}
        </Link>

        <Link
          href={`/${lang}/machine`}
          onClick={(e) => handleToggle(e, `/${lang}/machine`)}
          prefetch={true}
          className={`
            flex items-center gap-1.5 sm:gap-2 text-xs font-medium font-mono transition-all duration-10 ease-out
            ${!isHuman ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
            ${isTransitioning ? "opacity-60" : "cursor-pointer"}
          `}
          aria-label={dict.aria_switch_machine}
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
          {dict.machine}
        </Link>

        <div className="h-4 sm:h-5 w-[1.5px] bg-foreground/30 mx-0.5 sm:mx-1" />

        <ThemeToggle dict={dict} />

        <div className="h-4 sm:h-5 w-[1.5px] bg-foreground/30 mx-0.5 sm:mx-1" />

        <LanguageToggle dict={dict} lang={lang} />
      </div>
    </div>
  );
}
