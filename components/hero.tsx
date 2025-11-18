"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ASCIIText = dynamic(() => import("@/components/ui/ascii-text"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="text-5xl md:text-7xl">👋🤠</div>
    </div>
  ),
});

export function Hero() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    checkMobile();
    setIsMounted(true);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center gap-0">
      <div className="relative w-full flex justify-center items-center h-[250px] md:h-[350px] min-h-[250px] md:min-h-[350px]">
        <div
          className="relative mx-auto w-full h-full"
          style={{ maxWidth: "100%" }}
        >
          {isMounted && (
            <ASCIIText
              text="👋🤠"
              enableWaves={false}
              asciiFontSize={isMobile ? 7 : 9}
              textFontSize={isMobile ? 100 : 150}
              planeBaseHeight={isMobile ? 18 : 25}
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
