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
}

// Ensure at least one of icon or logo is provided
type DisabledButtonPropsWithIcon = DisabledButtonProps & { icon: LucideIcon; logo?: never };
type DisabledButtonPropsWithLogo = DisabledButtonProps & { logo: { webp: string; png: string; alt: string }; icon?: never };
type DisabledButtonPropsType = DisabledButtonPropsWithIcon | DisabledButtonPropsWithLogo;

export function DisabledButton({
  icon: Icon,
  logo,
  logoClassName,
  children,
  tooltip,
}: DisabledButtonPropsType) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <div 
            className="inline-block touch-manipulation group"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            <Button
              variant="outline"
              size="lg"
              disabled
              className="bg-background! dark:bg-background! opacity-100! border-yellow-600 border-dashed text-yellow-500 cursor-not-allowed transition-all duration-200 font-medium relative overflow-hidden disabled-button-pattern"
              aria-disabled="true"
            >
              <div className="flex items-center gap-2 relative z-10 pointer-events-none">
                {logo ? (
                  <Image
                    src={logo.png}
                    alt={logo.alt}
                    width={32}
                    height={32}
                    className={cn("h-5 w-auto rounded-sm grayscale transition-all duration-200 group-hover:grayscale-0 group-active:grayscale-0", logoClassName)}
                    quality={90}
                  />
                ) : Icon ? (
                  <Icon className="w-4 h-4" />
                ) : null}
                {children}
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
