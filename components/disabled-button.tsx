"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface DisabledButtonProps {
  icon?: LucideIcon;
  logo?: {
    webp: string;
    png: string;
    alt: string;
  };
  logoClassName?: string;
  children: ReactNode;
  tooltip: string;
  className?: string;
}

// Ensure at least one of icon or logo is provided
type DisabledButtonPropsWithIcon = DisabledButtonProps & {
  icon: LucideIcon;
  logo?: never;
};
type DisabledButtonPropsWithLogo = DisabledButtonProps & {
  logo: { webp: string; png: string; alt: string };
  icon?: never;
};
type DisabledButtonPropsType =
  | DisabledButtonPropsWithIcon
  | DisabledButtonPropsWithLogo;

export function DisabledButton({
  icon: Icon,
  logo,
  logoClassName,
  children,
  tooltip,
  className,
}: DisabledButtonPropsType) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <div
            className={cn("inline-block touch-manipulation group w-full sm:w-auto", className)}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            <Button
              variant="outline"
              size="lg"
              disabled
              className="bg-background! dark:bg-background! opacity-100! border-yellow-600 border-dashed text-yellow-500 cursor-not-allowed transition-all duration-200 font-medium relative overflow-hidden disabled-button-pattern w-full sm:w-auto px-3 sm:px-6"
              aria-disabled="true"
            >
              <div className="flex items-center justify-center gap-2 relative z-10 pointer-events-none w-full min-w-0">
                {logo ? (
                  <Image
                    src={logo.png}
                    alt={logo.alt}
                    width={32}
                    height={32}
                    className={cn(
                      "h-5 w-auto rounded-sm grayscale transition-all duration-200 group-hover:grayscale-0 shrink-0",
                      open && "grayscale-0",
                      logoClassName
                    )}
                    quality={90}
                  />
                ) : Icon ? (
                  <Icon
                    className={cn(
                      "w-4 h-4 grayscale transition-all duration-200 group-hover:grayscale-0 shrink-0",
                      open && "grayscale-0"
                    )}
                  />
                ) : null}
                <span
                  className={cn(
                    "grayscale transition-all duration-200 group-hover:grayscale-0 truncate",
                    open && "grayscale-0"
                  )}
                >
                  {children}
                </span>
              </div>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
