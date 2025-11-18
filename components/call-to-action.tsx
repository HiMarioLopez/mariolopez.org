"use client";

import { LINKS } from "@/lib/constants";

export function CallToAction() {
  return (
    <p className="text-xl md:text-lg text-muted-foreground leading-relaxed font-light">
      I love to advise, mentor, and help - specifically rising college students
      and early-career tech professionals. I'm also passionate about presenting
      and public speaking, and I'm open to speaking engagements at conferences,
      meetups, and events. If you're in Houston, let's grab some coffee. If
      you're not, happy to hop on a call.{" "}
      <a href={LINKS.EMAIL_HUMAN} className="link-accent">
        Hit me up
      </a>
      , I don't bite!
    </p>
  );
}
