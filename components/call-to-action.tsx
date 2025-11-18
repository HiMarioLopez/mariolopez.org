"use client";

import { LINKS } from "@/lib/constants";

export function CallToAction() {
  return (
    <p className="text-xl md:text-lg text-muted-foreground leading-relaxed font-light px-6 sm:px-0">
      I love to advise, mentor, and help - specifically rising college students
      and early-career tech professionals. If you're in Houston, let's grab some
      coffee. If you're not, happy to hop on a call.{" "}
      <a href={LINKS.EMAIL_HUMAN} className="link-accent">
        Hit me up
      </a>
      , I don't bite!
    </p>
  );
}
