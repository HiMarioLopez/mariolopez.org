"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LINKS } from "@/lib/constants";

interface StatusBarProps {
  lang: string;
  mode: "human" | "machine";
}

export function StatusBar({ lang, mode }: StatusBarProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const themeOptions = [
    { value: "system", label: "sys" },
    { value: "light", label: "lgt" },
    { value: "dark", label: "drk" },
  ] as const;

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

            {/* Language toggle */}
            <span className="w-px h-3 bg-border" />
            <div className="flex items-center gap-0 rounded border border-border overflow-hidden">
              {(
                [
                  { value: "en-US", label: "en" },
                  { value: "es-MX", label: "es" },
                ] as const
              ).map((opt) => {
                const isActive = lang === opt.value;
                return isActive ? (
                  <span
                    key={opt.value}
                    className="px-1.5 py-0.5 bg-foreground text-background text-[10px]"
                  >
                    {opt.label}
                  </span>
                ) : (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      const segments = pathname.split("/");
                      if (segments.length > 1) {
                        segments[1] = opt.value;
                        router.push(segments.join("/"));
                      }
                    }}
                    className="px-1.5 py-0.5 text-[10px] text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Theme toggle */}
            {mounted && (
              <>
                <span className="w-px h-3 bg-border" />
                <div className="flex items-center gap-0 rounded border border-border overflow-hidden">
                  {themeOptions.map((opt) => {
                    const isActive = theme === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTheme(opt.value)}
                        className={`px-1.5 py-0.5 transition-colors text-[10px] ${
                          isActive
                            ? "bg-foreground text-background"
                            : "text-muted-foreground/60 hover:text-foreground hover:bg-accent"
                        }`}
                        aria-label={`Switch to ${opt.value} theme`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
