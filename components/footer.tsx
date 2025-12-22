import { VisitorCounter } from "@/components/visitor-counter";
import { BUILD_CONFIG } from "@/lib/config";
import { LINKS } from "@/lib/constants";

interface FooterProps {
  dict: {
    copyright: string;
    source: string;
    last_updated: string;
    visitors: string;
  };
}

export function Footer({ dict }: FooterProps) {
  return (
    <footer className="relative mt-auto py-6 md:py-8 text-muted-foreground text-sm z-10 text-center w-full">
      <div className="flex flex-col items-center gap-4 mb-4 md:-mt-4">
        <VisitorCounter label={dict.visitors} />
      </div>
      <div>
        {dict.copyright}{" "}
        <a
          href={LINKS.SITE_SOURCE}
          target="_blank"
          rel="noopener noreferrer"
          className="link-accent"
        >
          {dict.source}
        </a>
        .
      </div>
      {BUILD_CONFIG.BUILD_TIME_FORMATTED && (
        <div className="mt-2">
          <span className="text-muted-foreground/80">
            {dict.last_updated} {BUILD_CONFIG.BUILD_TIME_FORMATTED}.
          </span>
        </div>
      )}
    </footer>
  );
}
