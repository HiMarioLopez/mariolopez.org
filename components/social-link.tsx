import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SocialLinkProps {
  href: string;
  icon?: LucideIcon;
  children: ReactNode;
  tooltip?: string;
  iconColor?: string;
  className?: string;
}

export function SocialLink({
  href,
  icon: Icon,
  children,
  tooltip,
  iconColor,
  className,
}: SocialLinkProps) {
  const buttonContent = (
    <Button 
      variant="social" 
      size="lg" 
      className={cn("w-full sm:w-auto px-3 sm:px-6", className)} 
      asChild
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 group min-w-0"
      >
        {Icon && (
          <Icon
            className={cn("w-4 h-4 icon-grayscale-hover shrink-0")}
            style={iconColor ? { color: iconColor } : undefined}
          />
        )}
        <span className="truncate">{children}</span>
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
