import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, type Locale } from "../dictionaries";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: `${dict.metadata.title} | ${dict.survey.metadata_title}`,
    description: dict.survey.metadata_description,
  };
}

export default async function SurveyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  const plannedQuestions = [
    dict.survey.planned_first,
    dict.survey.planned_second,
    dict.survey.planned_third,
  ];

  return (
    <main className="min-h-screen bg-background text-foreground font-mono antialiased selection:bg-foreground/15 selection:text-foreground">
      <div className="max-w-[680px] mx-auto px-5 sm:px-6 py-8 sm:py-10 md:py-16">
        <header className="mb-10 md:mb-14">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-6 sm:mb-8">
            <Link
              href={`/${lang}`}
              className="text-text-tertiary hover:text-foreground transition-colors"
            >
              ~
            </Link>
            <span className="text-text-decorative">/</span>
            <span className="text-text-tertiary">{dict.survey.eyebrow}</span>
          </div>

          <h1 className="text-base sm:text-lg mb-4">{dict.survey.heading}</h1>
          <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed max-w-[500px]">
            {dict.survey.intro}
          </p>
        </header>

        <section className="mb-10 md:mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-text-decorative select-none font-mono text-xs">#</span>
            <h2 className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
              {dict.survey.status_label}
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <p className="text-sm text-text-secondary">{dict.survey.status_value}</p>
        </section>

        <section className="mb-10 md:mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-text-decorative select-none font-mono text-xs">#</span>
            <h2 className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
              {dict.survey.planned_label}
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <ol className="space-y-1">
            {plannedQuestions.map((question, index) => (
              <li
                key={question}
                className="flex items-start gap-3 py-2 text-sm text-text-secondary"
              >
                <span aria-hidden="true" className="w-4 shrink-0 text-text-tertiary">
                  {index + 1}.
                </span>
                <span>{question}</span>
              </li>
            ))}
          </ol>
        </section>

        <Link
          href={`/${lang}`}
          className="text-sm text-muted-foreground border-b border-border hover:text-foreground hover:border-foreground transition-colors pb-px"
        >
          {dict.survey.back_label}
        </Link>
      </div>
    </main>
  );
}
