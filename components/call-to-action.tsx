"use client";

import { LINKS } from "@/lib/constants";

interface CallToActionProps {
  dict?: {
    text: string;
    email_link_text: string;
    closing: string;
  };
}

export function CallToAction({ dict }: CallToActionProps) {
  if (!dict) {
    return (
      <p className="text-xl md:text-lg text-muted-foreground leading-relaxed font-light">
        Want to chat or work together?{" "}
        <a href={LINKS.EMAIL_HUMAN} className="link-accent">
          Reach out
        </a>{" "}
        — I'd love to hear from you.
      </p>
    );
  }

  return (
    <p className="text-xl md:text-lg text-muted-foreground leading-relaxed font-light">
      {dict.text}{" "}
      <a href={LINKS.EMAIL_HUMAN} className="link-accent">
        {dict.email_link_text}
      </a>{" "}
      {dict.closing}
    </p>
  );
}
