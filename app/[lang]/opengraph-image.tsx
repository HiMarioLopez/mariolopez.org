import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";
import { AVAILABILITY_DISPLAY } from "@/lib/constants";
import { getDictionary, type Locale } from "./dictionaries";

export const alt = "Howdy Hey 🤠 — Mario Lopez";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function loadFontData(relativePath: string): Promise<ArrayBuffer | null> {
  try {
    const fileBuffer = await readFile(new URL(relativePath, import.meta.url));
    return Uint8Array.from(fileBuffer).buffer;
  } catch (_error) {
    return null;
  }
}

const ogFontDataPromise = Promise.all([
  loadFontData("./fonts/Geist-Regular.ttf"),
  loadFontData("./fonts/GeistMono-Regular.ttf"),
]);

const OG_DARK = {
  canvas: "#000000",
  card: "#09090b",
  border: "#27272a",
  text: "#e4e4e7",
  muted: "#a1a1aa",
  subtle: "#71717a",
  accent: "#d4d4d8",
  shadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
} as const;

function getLocale(lang: string): Locale {
  return lang === "es-MX" ? "es-MX" : "en-US";
}

function buildIdentityBlock(role: string, company: string, status: string): string {
  return `/**
 * @name    Mario Lopez
 * @role    ${role}
 * @company ${company}
 * @status  ${status}
 */`;
}

export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = getLocale(lang);
  const dict = await getDictionary(locale);
  const [geistFontData, geistMonoFontData] = await ogFontDataPromise;
  const statusLabel = AVAILABILITY_DISPLAY.cranking.jsdoc[locale];
  const introLine = `${dict.landing.intro_solving} ${dict.landing.intro_customers} ${dict.landing.intro_scope}.`;
  const siteLabel = locale === "es-MX" ? "Sitio" : "Site";
  const monoFallbackFontFamily =
    'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
  const rootFontFamily = geistMonoFontData ? "Geist Mono" : monoFallbackFontFamily;
  const sansFontFamily = geistFontData ? "Geist" : rootFontFamily;
  const identityBlock = buildIdentityBlock(
    dict.landing.jsdoc_role,
    dict.landing.jsdoc_company,
    statusLabel,
  );
  const fonts = [
    ...(geistFontData
      ? [{ name: "Geist", data: geistFontData, style: "normal" as const, weight: 400 as const }]
      : []),
    ...(geistMonoFontData
      ? [
          {
            name: "Geist Mono",
            data: geistMonoFontData,
            style: "normal" as const,
            weight: 400 as const,
          },
        ]
      : []),
  ];
  const imageOptions = {
    ...size,
    // Avoid passing an empty font list to satori in production.
    ...(fonts.length > 0 ? { fonts } : {}),
  };

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: OG_DARK.canvas,
        color: OG_DARK.text,
        fontFamily: rootFontFamily,
        padding: "42px",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
          border: `1px solid ${OG_DARK.border}`,
          backgroundColor: OG_DARK.card,
          boxShadow: OG_DARK.shadow,
          padding: "44px",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 30,
            color: OG_DARK.muted,
            letterSpacing: "-0.01em",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>mariolopez.org</span>
            <span style={{ marginLeft: "14px", marginRight: "14px", color: OG_DARK.subtle }}>
              /
            </span>
            <span style={{ color: OG_DARK.subtle }}>~</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: OG_DARK.text }}>
            <span style={{ fontSize: 36, fontFamily: sansFontFamily }}>Howdy Hey</span>
            <span style={{ marginLeft: "12px", fontSize: 42, lineHeight: 1 }}>🤠</span>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            borderTop: `1px solid ${OG_DARK.border}`,
            marginTop: "22px",
            marginBottom: "22px",
          }}
        />

        <div
          style={{
            whiteSpace: "pre",
            fontSize: 36,
            lineHeight: 1.5,
            color: OG_DARK.accent,
          }}
        >
          {identityBlock}
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "24px",
            fontSize: 24,
            color: OG_DARK.muted,
          }}
        >
          <span>{introLine}</span>
          <span style={{ marginLeft: "18px", color: OG_DARK.accent, fontSize: 20 }}>
            {siteLabel}: mariolopez.org
          </span>
        </div>
      </div>
    </div>,
    imageOptions,
  );
}
