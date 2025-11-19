"use client";

import dynamic from "next/dynamic";
import { HERO_CONFIG } from "@/lib/constants";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

const ASCIIText = dynamic(() => import("@/components/ui/ascii-text"), {
  ssr: false,
});

export function Hero() {
  const isMobile = useMediaQuery("SM");

  return (
    <div className="relative w-full flex flex-col items-center gap-0">
      <div
        className="relative w-full flex justify-center items-center md:-mt-8"
        // Data attributes used by CSS to set responsive height immediately
        // This prevents CLS by setting height before JS runs
        data-mobile-height={HERO_CONFIG.MOBILE_HEIGHT}
        data-desktop-height={HERO_CONFIG.DESKTOP_HEIGHT}
      >
        <div
          className="relative mx-auto w-full h-full"
          style={{ maxWidth: "100%" }}
        >
          <ASCIIText
            text="👋🤠"
            enableWaves={false}
            asciiFontSize={
              isMobile
                ? HERO_CONFIG.MOBILE_ASCII_FONT_SIZE
                : HERO_CONFIG.DESKTOP_ASCII_FONT_SIZE
            }
            textFontSize={
              isMobile
                ? HERO_CONFIG.MOBILE_TEXT_FONT_SIZE
                : HERO_CONFIG.DESKTOP_TEXT_FONT_SIZE
            }
            planeBaseHeight={
              isMobile
                ? HERO_CONFIG.MOBILE_PLANE_BASE_HEIGHT
                : HERO_CONFIG.DESKTOP_PLANE_BASE_HEIGHT
            }
            enableMouseInteraction={false}
          />
        </div>
      </div>
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight font-mono text-start w-full mx-auto -mt-2 px-6 sm:px-0">
        Howdy hey, I'm Mario.
      </h1>
    </div>
  );
}
