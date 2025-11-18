"use client";

import ASCIIText from "@/components/ui/ascii-text";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
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
            asciiFontSize={4}
            textFontSize={80}
            planeBaseHeight={25}
            enableMouseInteraction={true}
          />
        </div>
      </button>
    </div>
  );
}

