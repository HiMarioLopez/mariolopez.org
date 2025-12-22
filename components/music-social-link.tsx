"use client";

import { Music } from "lucide-react";
import { memo } from "react";
import { LINKS, PLATFORMS } from "@/lib/constants";
import { useRecentlyPlayed } from "@/lib/hooks/use-recently-played";
import { getPlatformColor } from "@/lib/utils";
import { SocialLink } from "./social-link";

interface MusicSocialLinkProps {
  children: React.ReactNode;
}

export const MusicSocialLink = memo(function MusicSocialLink({ children }: MusicSocialLinkProps) {
  const { data: recentlyPlayed } = useRecentlyPlayed();

  const musicIconColor = recentlyPlayed?.platform
    ? (getPlatformColor(recentlyPlayed.platform) ?? PLATFORMS.SPOTIFY.color)
    : PLATFORMS.SPOTIFY.color;

  return (
    <SocialLink href={LINKS.MUSIC} icon={Music} iconColor={musicIconColor}>
      {children}
    </SocialLink>
  );
});
