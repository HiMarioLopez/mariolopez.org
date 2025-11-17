"use client";

import { Button } from "@/components/ui/button";
import {
  Github,
  Linkedin,
  FileText,
  Music,
  PenTool,
  AlertTriangle,
} from "lucide-react";
import ASCIIText from "@/components/ui/ascii-text";
import { useTheme } from "next-themes";

// Build timestamp - evaluated at build time
const buildDate = new Date();
const BUILD_TIMESTAMP = buildDate.toLocaleString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

export default function Home() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 relative grid-background">
      <div className="fixed bottom-6 left-6 z-50">
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
      <main className="max-w-3xl w-full relative z-10 isolate">
        <div className="flex flex-col items-center space-y-2">
          <div className="relative w-full flex flex-col items-center gap-0">
            <div
              className="relative w-full flex justify-center items-center"
              style={{ height: "350px" }}
            >
              <div
                className="relative mx-auto w-full h-full"
                style={{ maxWidth: "100%" }}
              >
                <ASCIIText
                  text="👋🤠"
                  enableWaves={false}
                  asciiFontSize={9}
                  textFontSize={150}
                  planeBaseHeight={25}
                  enableMouseInteraction={false}
                />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-mono text-start w-full mx-auto -mt-2">
              Howdy hey, I'm Mario.
            </h1>
          </div>
          <div className="space-y-4">
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light">
              I'm a{" "}
              <a
                href="https://vercel.com/careers/platform-architect-5176710004"
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent"
              >
                Platform Architect
              </a>
              , working with some brilliant folks at{" "}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-foreground underline decoration-dotted decoration-foreground hover:text-muted-foreground hover:decoration-muted-foreground transition-colors font-medium"
              >
                ▲ Vercel
              </a>
              , solving the most challenging problems in the industry for our
              wonderful{" "}
              <a
                href="https://vercel.com/customers"
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent"
              >
                customers
              </a>
              .
            </p>

            <p className="text-lg md:text-xl text-muted-foreground font-light">
              <a href="mailto:contact@mariolopez.org" className="link-accent">
                Hit me up
              </a>
              , I don't bite!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-6">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="bg-background/85 border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 font-medium"
            >
              <a
                href="https://github.com/HiMarioLopez"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                Github
              </a>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="bg-background/85 border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 font-medium"
            >
              <a
                href="https://www.linkedin.com/in/HiMarioLopez/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="bg-background/85 border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 font-medium"
            >
              <a href="docs/Resume.pdf" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Resume (PDF)
              </a>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="bg-background/85 border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 font-medium"
            >
              <a href="docs/Resume.docx" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Resume (DOCX)
              </a>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="bg-background/85 border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 font-medium"
            >
              <a
                href="https://music.mariolopez.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Music className="w-4 h-4" />
                Now Playing
              </a>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="bg-background/85 border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 font-medium group relative"
            >
              <a
                href="https://bolognese.mariolopez.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <PenTool className="w-4 h-4" />
                <span className="relative">
                  Bolognese
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-foreground text-background px-3 py-1.5 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-95 transition-all duration-200 delay-75 pointer-events-none z-50 shadow-lg">
                    My Blog
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-foreground"></span>
                  </span>
                </span>
              </a>
            </Button>

            <Button
              variant="outline"
              size="lg"
              disabled
              className="bg-transparent border-yellow-600 border-dashed text-yellow-500 opacity-60 cursor-not-allowed transition-all duration-200 font-medium relative overflow-hidden group"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(234, 179, 8, 0.1) 10px, rgba(234, 179, 8, 0.1) 20px)",
              }}
            >
              <div className="flex items-center gap-2 relative z-10 pointer-events-none">
                <AlertTriangle className="w-4 h-4" />
                Backpocket
              </div>
            </Button>
          </div>
        </div>
      </main>

      <footer className="mt-auto md:mt-0 md:absolute md:bottom-0 md:left-0 md:right-0 py-8 text-muted-foreground text-sm relative z-10 text-center">
        <div>© 2025, Mario Lopez Martinez.</div>
        <div className="mt-2">
          <span className="text-muted-foreground/80">
            Last updated {BUILD_TIMESTAMP}.
          </span>{" "}
          <a
            href="https://github.com/HiMarioLopez"
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent"
          >
            Source
          </a>
          .
        </div>
      </footer>
    </div>
  );
}
