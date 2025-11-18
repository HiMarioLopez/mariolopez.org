"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { BREAKPOINTS, HERO_CONFIG } from "@/lib/constants";

const ASCIIText = dynamic(() => import("@/components/ui/ascii-text"), {
  ssr: false,
});

export function Hero() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.SM);
    };

    checkMobile();
    setIsMounted(true);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center gap-0">
      <div
        className="relative w-full flex justify-center items-center"
        style={{
          height: isMobile
            ? `${HERO_CONFIG.MOBILE_HEIGHT}px`
            : `${HERO_CONFIG.DESKTOP_HEIGHT}px`,
          minHeight: isMobile
            ? `${HERO_CONFIG.MOBILE_HEIGHT}px`
            : `${HERO_CONFIG.DESKTOP_HEIGHT}px`,
        }}
      >
        <div
          className="relative mx-auto w-full h-full"
          style={{ maxWidth: "100%" }}
        >
          {isMounted && (
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
          )}
        </div>
      </div>
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight font-mono text-start w-full mx-auto -mt-2 px-6 sm:px-0">
        Howdy hey, I'm Mario.
      </h1>
    </div>
  );
}
