"use client";

import { ChevronDown, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ResumeDropdownProps {
  dict: {
    label: string;
    pdf: string;
    docx: string;
  };
  className?: string;
}

export function ResumeDropdown({ dict, className }: ResumeDropdownProps) {
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [buttonWidth, setButtonWidth] = useState<number | undefined>(undefined);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateButtonWidth = () => {
      if (buttonRef.current) {
        setButtonWidth(buttonRef.current.offsetWidth);
      }
    };

    const timeoutId = setTimeout(updateButtonWidth, 0);
    window.addEventListener("resize", updateButtonWidth);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateButtonWidth);
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsResumeOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsResumeOpen(false);
    }, 150);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResumeOpen(!isResumeOpen);
  };

  return (
    <div
      className={cn("relative inline-block touch-manipulation w-full sm:w-auto", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <DropdownMenu open={isResumeOpen} onOpenChange={setIsResumeOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            ref={(el) => {
              if (el) {
                buttonRef.current = el;
                setButtonWidth(el.offsetWidth);
              }
            }}
            variant="social"
            size="lg"
            className="pointer-events-auto group w-full sm:w-auto justify-between sm:justify-center px-3 sm:px-6"
            onClick={handleClick}
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-5 h-5 grayscale transition-all duration-200 group-hover:grayscale-0 shrink-0" />
              <span className="truncate">{dict.label}</span>
            </div>
            <ChevronDown className="w-5 h-5 grayscale transition-all duration-200 group-hover:grayscale-0 shrink-0 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={0}
          className="bg-background/95 border-border backdrop-blur-sm rounded-t-none border-t-0 shadow-lg p-1 [&>*:first-child]:rounded-t-none [&>*:last-child]:rounded-b-md"
          style={{ width: buttonWidth }}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <DropdownMenuItem asChild>
            <a href={LINKS.RESUME_PDF} className="flex items-center gap-2 cursor-pointer">
              <FileText className="w-4 h-4" />
              {dict.pdf}
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={LINKS.RESUME_DOCX} className="flex items-center gap-2 cursor-pointer">
              <FileText className="w-4 h-4" />
              {dict.docx}
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
