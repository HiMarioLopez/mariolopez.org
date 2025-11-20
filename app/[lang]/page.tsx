import { redirect } from "next/navigation";
import { Locale } from "./dictionaries";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/human`);
}
