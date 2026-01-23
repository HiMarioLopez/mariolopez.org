"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BackpocketLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="social"
      size="lg"
      className={cn("w-full sm:w-auto px-3 sm:px-6", className)}
      asChild
    >
      <a
        href={LINKS.BACKPOCKET}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 group"
      >
        <Image
          src="/images/BackpocketLogo.png"
          alt="Backpocket logo"
          width={64}
          height={64}
          className="h-6 w-auto rounded-sm icon-grayscale-hover shrink-0"
          quality={90}
        />
        <span className="truncate">{children}</span>
      </a>
    </Button>
  );
}
