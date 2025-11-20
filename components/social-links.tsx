"use client";

import { memo } from "react";
import { Github, Linkedin, Twitter, Music, Bookmark } from "lucide-react";
import { SocialLink } from "./social-link";
import { ResumeDropdown } from "./resume-dropdown";
import { DisabledButton } from "./disabled-button";
import { BlogLink } from "./blog-link";
import { ChaosRecipeLink } from "./chaos-recipe-link";
import { CallToAction } from "./call-to-action";
import { RecentlyPlayed } from "./recently-played";
import { LINKS, PLATFORMS } from "@/lib/constants";
import { useRecentlyPlayed } from "@/lib/hooks/use-recently-played";
import { getPlatformColor } from "@/lib/utils";

interface SocialLinksProps {
  dict: {
    socials_title: string;
    projects_title: string;
    github: string;
    linkedin: string;
    twitter: string;
    now_playing: string;
    blog: string;
    backpocket: string;
    cordstruck: string;
    guesschella: string;
    resume: {
      label: string;
      pdf: string;
      docx: string;
    };
    building: string;
  };
  recentlyPlayedDict: {
    part1: string;
    part2: string;
    part3: string;
    played: string;
  };
  contactDict: {
    text: string;
    email_link_text: string;
    closing: string;
  };
}

export const SocialLinks = memo(function SocialLinks({ dict, recentlyPlayedDict, contactDict }: SocialLinksProps) {
  const { data: recentlyPlayed } = useRecentlyPlayed();
  
  // Get the platform color dynamically, fallback to Spotify green
  const musicIconColor = recentlyPlayed?.platform
    ? getPlatformColor(recentlyPlayed.platform) ?? PLATFORMS.SPOTIFY.color
    : PLATFORMS.SPOTIFY.color;

  return (
    <div className="flex flex-col gap-6 pt-6 px-6 sm:px-0 w-full">
      {/* Socials Section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          {dict.socials_title}
        </h2>
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-3">
          <SocialLink href={LINKS.GITHUB} icon={Github}>
            {dict.github}
          </SocialLink>

          <SocialLink href={LINKS.LINKEDIN} icon={Linkedin}>
            {dict.linkedin}
          </SocialLink>

          <SocialLink href={LINKS.TWITTER} icon={Twitter}>
            {dict.twitter}
          </SocialLink>

          <ResumeDropdown dict={dict.resume} />
        </div>
      </div>

      {/* Projects Section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          {dict.projects_title}
        </h2>
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-3">
          <ChaosRecipeLink />

          <SocialLink href={LINKS.MUSIC} icon={Music} iconColor={musicIconColor}>
            {dict.now_playing}
          </SocialLink>

          <BlogLink />

          <DisabledButton icon={Bookmark} tooltip={dict.building}>
            {dict.backpocket}
          </DisabledButton>

          <DisabledButton
            logo={{
              webp: "/images/CordstruckLogo.webp",
              png: "/images/CordstruckLogo.png",
              alt: "Cordstruck logo",
            }}
            tooltip={dict.building}
          >
            {dict.cordstruck}
          </DisabledButton>

          <DisabledButton
            logo={{
              webp: "/images/GuesschellaLogo.webp",
              png: "/images/GuesschellaLogo.png",
              alt: "Guesschella logo",
            }}
            logoClassName="h-6"
            tooltip={dict.building}
          >
            {dict.guesschella}
          </DisabledButton>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <RecentlyPlayed dict={recentlyPlayedDict} />
        <CallToAction dict={contactDict} />
      </div>
    </div>
  );
});
