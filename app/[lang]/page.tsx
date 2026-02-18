import type { Metadata } from "next";
import { getBuildMetadata } from "@/lib/build-metadata";
import { getDictionary, type Locale } from "./dictionaries";
import { LandingPage } from "./landing-page";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
  };
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const buildMetadata = getBuildMetadata(lang);

  return (
    <LandingPage
      lang={lang}
      dict={dict.landing}
      statusBarDict={dict.view_toggle}
      buildMetadata={buildMetadata}
    />
  );
}
