import { ThemeToggle } from "@/components/theme-toggle";
import { ViewToggle } from "@/components/view-toggle";
import { Hero } from "@/components/hero";
import { Introduction } from "@/components/introduction";
import { SocialLinks } from "@/components/social-links";
import { Footer } from "@/components/footer";

export default function HumanPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 sm:px-6 md:px-8 relative grid-background">
      <ThemeToggle />
      <ViewToggle />
      <div className="flex-1 flex flex-col w-full max-w-3xl min-h-0">
        <main className="relative z-10 isolate flex flex-col flex-1 justify-center pt-36 pb-12 md:pt-44 md:pb-24">
          <div className="flex flex-col items-center space-y-2">
            <Hero />
            <Introduction />
            <SocialLinks />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
