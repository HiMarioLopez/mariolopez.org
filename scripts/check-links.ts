#!/usr/bin/env node
/**
 * Link checker script
 * Checks for broken links in the built Next.js site
 */

import { check } from "linkinator";

const args = process.argv.slice(2);
const checkProduction = args.includes("--production");
const checkLocal = args.includes("--local") || (!checkProduction && !args.includes("--url"));

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mariolopez.org";
const LOCAL_URL = "http://localhost:3000";

// Patterns to skip (mailto, anchors, etc.)
const skipPatterns = [
  "mailto:", // Email links
  "#", // Anchor links
  "javascript:", // JavaScript links
];

async function checkServerRunning(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

async function checkLinks(url: string) {
  console.log(`🔍 Checking links on: ${url}\n`);

  const results = await check({
    path: url,
    recurse: true,
    timeout: 10000,
    retry: true,
    linksToSkip: async (link: string) => {
      // Skip links matching patterns (mailto, anchors, javascript, etc.)
      return skipPatterns.some((pattern) => link.startsWith(pattern));
    },
  });

  const brokenLinks = results.links.filter(
    (link) => link.state === "BROKEN" || (link.status && link.status >= 400)
  );

  if (brokenLinks.length > 0) {
    console.error("\n❌ Found broken links:\n");
    brokenLinks.forEach((link) => {
      console.error(`  ${link.url}`);
      console.error(`    Status: ${link.status || link.state}`);
      console.error(`    Page: ${link.parent || "unknown"}\n`);
    });
    process.exit(1);
  }

  const totalLinks = results.links.length;
  const passedLinks = totalLinks - brokenLinks.length;

  console.log(`\n✅ Link check complete!`);
  console.log(`   Total links checked: ${totalLinks}`);
  console.log(`   Passed: ${passedLinks}`);
  console.log(`   Broken: ${brokenLinks.length}\n`);

  return brokenLinks.length === 0;
}

async function main() {
  try {
    if (checkProduction) {
      await checkLinks(BASE_URL);
    } else if (checkLocal) {
      // Check if local server is running
      const isRunning = await checkServerRunning(LOCAL_URL);
      if (!isRunning) {
        console.error(
          `\n❌ Local server not running at ${LOCAL_URL}\n` +
            `   Please start the dev server with: pnpm dev\n` +
            `   Or build and start with: pnpm build && pnpm start\n`
        );
        process.exit(1);
      }
      await checkLinks(LOCAL_URL);
    } else if (args.includes("--url")) {
      const urlIndex = args.indexOf("--url");
      const url = args[urlIndex + 1];
      if (!url) {
        console.error("Error: --url requires a URL argument");
        process.exit(1);
      }
      await checkLinks(url);
    } else {
      // Default: show help
      console.log(
        "\n💡 Link Checker\n" +
          "\nUsage:\n" +
          "   pnpm check-links:local  (checks http://localhost:3000)\n" +
          "   pnpm check-links:prod   (checks production site)\n" +
          "   pnpm check-links --url <url>  (checks custom URL)\n"
      );
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Error checking links:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

main();

