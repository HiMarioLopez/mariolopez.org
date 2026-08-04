#!/usr/bin/env bun
/**
 * i18n dictionary audit script
 *
 * Checks:
 * 1) Structural parity between en-US and es-MX dictionaries
 * 2) Dictionary key usage classification:
 *    - used
 *    - rewire_candidate
 *    - unused
 *
 * Usage:
 *   bun scripts/check-i18n.ts
 *   bun scripts/check-i18n.ts --strict
 *   bun scripts/check-i18n.ts --json
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type NodeKind = "object" | "array" | "value";
type Classification = "used" | "rewireCandidate" | "unused";

interface UsageSource {
  file: string;
  /**
   * Prefix to prepend to every `dict.<path>` access extracted from this file.
   * Useful when file receives only a dictionary slice (e.g. landing page receives `dict.landing`).
   */
  rootPrefix?: string;
  /**
   * Whether object/array path accesses in this file should mark descendants as used.
   * Enable for files that iterate nested collections (e.g. jobs[].title from dict.resume_section.jobs).
   */
  expandObjectAccesses?: boolean;
}

interface AuditOutput {
  parity: {
    missingInEsMX: string[];
    missingInEnUS: string[];
    typeMismatches: Array<{ path: string; enUS: NodeKind; esMX: NodeKind }>;
  };
  usage: {
    used: string[];
    rewireCandidate: string[];
    unused: string[];
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");

const EN_DICTIONARY_PATH = "app/[lang]/dictionaries/en-US.json";
const ES_DICTIONARY_PATH = "app/[lang]/dictionaries/es-MX.json";

/**
 * Maintained usage map for routes/components that are part of the active app surface.
 * This intentionally excludes retired components to avoid counting legacy keys as "used".
 */
const USAGE_SOURCES: UsageSource[] = [
  { file: "app/[lang]/layout.tsx" },
  { file: "app/[lang]/page.tsx" },
  { file: "app/[lang]/machine/page.tsx" },
  { file: "app/[lang]/survey/page.tsx" },
  { file: "app/[lang]/landing-page.tsx", rootPrefix: "landing", expandObjectAccesses: true },
  { file: "app/[lang]/machine/machine-page-client.tsx" },
  { file: "components/machine-content.tsx", rootPrefix: "machine", expandObjectAccesses: true },
  { file: "components/copy-button.tsx", rootPrefix: "copy_button" },
  { file: "components/status-bar.tsx", rootPrefix: "view_toggle" },
];

/**
 * Keys that are planned to be wired into active UI but may still be hardcoded.
 * `used` always takes precedence if a key is actually referenced.
 */
const REWIRE_CANDIDATE_PREFIXES: string[] = ["view_toggle"];

function isObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readJson(pathFromRoot: string): JsonValue {
  const absolutePath = resolve(repoRoot, pathFromRoot);
  const content = readFileSync(absolutePath, "utf8");
  return JSON.parse(content) as JsonValue;
}

function collectShape(value: JsonValue, path: string, out: Map<string, NodeKind>): void {
  if (Array.isArray(value)) {
    out.set(path, "array");
    for (const item of value) {
      collectShape(item, `${path}[]`, out);
    }
    return;
  }

  if (isObject(value)) {
    out.set(path, "object");
    for (const [key, child] of Object.entries(value)) {
      const childPath = path ? `${path}.${key}` : key;
      collectShape(child, childPath, out);
    }
    return;
  }

  out.set(path, "value");
}

function collectLeafPaths(value: JsonValue, path: string, out: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectLeafPaths(item, `${path}[]`, out);
    }
    return;
  }

  if (isObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      const childPath = path ? `${path}.${key}` : key;
      collectLeafPaths(child, childPath, out);
    }
    return;
  }

  if (path) {
    out.add(path);
  }
}

function normalizeOptionalChaining(content: string): string {
  return content.replaceAll("?.", ".");
}

/**
 * Well-known JS property/method names that should be stripped from extracted
 * dictionary access paths. These appear when code calls e.g. `dict.items.map(...)`
 * and the greedy regex captures `.map` as part of the dict path.
 */
const JS_PROPERTY_SUFFIXES = new Set([
  "map",
  "filter",
  "forEach",
  "find",
  "findIndex",
  "some",
  "every",
  "reduce",
  "reduceRight",
  "flat",
  "flatMap",
  "length",
  "includes",
  "indexOf",
  "join",
  "slice",
  "sort",
  "at",
  "keys",
  "values",
  "entries",
]);

function extractDictAccesses(content: string): string[] {
  const normalized = normalizeOptionalChaining(content);
  const regex = /\bdict((?:\.[A-Za-z0-9_]+)+)/g;
  const accesses: string[] = [];
  let match = regex.exec(normalized);
  while (match) {
    let path = match[1].slice(1);
    // Strip trailing JS method/property names from the path
    const lastDot = path.lastIndexOf(".");
    if (lastDot !== -1) {
      const tail = path.slice(lastDot + 1);
      if (JS_PROPERTY_SUFFIXES.has(tail)) {
        path = path.slice(0, lastDot);
      }
    }
    accesses.push(path);
    match = regex.exec(normalized);
  }
  return accesses;
}

function buildPath(rootPrefix: string | undefined, accessPath: string): string {
  if (!rootPrefix) {
    return accessPath;
  }
  return `${rootPrefix}.${accessPath}`;
}

function isUnderPrefix(path: string, prefix: string): boolean {
  if (path === prefix) {
    return true;
  }
  return path.startsWith(`${prefix}.`) || path.startsWith(`${prefix}[]`);
}

function auditUsage(
  enLeafPaths: Set<string>,
  enShape: Map<string, NodeKind>,
): { usedLeafPaths: Set<string>; usedObjectPrefixes: Set<string> } {
  const usedLeafPaths = new Set<string>();
  const usedObjectPrefixes = new Set<string>();

  for (const source of USAGE_SOURCES) {
    const absolutePath = resolve(repoRoot, source.file);
    const content = readFileSync(absolutePath, "utf8");
    const accesses = extractDictAccesses(content);

    for (const access of accesses) {
      const fullPath = buildPath(source.rootPrefix, access);
      const nodeKind = enShape.get(fullPath);

      if (enLeafPaths.has(fullPath)) {
        usedLeafPaths.add(fullPath);
        continue;
      }

      // Expanded object accesses are only allowed for explicitly configured files.
      if (source.expandObjectAccesses && nodeKind && nodeKind !== "value") {
        usedObjectPrefixes.add(fullPath);
      }
    }
  }

  // Expand object prefixes into leaf descendants.
  for (const leafPath of enLeafPaths) {
    for (const prefix of usedObjectPrefixes) {
      if (isUnderPrefix(leafPath, prefix)) {
        usedLeafPaths.add(leafPath);
      }
    }
  }

  return { usedLeafPaths, usedObjectPrefixes };
}

function classifyPaths(
  leafPaths: Set<string>,
  usedLeafPaths: Set<string>,
): Record<Classification, string[]> {
  const used: string[] = [];
  const rewireCandidate: string[] = [];
  const unused: string[] = [];

  const sorted = [...leafPaths].sort((a, b) => a.localeCompare(b));
  for (const path of sorted) {
    if (usedLeafPaths.has(path)) {
      used.push(path);
      continue;
    }

    const isRewireCandidate = REWIRE_CANDIDATE_PREFIXES.some((prefix) =>
      isUnderPrefix(path, prefix),
    );
    if (isRewireCandidate) {
      rewireCandidate.push(path);
      continue;
    }

    unused.push(path);
  }

  return { used, rewireCandidate, unused };
}

function compareShapes(
  enShape: Map<string, NodeKind>,
  esShape: Map<string, NodeKind>,
): AuditOutput["parity"] {
  const missingInEsMX: string[] = [];
  const missingInEnUS: string[] = [];
  const typeMismatches: Array<{ path: string; enUS: NodeKind; esMX: NodeKind }> = [];

  const enPaths = [...enShape.keys()]
    .filter((path) => path !== "")
    .sort((a, b) => a.localeCompare(b));
  const esPaths = [...esShape.keys()]
    .filter((path) => path !== "")
    .sort((a, b) => a.localeCompare(b));
  const enSet = new Set(enPaths);
  const esSet = new Set(esPaths);

  for (const path of enPaths) {
    if (!esSet.has(path)) {
      missingInEsMX.push(path);
      continue;
    }

    const enKind = enShape.get(path);
    const esKind = esShape.get(path);
    if (enKind && esKind && enKind !== esKind) {
      typeMismatches.push({ path, enUS: enKind, esMX: esKind });
    }
  }

  for (const path of esPaths) {
    if (!enSet.has(path)) {
      missingInEnUS.push(path);
    }
  }

  return { missingInEsMX, missingInEnUS, typeMismatches };
}

function printSection(title: string, items: string[]): void {
  console.log(`\n${title} (${items.length})`);
  if (items.length === 0) {
    console.log("  - none");
    return;
  }
  for (const item of items) {
    console.log(`  - ${item}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const strict = args.includes("--strict");
  const jsonOutput = args.includes("--json");

  const enDictionary = readJson(EN_DICTIONARY_PATH);
  const esDictionary = readJson(ES_DICTIONARY_PATH);

  const enShape = new Map<string, NodeKind>();
  const esShape = new Map<string, NodeKind>();
  collectShape(enDictionary, "", enShape);
  collectShape(esDictionary, "", esShape);

  const enLeafPaths = new Set<string>();
  collectLeafPaths(enDictionary, "", enLeafPaths);

  const parity = compareShapes(enShape, esShape);
  const { usedLeafPaths } = auditUsage(enLeafPaths, enShape);
  const usage = classifyPaths(enLeafPaths, usedLeafPaths);

  const output: AuditOutput = {
    parity,
    usage: {
      used: usage.used,
      rewireCandidate: usage.rewireCandidate,
      unused: usage.unused,
    },
  };

  if (jsonOutput) {
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.log("\n🌐 i18n dictionary audit");
    console.log(`\nDictionaries: ${EN_DICTIONARY_PATH} ↔ ${ES_DICTIONARY_PATH}`);

    const hasParityIssues =
      parity.missingInEsMX.length > 0 ||
      parity.missingInEnUS.length > 0 ||
      parity.typeMismatches.length > 0;

    console.log(`\nStructure parity: ${hasParityIssues ? "FAIL" : "PASS"}`);
    printSection("Missing in es-MX", parity.missingInEsMX);
    printSection("Missing in en-US", parity.missingInEnUS);

    console.log(`\nType mismatches (${parity.typeMismatches.length})`);
    if (parity.typeMismatches.length === 0) {
      console.log("  - none");
    } else {
      for (const mismatch of parity.typeMismatches) {
        console.log(`  - ${mismatch.path} (en-US: ${mismatch.enUS}, es-MX: ${mismatch.esMX})`);
      }
    }

    console.log("\nUsage classification:");
    console.log(`  used: ${usage.used.length}`);
    console.log(`  rewire_candidate: ${usage.rewireCandidate.length}`);
    console.log(`  unused: ${usage.unused.length}`);

    printSection("Rewire candidates", usage.rewireCandidate);
    printSection("Unused keys", usage.unused);
  }

  if (strict) {
    const hasIssues =
      parity.missingInEsMX.length > 0 ||
      parity.missingInEnUS.length > 0 ||
      parity.typeMismatches.length > 0 ||
      usage.rewireCandidate.length > 0 ||
      usage.unused.length > 0;

    if (hasIssues) {
      console.error(
        "\n❌ i18n audit failed in strict mode. Fix parity, rewire candidates, and unused keys.",
      );
      process.exit(1);
    }
  }

  console.log("\n✅ i18n audit complete.");
}

main();
