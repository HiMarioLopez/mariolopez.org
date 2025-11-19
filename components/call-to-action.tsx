"use client";

import { LINKS } from "@/lib/constants";

export function CallToAction() {
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
