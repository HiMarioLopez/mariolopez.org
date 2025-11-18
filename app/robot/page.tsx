import { getRecentlyPlayed } from "@/lib/recently-played";
import { LINKS } from "@/lib/constants";
import { formatTimeAgo } from "@/lib/utils";
import { ViewToggle } from "@/components/view-toggle";
import { CopyButton } from "@/components/copy-button";

export const revalidate = 60;

export default async function RobotPage() {
  const recentlyPlayed = await getRecentlyPlayed();

  const plainTextContent = `Mario Lopez Martinez
${"=".repeat(50)}

ABOUT
${"-".repeat(50)}
I'm a Platform Architect, working with some brilliant folks at Vercel, solving the most challenging problems in the industry for our wonderful customers.

${
  recentlyPlayed
    ? `My most recently played song on ${recentlyPlayed.platform} is "${
        recentlyPlayed.song
      }" by ${recentlyPlayed.artist} (played ${formatTimeAgo(
        recentlyPlayed.timestamp
      )}).

Listen: ${recentlyPlayed.url}
`
    : ""
}
CONTACT
${"-".repeat(50)}
Email: ${LINKS.EMAIL.replace("mailto:", "")}

LINKS
${"-".repeat(50)}
GitHub: ${LINKS.GITHUB}
LinkedIn: ${LINKS.LINKEDIN}
Now Playing: ${LINKS.MUSIC}
Blog: ${LINKS.BLOG}
Chaos Recipe Enhancer: ${LINKS.CHAOS_RECIPE_ENHANCER}

RESUME
${"-".repeat(50)}
PDF: ${LINKS.RESUME_PDF}
DOCX: ${LINKS.RESUME_DOCX}

${"=".repeat(50)}
© 2025, Mario Lopez Martinez
Source: ${LINKS.GITHUB}
`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ViewToggle />
      <div className="fixed top-6 right-6 z-40">
        <CopyButton content={plainTextContent} />
      </div>
      <div className="flex items-center justify-center min-h-screen p-8 pt-24">
        <div className="max-w-3xl w-full animate-in fade-in slide-in-from-bottom-4 duration-20">
          <pre className="font-mono text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {plainTextContent}
          </pre>
        </div>
      </div>
    </div>
  );
}
