"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  content: string;
}

export function CopyButton({ content }: CopyButtonProps) {
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

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className="gap-1.5 sm:gap-2 font-mono text-xs px-2.5 sm:px-3 bg-background dark:bg-background"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="size-3 shrink-0" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="size-3 shrink-0" />
          Copy
        </>
      )}
    </Button>
  );
}

