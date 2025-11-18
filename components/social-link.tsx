import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface SocialLinkProps {
  href: string;
  icon?: LucideIcon;
  children: ReactNode;
  tooltip?: string;
}

export function SocialLink({
  href,
  icon: Icon,
  children,
  tooltip,
}: SocialLinkProps) {
  const buttonContent = (
    <Button variant="social" size="lg" asChild>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 group"
      >
        {Icon && <Icon className="w-4 h-4 grayscale transition-all duration-200 group-hover:grayscale-0" />}
        {children}
      </a>
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{buttonContent}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonContent;
}
