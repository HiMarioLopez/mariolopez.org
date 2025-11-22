"use client";

import { memo } from "react";
import { LINKS } from "@/lib/constants";

interface IntroductionProps {
  dict: {
    role: string;
    text_part1: string;
    text_part2: string;
    text_part3: string;
    company: string;
    customers: string;
    period: string;
    hiring_prefix: string;
    hiring_link: string;
  };
}

export const Introduction = memo(function Introduction({ dict }: IntroductionProps) {
  return (
    <div className="space-y-4 px-6 sm:px-0">
      <p className="text-xl md:text-lg text-muted-foreground leading-relaxed font-light">
        {dict.text_part1}
        <a
          href={LINKS.VERCEL_CAREERS}
          target="_blank"
          rel="noopener noreferrer"
          className="link-accent"
        >
          {dict.role}
        </a>
        {dict.text_part2}
        <a
          href={LINKS.VERCEL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-foreground/90 underline decoration-dotted decoration-foreground/70 hover:text-foreground hover:decoration-foreground transition-colors font-medium underline-offset-4"
        >
          {dict.company}
        </a>
        {dict.text_part3}
        <a
          href={LINKS.VERCEL_CUSTOMERS}
          target="_blank"
          rel="noopener noreferrer"
          className="link-accent"
        >
          {dict.customers}
        </a>
        {dict.period}
        {dict.hiring_prefix}
        <a
          href={LINKS.VERCEL_FIELD_ENGINEERING}
          target="_blank"
          rel="noopener noreferrer"
          className="link-accent"
        >
          {dict.hiring_link}
        </a>
      </p>
    </div>
  );
});
