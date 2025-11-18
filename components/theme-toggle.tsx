"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  if (!mounted) {
    return (
      <div className="fixed bottom-3 right-3 z-50">
        <button
          className="w-16 h-16 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:scale-110 transition-transform cursor-pointer"
          aria-label="Toggle theme"
          disabled
        >
          <span className="text-3xl">💡</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-3 right-3 z-50">
      <button
        onClick={toggleTheme}
        className="w-16 h-16 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        <span
          className="text-3xl transition-transform duration-300 group-hover:rotate-12"
          role="img"
          aria-hidden="true"
        >
          {theme === "dark" ? "💡" : "🌙"}
        </span>
      </button>
    </div>
  );
}
