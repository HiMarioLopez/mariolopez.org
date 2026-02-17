import { LandingPage } from "./landing-page";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <LandingPage lang={lang} />;
}
