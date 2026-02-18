import { LINKS } from "@/lib/constants";

const POE_LABEL = "Path of Exile";

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
  };
  socials_labels: {
    github: string;
    linkedin: string;
    twitter: string;
    backpocket: string;
    resume_pdf: string;
    resume_docx: string;
  };
  projects_labels: {
    chaos_recipe_enhancer: string;
    now_playing: string;
    blog: string;
    create_mlpz_lambda: string;
    vercel_bulk_waf_rules: string;
    backpocket: string;
    cordstruck: string;
    guesschella: string;
    building_status: string;
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
export function generateMachineContentAfter(dict: MachineDict): string {
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
[/section]

[section: socials]
${dict.socials_labels.github} ${LINKS.GITHUB}
${dict.socials_labels.linkedin} ${LINKS.LINKEDIN}
${dict.socials_labels.twitter} ${LINKS.TWITTER}
${dict.socials_labels.backpocket} ${LINKS.BACKPOCKET_SPACE}
${dict.socials_labels.resume_pdf} ${LINKS.RESUME_PDF}
${dict.socials_labels.resume_docx} ${LINKS.RESUME_DOCX}
[/section]

[section: projects]
${dict.projects_labels.chaos_recipe_enhancer} ${LINKS.CHAOS_RECIPE_ENHANCER} (${POE_LABEL}: ${LINKS.PATH_OF_EXILE})
${dict.projects_labels.now_playing} ${LINKS.MUSIC} (${LINKS.MUSIC_REPO_OUTLINE})
${dict.projects_labels.blog} ${LINKS.BLOG}
${dict.projects_labels.create_mlpz_lambda} ${LINKS.CREATE_MLPZ_LAMBDA}
${dict.projects_labels.vercel_bulk_waf_rules} ${LINKS.VERCEL_BULK_WAF_RULES}
${dict.projects_labels.backpocket} ${dict.projects_labels.building_status}
${dict.projects_labels.cordstruck} ${dict.projects_labels.building_status}
${dict.projects_labels.guesschella} ${dict.projects_labels.building_status}
[/section]

[footer]
© 2026, Mario Lopez Martinez
${dict.footer_label} ${LINKS.SITE_SOURCE}
[/footer]
[/content_end]
`;
}
