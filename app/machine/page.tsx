import {
  generateMachineContentBefore,
  generateMachineContentAfter,
} from "@/components/machine-content";
import { MachinePageClient } from "./machine-page-client";

/**
 * Server Component that generates static content
 * Only the dynamic recently-played section is handled client-side
 */
export default function MachinePage() {
  // Generate static content on the server
  const contentBefore = generateMachineContentBefore();
  const contentAfter = generateMachineContentAfter();

  return (
    <MachinePageClient
      contentBefore={contentBefore}
      contentAfter={contentAfter}
    />
  );
}
