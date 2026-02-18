"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  content: string;
  className?: string;
  dict?: {
    label: string;
    copied: string;
    aria_label: string;
  };
}

export function CopyButton({ content, className, dict }: CopyButtonProps) {
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
    <button
      onClick={handleCopy}
      type="button"
      className={cn(
        "flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-2 text-[10px] font-mono text-text-tertiary hover:text-foreground transition-colors",
        className,
      )}
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
    </button>
  );
}
