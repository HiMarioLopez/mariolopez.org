import { getDictionary, type Locale } from "./dictionaries";
import { LandingPage } from "./landing-page";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  return <LandingPage lang={lang} dict={dict.landing} statusBarDict={dict.view_toggle} />;
}
