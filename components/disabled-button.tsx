"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface DisabledButtonProps {
  icon: LucideIcon;
  children: ReactNode;
  tooltip: string;
}

export function DisabledButton({
  icon: Icon,
  children,
  tooltip,
}: DisabledButtonProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">
            <Button
              variant="outline"
              size="lg"
              disabled
              className="bg-background! dark:bg-background! opacity-100! border-yellow-600 border-dashed text-yellow-500 cursor-not-allowed transition-all duration-200 font-medium relative overflow-hidden disabled-button-pattern"
            >
              <div className="flex items-center gap-2 relative z-10 pointer-events-none">
                <Icon className="w-4 h-4" />
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
