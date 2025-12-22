import { RESOURCE_HINTS } from "@/lib/constants";

/**
 * Resource hints for external domains.
 * Renders native link elements that Next.js automatically hoists to <head>.
 * This is the recommended approach for App Router - simpler and more performant
 * than Script-based injection since hints are in the initial HTML.
 */
export function ResourceHints() {
  return (
    <>
      {RESOURCE_HINTS.map((hint) => (
        <link key={`${hint.rel}-${hint.href}`} rel={hint.rel} href={hint.href} />
      ))}
    </>
  );
}
