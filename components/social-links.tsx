"use client";

import { Github, Linkedin, Music, Bookmark, Link } from "lucide-react";
import { SocialLink } from "./social-link";
import { ResumeDropdown } from "./resume-dropdown";
import { DisabledButton } from "./disabled-button";
import { BlogLink } from "./blog-link";
import { ChaosRecipeLink } from "./chaos-recipe-link";
import { LINKS } from "@/lib/constants";

export function SocialLinks() {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-6 px-6 sm:px-0">
      <SocialLink href={LINKS.GITHUB} icon={Github}>
        Github
      </SocialLink>

      <SocialLink href={LINKS.LINKEDIN} icon={Linkedin}>
        LinkedIn
      </SocialLink>

      <ResumeDropdown />

      <SocialLink href={LINKS.MUSIC} icon={Music}>
        Now Playing
      </SocialLink>

      <BlogLink />

      <ChaosRecipeLink />

      <DisabledButton icon={Bookmark} tooltip="Building.">
        Backpocket
      </DisabledButton>

      <DisabledButton icon={Link} tooltip="Building.">
        Cordstruck
      </DisabledButton>
    </div>
  );
}
