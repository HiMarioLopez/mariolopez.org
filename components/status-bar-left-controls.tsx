import Link from "next/link";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AVAILABILITY_DISPLAY,
  AVAILABILITY_STATUSES,
  type AvailabilityStatus,
  STATUS_BAR_IDS,
  VISITOR_COUNTER_CONFIG,
} from "@/lib/constants";

type StatusBarLocale = "en-US" | "es-MX";

interface StatusBarLeftControlsProps {
  lang: string;
  mode: "human" | "machine";
  locale: StatusBarLocale;
  availabilityStatus: AvailabilityStatus;
  visitorCount: number | null;
  humanLabel: string;
  machineLabel: string;
  ariaSwitchHuman: string;
  ariaSwitchMachine: string;
}

export function StatusBarLeftControls({
  lang,
  mode,
  locale,
  availabilityStatus,
  visitorCount,
  humanLabel,
  machineLabel,
  ariaSwitchHuman,
  ariaSwitchMachine,
}: StatusBarLeftControlsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const display = AVAILABILITY_DISPLAY[availabilityStatus];
  const visitorCountDisplay =
    visitorCount !== null
      ? visitorCount
          .toString()
          .padStart(VISITOR_COUNTER_CONFIG.DIGIT_COUNT, VISITOR_COUNTER_CONFIG.PADDING_CHAR)
      : VISITOR_COUNTER_CONFIG.DEFAULT_DISPLAY;
  const availabilityPopoverId = `${STATUS_BAR_IDS.AVAILABILITY_POPOVER}-${lang}-${mode}`;
  const availabilityTriggerId = `${availabilityPopoverId}-trigger`;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const availabilityButton = (
    <button
      id={availabilityTriggerId}
      type="button"
      className={`${display.textClass} flex items-center gap-1.5 rounded-sm px-1 py-0.5 cursor-pointer transition-colors transition-opacity hover:bg-accent/40 hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border/70`}
      aria-controls={availabilityPopoverId}
      aria-label={
        locale === "es-MX" ? "Ver horarios de disponibilidad" : "View availability schedule"
      }
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${display.dotClass}${display.pulse ? " animate-pulse" : ""}`}
      />
      <span className="hidden sm:inline">{display.label[locale].toLocaleLowerCase(locale)}</span>
    </button>
  );

  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      {isMounted ? (
        <Popover>
          <PopoverTrigger asChild>{availabilityButton}</PopoverTrigger>
          <PopoverContent
            id={availabilityPopoverId}
            side="top"
            align="start"
            sideOffset={8}
            className="w-[220px] p-0 font-mono"
          >
            <div className="px-3 pt-2.5 pb-1.5 border-b border-border">
              <span className="text-[10px] uppercase tracking-widest text-text-tertiary">
                {locale === "es-MX" ? "Disponibilidad" : "Availability"}
              </span>
            </div>
            <div className="px-3 py-2 space-y-2.5">
              {AVAILABILITY_STATUSES.map((key) => {
                const status = AVAILABILITY_DISPLAY[key];
                const isActive = key === availabilityStatus;

                return (
                  <div key={key} className="flex items-start gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-[5px] shrink-0 ${status.dotClass}${status.pulse ? " animate-pulse" : ""}`}
                    />
                    <div className="min-w-0">
                      <div className={`text-[11px] font-medium leading-tight ${status.textClass}`}>
                        {status.label[locale]}
                        {isActive && (
                          <span className="ml-1.5 text-[9px] text-text-tertiary font-normal">
                            ←
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-text-tertiary leading-snug mt-px">
                        {status.desc[locale]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-3 pt-1 pb-2 border-t border-border">
              <span className="text-[10px] text-text-tertiary">
                {locale === "es-MX" ? "Horarios en hora central (CT)" : "All times Central US"}
              </span>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        availabilityButton
      )}

      <span className="hidden sm:inline text-text-tertiary">Houston, TX</span>

      <span className="w-px h-3 bg-border" />
      <span className="tabular-nums tracking-tight">
        {visitorCountDisplay}
        <span className="hidden sm:inline"> hits</span>
      </span>

      <span className="w-px h-3 bg-border" />
      <div className="flex items-center gap-0 rounded border border-border overflow-hidden">
        {mode === "human" ? (
          <span className="px-1.5 py-0.5 bg-foreground text-background text-[10px]">
            {humanLabel}
          </span>
        ) : (
          <Link
            href={`/${lang}`}
            aria-label={ariaSwitchHuman}
            className="px-1.5 py-0.5 text-[10px] text-text-tertiary hover:text-foreground hover:bg-accent transition-colors"
          >
            {humanLabel}
          </Link>
        )}
        {mode === "machine" ? (
          <span className="px-1.5 py-0.5 bg-foreground text-background text-[10px]">
            {machineLabel}
          </span>
        ) : (
          <Link
            href={`/${lang}/machine`}
            aria-label={ariaSwitchMachine}
            className="px-1.5 py-0.5 text-[10px] text-text-tertiary hover:text-foreground hover:bg-accent transition-colors"
          >
            {machineLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
