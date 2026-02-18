import {
  generateMachineContentAfter,
  generateMachineContentBefore,
} from "@/components/machine-content";
import { getDictionary, type Locale } from "../dictionaries";
import { MachinePageClient } from "./machine-page-client";

export default async function MachinePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  const contentBefore = generateMachineContentBefore(dict.machine);
  const contentAfter = generateMachineContentAfter(dict.machine);
  const recentlyPlayedTemplate = dict.machine.recently_played_template;

  return (
    <MachinePageClient
      contentBefore={contentBefore}
      contentAfter={contentAfter}
      lang={lang as Locale}
      recentlyPlayedTemplate={recentlyPlayedTemplate}
      dict={{ copy_button: dict.copy_button, view_toggle: dict.view_toggle }}
    />
  );
}
