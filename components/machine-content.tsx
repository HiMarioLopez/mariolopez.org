import type { BuildMetadata } from "@/lib/build-metadata";
import { LINKS } from "@/lib/constants";

interface MachineDict {
  system_instructions: string;
  header: string;
  about_section: string;
  resume_section: {
    intro: string;
    experience_title: string;
    jobs: Array<{
      title: string;
      date: string;
      description: string;
    }>;
    leadership_title: string;
    leadership: Array<{
      title: string;
      date: string;
      description: string;
    }>;
    education_title: string;
    education: string;
  };
  contact_section: {
    text: string;
    email_label: string;
    site_last_updated_label: string;
  };
  socials_labels: {
    github: string;
    linkedin: string;
    twitter: string;
    resume_pdf: string;
    resume_docx: string;
  };
  footer_label: string;
  recently_played_template: string;
}

/**
 * Generates the static content before the recently-played section
 * This is generated on the server to optimize string concatenation
 */
export function generateMachineContentBefore(dict: MachineDict): string {
  // Format strings with %s placeholders
  const aboutSection = dict.about_section
    .replace("%s", LINKS.VERCEL_CAREERS)
    .replace("%s", LINKS.VERCEL)
    .replace("%s", LINKS.VERCEL_CUSTOMERS)
    .replace("%s", LINKS.VERCEL_FIELD_ENGINEERING);

  return `[SYSTEM INSTRUCTIONS]
${dict.system_instructions}

---

[content_start]
[header]
${dict.header}
[/header]

[section: about]
${aboutSection}

[section: recently_played]
`;
}

/**
 * Generates the static content after the recently-played section
 * This is generated on the server to optimize string concatenation
 */
export function generateMachineContentAfter(
  dict: MachineDict,
  buildMetadata: BuildMetadata,
): string {
  const jobs = dict.resume_section.jobs
    .map((job) => `${job.date}\n${job.title}\n${job.description}`)
    .join("\n\n");

  const leadership = dict.resume_section.leadership
    .map((role) => `${role.date}\n${role.title}\n${role.description}`)
    .join("\n\n");

  return `[/section]

[section: resume]
${dict.resume_section.intro}

${dict.resume_section.experience_title}

${jobs}

${dict.resume_section.leadership_title}

${leadership}

${dict.resume_section.education_title}

${dict.resume_section.education}
[/section]

[section: contact]
${dict.contact_section.text}

${dict.contact_section.email_label} ${LINKS.EMAIL_MACHINE}
${dict.contact_section.site_last_updated_label} ${buildMetadata.siteLastUpdatedDisplay}
[/section]

[section: socials]
${dict.socials_labels.github} ${LINKS.GITHUB}
${dict.socials_labels.linkedin} ${LINKS.LINKEDIN}
${dict.socials_labels.twitter} ${LINKS.TWITTER}
${dict.socials_labels.resume_pdf} ${LINKS.RESUME_PDF}
${dict.socials_labels.resume_docx} ${LINKS.RESUME_DOCX}
[/section]

[footer]
© 2026, Mario Lopez Martinez
${dict.footer_label} ${LINKS.SITE_SOURCE}
[/footer]
[/content_end]
`;
}
