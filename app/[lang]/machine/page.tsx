import type { Metadata } from "next";
import {
  generateMachineContentAfter,
  generateMachineContentBefore,
} from "@/components/machine-content";
import { getDictionary, type Locale } from "../dictionaries";
import { MachinePageClient } from "./machine-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: `${dict.metadata.title} | ${dict.view_toggle.machine}`,
    description: dict.metadata.description,
  };
}

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
