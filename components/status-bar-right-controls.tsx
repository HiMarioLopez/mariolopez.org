"use client";

import { Globe, Monitor, Moon, Sun } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LINKS, STATUS_BAR_IDS } from "@/lib/constants";

interface StatusBarRightControlsProps {
  lang: string;
  autoLabel: string;
  lightLabel: string;
  darkLabel: string;
  ariaToggleTheme: string;
  languageLabel: string;
  ariaToggleLanguage: string;
}

export function StatusBarRightControls({
  lang,
  autoLabel,
  lightLabel,
  darkLabel,
  ariaToggleTheme,
  languageLabel,
  ariaToggleLanguage,
}: StatusBarRightControlsProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const resolvedTheme = theme ?? "system";
  const themeTriggerId = `${STATUS_BAR_IDS.THEME_TRIGGER}-${lang}`;
  const themeMenuId = `${STATUS_BAR_IDS.THEME_MENU}-${lang}`;
  const languageTriggerId = `${STATUS_BAR_IDS.LANGUAGE_TRIGGER}-${lang}`;
  const languageMenuId = `${STATUS_BAR_IDS.LANGUAGE_MENU}-${lang}`;

  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          id={themeTriggerId}
          type="button"
          className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-accent hover:text-foreground transition-colors"
          aria-label={ariaToggleTheme}
        >
          {resolvedTheme === "light" ? (
            <Sun size={12} />
          ) : resolvedTheme === "dark" ? (
            <Moon size={12} />
          ) : (
            <Monitor size={12} />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          id={themeMenuId}
          side="top"
          align="end"
          className="min-w-[100px] font-mono text-[11px] text-muted-foreground"
        >
          <DropdownMenuRadioGroup value={resolvedTheme} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="system">{autoLabel}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="light">{lightLabel}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">{darkLabel}</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="w-px h-3 bg-border" />

      <DropdownMenu>
        <DropdownMenuTrigger
          id={languageTriggerId}
          type="button"
          className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-accent hover:text-foreground transition-colors"
          aria-label={ariaToggleLanguage}
          title={languageLabel}
        >
          <Globe size={12} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          id={languageMenuId}
          side="top"
          align="end"
          className="min-w-[100px] font-mono text-[11px] text-muted-foreground"
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

      <span className="w-px h-3 bg-border" />
      <span className="hidden sm:inline">&copy; 2026</span>
      <a
        href={LINKS.SITE_SOURCE}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground transition-colors"
      >
        src
      </a>
    </div>
  );
}
