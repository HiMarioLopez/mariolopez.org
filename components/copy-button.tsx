"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  content: string;
  dict?: {
    label: string;
    copied: string;
    aria_label: string;
  };
}

export function CopyButton({ content, dict }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Defaults if dict is not provided
  const label = dict?.label ?? "Copy";
  const copiedLabel = dict?.copied ?? "Copied!";
  const ariaLabel = dict?.aria_label ?? "Copy to clipboard";

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className="gap-1.5 sm:gap-2 font-mono text-xs px-2.5 sm:px-3 bg-background dark:bg-background"
      aria-label={ariaLabel}
    >
      {copied ? (
        <>
          <Check className="size-3 shrink-0" />
          {copiedLabel}
        </>
      ) : (
        <>
          <Copy className="size-3 shrink-0" />
          {label}
        </>
      )}
    </Button>
  );
}
