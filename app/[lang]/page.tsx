import type { Metadata } from "next";
import { getDictionary, type Locale } from "./dictionaries";
import { LandingPage } from "./landing-page";

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
  return <LandingPage lang={lang} dict={dict.landing} statusBarDict={dict.view_toggle} />;
}
