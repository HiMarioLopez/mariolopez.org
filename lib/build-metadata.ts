const BUILD_METADATA_TIME_ZONE = "UTC";

export interface BuildMetadata {
  siteLastUpdatedIso: string;
  siteLastUpdatedDisplay: string;
}

export function getBuildMetadata(lang: string): BuildMetadata {
  const locale = lang === "es-MX" ? "es-MX" : "en-US";
  // Timestamp reflects when this function runs:
  // static prerender => build time, dev/dynamic render => request time.
  const buildDate = new Date();

  return {
    siteLastUpdatedIso: buildDate.toISOString(),
    siteLastUpdatedDisplay: new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: BUILD_METADATA_TIME_ZONE,
      timeZoneName: "short",
    }).format(buildDate),
  };
}
