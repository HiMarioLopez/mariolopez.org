import { HeroVisuals } from "@/components/hero-visuals";

interface HeroProps {
  dict: {
    greeting: string;
  };
}

export function Hero({ dict }: HeroProps) {
  return (
    <div className="relative w-full flex flex-col items-center gap-0">
      <HeroVisuals />
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight font-mono text-start w-full mx-auto -mt-2 px-6 sm:px-0">
        {dict.greeting}
      </h1>
    </div>
  );
}
