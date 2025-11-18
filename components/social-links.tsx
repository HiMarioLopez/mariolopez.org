"use client";

import { Github, Linkedin, Music, Bookmark, Link } from "lucide-react";
import { SocialLink } from "./social-link";
import { ResumeDropdown } from "./resume-dropdown";
import { DisabledButton } from "./disabled-button";
import { BlogLink } from "./blog-link";

export function SocialLinks() {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-6 px-6 sm:px-0">
      <SocialLink href="https://github.com/HiMarioLopez" icon={Github}>
        Github
      </SocialLink>

      <SocialLink href="https://www.linkedin.com/in/HiMarioLopez/" icon={Linkedin}>
        LinkedIn
      </SocialLink>

      <ResumeDropdown />

      <SocialLink href="https://music.mariolopez.org" icon={Music}>
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
  );
}

