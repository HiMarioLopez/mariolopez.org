"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface DisabledButtonProps {
  // CHANGE: Accept the component itself or the name, but LucideIcon is the component function
  // When passing from Server Component, we can't pass the function directly if it's not serializable
  // But Lucide icons are functions. We need to be careful.
  // However, the error message says "Only plain objects can be passed to Client Components".
  // Passing a component function (like `Bookmark`) IS passing a function.
  // SOLUTION: Pass the icon as a child or use a specific string key if possible, OR
  // wrap the usage so the Server Component doesn't pass the function directly.
  // ACTUALLY: Lucide icons ARE functional components.
  // We will change this to accept an element or strict props that are serializable.
  // But `Bookmark` is an import.
  // The issue is passing `icon={Bookmark}` from a Server Component (SocialLinks) to a Client Component (DisabledButton).
  // Functions cannot be passed.
  // We should pass `children` with the icon already rendered, OR render the icon inside the Client Component if we pass a string key.
  // For now, let's use `children` for the icon as well or just pass the rendered element.

  // Let's try passing the icon as a React Element (ReactNode) instead of the component function.
  icon?: ReactNode;
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
  icon: ReactNode;
  logo?: never;
};
type DisabledButtonPropsWithLogo = DisabledButtonProps & {
  logo: { webp: string; png: string; alt: string };
  icon?: never;
};
type DisabledButtonPropsType = DisabledButtonPropsWithIcon | DisabledButtonPropsWithLogo;

export function DisabledButton({
  icon,
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
                      "h-6 w-auto rounded-sm grayscale transition-all duration-200 group-hover:grayscale-0 shrink-0",
                      open && "grayscale-0",
                      logoClassName,
                    )}
                    quality={90}
                  />
                ) : icon ? (
                  // Render the passed icon element directly
                  <span
                    className={cn(
                      "flex items-center justify-center transition-all duration-200 grayscale group-hover:grayscale-0 [&>svg]:w-5 [&>svg]:h-5",
                      open && "grayscale-0",
                    )}
                  >
                    {icon}
                  </span>
                ) : null}
                <span
                  className={cn(
                    "grayscale transition-all duration-200 group-hover:grayscale-0 truncate",
                    open && "grayscale-0",
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
