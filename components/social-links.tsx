"use client";

import { Github, Linkedin, Twitter, Music, Bookmark, Link } from "lucide-react";
import { SocialLink } from "./social-link";
import { ResumeDropdown } from "./resume-dropdown";
import { DisabledButton } from "./disabled-button";
import { BlogLink } from "./blog-link";
import { ChaosRecipeLink } from "./chaos-recipe-link";
import { CallToAction } from "./call-to-action";
import { RecentlyPlayed } from "./recently-played";
import { LINKS } from "@/lib/constants";

export function SocialLinks() {
  return (
    <div className="flex flex-col gap-6 pt-6 px-6 sm:px-0 w-full">
      {/* Socials Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Socials
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <SocialLink href={LINKS.GITHUB} icon={Github}>
            Github
          </SocialLink>

          <SocialLink href={LINKS.LINKEDIN} icon={Linkedin}>
            LinkedIn
          </SocialLink>

          <SocialLink href={LINKS.TWITTER} icon={Twitter}>
            Twitter
          </SocialLink>

          <ResumeDropdown />
        </div>
      </div>

      {/* Projects Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Projects
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <ChaosRecipeLink />

          <SocialLink href={LINKS.MUSIC} icon={Music}>
            Now Playing
          </SocialLink>

          <BlogLink />

          <DisabledButton icon={Bookmark} tooltip="Building.">
            Backpocket
          </DisabledButton>

          <DisabledButton icon={Link} tooltip="Building.">
            Cordstruck
          </DisabledButton>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <RecentlyPlayed />
        <CallToAction />
      </div>
    </div>
  );
}
