import {
  generateMachineContentAfter,
  generateMachineContentBefore,
} from "@/components/machine-content";
import { getDictionary, type Locale } from "../dictionaries";
import { MachinePageClient } from "./machine-page-client";

/**
 * Server Component that generates static content
 * Only the dynamic recently-played section is handled client-side
 */
export default async function MachinePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  // Generate static content on the server
  const contentBefore = generateMachineContentBefore(dict.machine);
  const contentAfter = generateMachineContentAfter(dict.machine);

  // Template for the dynamic recently played section
  // This needs to match what useRecentlyPlayedSection expects/generates
  const recentlyPlayedTemplate = dict.machine.recently_played_template;

  return (
    <MachinePageClient
      contentBefore={contentBefore}
      contentAfter={contentAfter}
      lang={lang as Locale}
      recentlyPlayedTemplate={recentlyPlayedTemplate}
      dict={dict}
    />
  );
}
