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
        I mentor students and early-career professionals and speak at events. In
        Houston? Let's grab a coffee. Elsewhere? Conversation can flow through the
        wire.{" "}
        <a href={LINKS.EMAIL_HUMAN} className="link-accent">
          Hit me up
        </a>{" "}
        - I don't bite!
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
