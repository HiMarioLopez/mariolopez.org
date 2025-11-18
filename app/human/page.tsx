import { ThemeToggle } from "@/components/theme-toggle";
import { ViewToggle } from "@/components/view-toggle";
import { Hero } from "@/components/hero";
import { Introduction } from "@/components/introduction";
import { SocialLinks } from "@/components/social-links";
import { Footer } from "@/components/footer";
import { getRecentlyPlayed } from "@/lib/recently-played";

// Note: Must be a literal number for Next.js segment config (see CACHE_CONFIG.REVALIDATE_SECONDS)
export const revalidate = 60;

export default async function HumanPage() {
  const recentlyPlayed = await getRecentlyPlayed();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 sm:px-6 md:px-8 relative grid-background">
      <ThemeToggle />
      <ViewToggle />
      <div className="flex-1 flex flex-col w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-20">
        <main className="relative z-10 isolate flex-1 flex flex-col py-8 pb-12 md:py-12 md:min-h-[calc(100vh-200px)] md:justify-center md:pb-12">
          <div className="flex flex-col items-center space-y-2">
            <Hero />
            <Introduction recentlyPlayed={recentlyPlayed} />
            <SocialLinks />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
