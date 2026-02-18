"use client";

import Image from "next/image";
import { CopyButton } from "@/components/copy-button";
import { MachineContentDisplay } from "@/components/machine-content-display";
import { useRecentlyPlayedSection } from "@/components/machine-recently-played";
import { StatusBar } from "@/components/status-bar";
import { LINKS, LLM_PROVIDER_LINKS, LLM_PROVIDER_LOGOS } from "@/lib/constants";

interface MachinePageClientProps {
  contentBefore: string;
  contentAfter: string;
  lang: "en-US" | "es-MX";
  recentlyPlayedTemplate: string;
  dict: {
    copy_button: {
      label: string;
      copied: string;
      aria_label: string;
      open_in_aria_template?: string;
    };
    view_toggle: {
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
      music: {
        now_playing: string;
        recently_played: string;
        played: string;
        open_track: string;
        unknown_duration: string;
      };
    };
  };
}

const LLM_PROVIDER_ITEMS = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    href: LINKS.CHATGPT,
    logoSrc: LLM_PROVIDER_LOGOS.CHATGPT,
    logoClassName: "h-3.5 w-3.5",
  },
  {
    id: "gemini",
    name: "Gemini",
    href: LINKS.GEMINI,
    logoSrc: LLM_PROVIDER_LOGOS.GEMINI,
    logoClassName: "h-3.5 w-3.5",
  },
  {
    id: "claude",
    name: "Claude",
    href: LINKS.CLAUDE,
    logoSrc: LLM_PROVIDER_LOGOS.CLAUDE,
    logoClassName: "h-3.5 w-3.5",
  },
  {
    id: "grok",
    name: "Grok",
    href: LINKS.GROK,
    logoSrc: LLM_PROVIDER_LOGOS.GROK,
    logoClassName: "h-3.5 w-3.5 dark:invert",
  },
] as const;

type LlmProviderItem = (typeof LLM_PROVIDER_ITEMS)[number];

function buildProviderLaunchUrl(provider: LlmProviderItem, prompt: string): string {
  if (provider.id !== "chatgpt") {
    return provider.href;
  }

  try {
    const url = new URL(provider.href);
    url.searchParams.set(LLM_PROVIDER_LINKS.CHATGPT_PROMPT_PARAM, prompt);
    const withPrompt = url.toString();

    if (withPrompt.length > LLM_PROVIDER_LINKS.CHATGPT_PROMPT_MAX_URL_LENGTH) {
      return provider.href;
    }

    return withPrompt;
  } catch {
    return provider.href;
  }
}

export function MachinePageClient({
  contentBefore,
  contentAfter,
  lang,
  recentlyPlayedTemplate,
  dict,
}: MachinePageClientProps) {
  const { content: recentlyPlayedSection } = useRecentlyPlayedSection(recentlyPlayedTemplate);

  const fullContent = contentBefore + recentlyPlayedSection + contentAfter;
  const openInAriaTemplate = dict.copy_button.open_in_aria_template ?? "Open in %provider%";

  const handleOpenInProvider = (provider: LlmProviderItem) => {
    // Keep the machine payload ready for paste when launching a provider.
    void navigator.clipboard.writeText(fullContent).catch(() => {
      // Clipboard may fail if permission is denied; still open destination.
    });

    const destinationUrl = buildProviderLaunchUrl(provider, fullContent);
    window.open(destinationUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono antialiased">
      <div className="flex min-h-screen items-center justify-center px-6 pb-6 pt-20 sm:px-8 sm:pb-8 sm:pt-24">
        <div className="max-w-[680px] w-full">
          <MachineContentDisplay
            contentBefore={contentBefore}
            contentAfter={contentAfter}
            recentlyPlayedTemplate={recentlyPlayedTemplate}
          />
          <div className="h-36 sm:h-20" />
        </div>
      </div>

      {/* Copy button fixed top center */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70]">
        <div className="relative isolate">
          <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-background/90 p-1 shadow-sm backdrop-blur-md">
            <CopyButton
              content={fullContent}
              dict={dict.copy_button}
              className="h-7 rounded-md border-border/70 bg-background/70 px-2.5 py-1 text-[10px] text-muted-foreground/70 hover:text-foreground"
            />
            <span aria-hidden="true" className="mx-1 h-4 w-px shrink-0 bg-border/70" />
            <div className="flex items-center gap-1">
              {LLM_PROVIDER_ITEMS.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  aria-label={openInAriaTemplate.replace("%provider%", provider.name)}
                  onClick={() => handleOpenInProvider(provider)}
                  className="group relative inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/70 bg-background/70 transition-colors hover:border-muted-foreground/70 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
                >
                  <Image
                    src={provider.logoSrc}
                    alt=""
                    width={14}
                    height={14}
                    aria-hidden="true"
                    className={provider.logoClassName}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border/70 bg-background/95 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    {openInAriaTemplate.replace("%provider%", provider.name)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <StatusBar lang={lang} mode="machine" dict={dict.view_toggle} />
    </div>
  );
}
