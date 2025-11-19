"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, ChevronDown } from "lucide-react";
import { LINKS } from "@/lib/constants";

export function ResumeDropdown() {
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
      className="relative inline-block touch-manipulation"
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
            className="pointer-events-auto group"
            onClick={handleClick}
          >
            <FileText className="w-4 h-4 grayscale transition-all duration-200 group-hover:grayscale-0" />
            Resume
            <ChevronDown className="w-4 h-4 grayscale transition-all duration-200 group-hover:grayscale-0" />
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
            <a
              href={LINKS.RESUME_PDF}
              className="flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              PDF
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={LINKS.RESUME_DOCX}
              className="flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              DOCX
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
