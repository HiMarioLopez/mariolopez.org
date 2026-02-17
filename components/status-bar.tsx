"use client";

import { Globe, Monitor, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LINKS, VISITOR_COUNTER_CONFIG } from "@/lib/constants";

interface StatusBarProps {
  lang: string;
  mode: "human" | "machine";
}

export function StatusBar({ lang, mode }: StatusBarProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      try {
        const res = await fetch("/api/visitor-count");
        if (!cancelled && res.ok) {
          const data = await res.json();
          setVisitorCount(data.count);
        }
      } catch {
        // Silently fail - visitor count is non-critical
      }
    }

    fetchCount();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-5 sm:px-6 pb-3 pt-6 pointer-events-none bg-gradient-to-t from-background via-background/80 to-transparent">
      <div className="max-w-[680px] mx-auto">
        <div className="bg-card border border-border rounded-lg px-3 sm:px-4 py-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground/60 pointer-events-auto">
          {/* Left side */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="text-emerald-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">online</span>
            </span>

            <span className="hidden sm:inline text-muted-foreground/40">Houston, TX</span>

            {/* Visitor count */}
            <span className="w-px h-3 bg-border" />
            <span className="tabular-nums tracking-tight">
              {visitorCount !== null
                ? visitorCount
                    .toString()
                    .padStart(
                      VISITOR_COUNTER_CONFIG.DIGIT_COUNT,
                      VISITOR_COUNTER_CONFIG.PADDING_CHAR,
                    )
                : VISITOR_COUNTER_CONFIG.DEFAULT_DISPLAY}
              <span className="hidden sm:inline"> hits</span>
            </span>

            {/* View toggle */}
            <span className="w-px h-3 bg-border" />
            <div className="flex items-center gap-0 rounded border border-border overflow-hidden">
              {mode === "human" ? (
                <span className="px-1.5 py-0.5 bg-foreground text-background text-[10px]">
                  human
                </span>
              ) : (
                <Link
                  href={`/${lang}`}
                  className="px-1.5 py-0.5 text-[10px] text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-colors"
                >
                  human
                </Link>
              )}
              {mode === "machine" ? (
                <span className="px-1.5 py-0.5 bg-foreground text-background text-[10px]">
                  machine
                </span>
              ) : (
                <Link
                  href={`/${lang}/machine`}
                  className="px-1.5 py-0.5 text-[10px] text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-colors"
                >
                  machine
                </Link>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="hidden sm:inline">&copy; 2026</span>
            <a
              href={LINKS.SITE_SOURCE}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              src
            </a>

            {/* Language select */}
            <span className="w-px h-3 bg-border" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-accent hover:text-foreground transition-colors"
                  aria-label="Select language"
                >
                  <Globe size={12} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="min-w-[120px] font-mono text-xs"
              >
                <DropdownMenuRadioGroup
                  value={lang}
                  onValueChange={(value) => {
                    const segments = pathname.split("/");
                    if (segments.length > 1) {
                      segments[1] = value;
                      router.push(segments.join("/"));
                    }
                  }}
                >
                  <DropdownMenuRadioItem value="en-US">English</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="es-MX">Español</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme select */}
            {mounted && (
              <>
                <span className="w-px h-3 bg-border" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-accent hover:text-foreground transition-colors"
                      aria-label="Select theme"
                    >
                      {theme === "light" ? (
                        <Sun size={12} />
                      ) : theme === "dark" ? (
                        <Moon size={12} />
                      ) : (
                        <Monitor size={12} />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="end"
                    className="min-w-[120px] font-mono text-xs"
                  >
                    <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                      <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
