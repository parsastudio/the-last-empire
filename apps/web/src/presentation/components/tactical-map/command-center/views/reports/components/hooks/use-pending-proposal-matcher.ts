import { useMemo } from "react";
import {
  TurnLogEntry,
  CountryRegistry,
  PendingDiplomaticProposal,
} from "@geopolitics/domain";

interface UsePendingProposalMatcherProps {
  log: TurnLogEntry;
  humanNationId?: string;
  pendingProposals?: PendingDiplomaticProposal[];
  sourceCanonical: string;
}

export function usePendingProposalMatcher({
  log,
  humanNationId,
  pendingProposals = [],
  sourceCanonical,
}: UsePendingProposalMatcherProps) {
  return useMemo<PendingDiplomaticProposal | null>(() => {
    if (
      log.eventCode !== "DIPLOMATIC_PROPOSAL_SENT" ||
      !humanNationId ||
      !log.targetNationId
    ) {
      return null;
    }

    const canonicalHuman = CountryRegistry.resolveCanonicalId(humanNationId);
    const canonicalTarget = CountryRegistry.resolveCanonicalId(
      log.targetNationId,
    );

    if (canonicalTarget !== canonicalHuman) {
      return null;
    }

    const logProposalId = log.params?.["proposalId"]
      ? String(log.params["proposalId"])
      : null;

    if (logProposalId) {
      const directMatch = pendingProposals.find((p) => p.id === logProposalId);
      if (directMatch) return directMatch;
    }

    return (
      pendingProposals.find((p) => {
        const pSender = CountryRegistry.resolveCanonicalId(p.senderNationId);
        const pReceiver = CountryRegistry.resolveCanonicalId(
          p.receiverNationId,
        );
        return pSender === sourceCanonical && pReceiver === canonicalHuman;
      }) || null
    );
  }, [log, humanNationId, pendingProposals, sourceCanonical]);
}
