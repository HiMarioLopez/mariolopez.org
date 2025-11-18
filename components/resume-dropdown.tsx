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

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <DropdownMenu open={isResumeOpen} modal={false}>
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
            className="pointer-events-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <FileText className="w-4 h-4" />
            Resume
            <ChevronDown className="w-4 h-4" />
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
              href="docs/Resume.pdf"
              className="flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              PDF
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href="docs/Resume.docx"
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

