"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const ASCIIText = dynamic(() => import("@/components/ui/ascii-text"), {
  ssr: false,
});

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    // Cycle through: system -> light -> dark -> system
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  return (
    <div className="fixed bottom-3 right-3 z-50">
      <button
        onClick={toggleTheme}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        aria-label="Toggle theme"
      >
        <div
          className="relative w-16 h-16 flex items-center justify-center"
          style={{ maxWidth: "64px", maxHeight: "64px" }}
        >
          <ASCIIText
            text="💡"
            enableWaves={false}
            asciiFontSize={2}
            textFontSize={80}
            planeBaseHeight={25}
            enableMouseInteraction={true}
          />
        </div>
      </button>
    </div>
  );
}
