import { ImageResponse } from "next/og";
import { AVAILABILITY_DISPLAY } from "@/lib/constants";
import { getDictionary, type Locale } from "./dictionaries";

export const alt = "Howdy Hey 🤠 — Mario Lopez Martinez";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function getLocale(lang: string): Locale {
  return lang === "es-MX" ? "es-MX" : "en-US";
}

function buildIdentityBlock(role: string, company: string, status: string): string {
  return `/**
 * @name    Mario Lopez Martinez
 * @role    ${role}
 * @company ${company}
 * @status  ${status}
 */`;
}

export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = getLocale(lang);
  const dict = await getDictionary(locale);
  const statusLabel = AVAILABILITY_DISPLAY.cranking.jsdoc[locale];
  const introLine = `${dict.landing.intro_solving} ${dict.landing.intro_customers} ${dict.landing.intro_scope}.`;
  const siteLabel = locale === "es-MX" ? "Sitio" : "Site";
  const identityBlock = buildIdentityBlock(
    dict.landing.jsdoc_role,
    dict.landing.jsdoc_company,
    statusLabel,
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: "#e7e5e4",
        color: "#292524",
        fontFamily:
          'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
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
          border: "1px solid #d6d3d1",
          background:
            "radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0) 52%), #f5f5f4",
          boxShadow: "0 16px 40px rgba(28, 25, 23, 0.08)",
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
            color: "#57534e",
            letterSpacing: "-0.01em",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>mariolopez.org</span>
            <span style={{ marginLeft: "14px", marginRight: "14px", color: "#a8a29e" }}>/</span>
            <span style={{ color: "#78716c" }}>~</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#292524" }}>
            <span style={{ fontSize: 36 }}>Howdy Hey</span>
            <span style={{ marginLeft: "12px", fontSize: 42, lineHeight: 1 }}>🤠</span>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            borderTop: "1px solid #d6d3d1",
            marginTop: "22px",
            marginBottom: "22px",
          }}
        />

        <div
          style={{
            whiteSpace: "pre",
            fontSize: 36,
            lineHeight: 1.5,
            color: "#44403c",
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
            color: "#78716c",
          }}
        >
          <span>{introLine}</span>
          <span style={{ marginLeft: "18px", color: "#57534e", fontSize: 20 }}>
            {siteLabel}: mariolopez.org
          </span>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
