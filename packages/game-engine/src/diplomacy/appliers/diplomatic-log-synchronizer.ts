import { TurnLogEntry } from "@/domain/game/game-state.schema";
import {
  PendingDiplomaticProposal,
  CountryRegistry,
  TurnLogBuilder,
} from "@geopolitics/domain";

export class DiplomaticLogSynchronizer {
  public static syncAcceptanceLogs(
    currentLogs: TurnLogEntry[],
    proposal: PendingDiplomaticProposal,
    treatyLabel: string,
    currentTurn: number,
    senderId: string,
    receiverId: string,
  ): TurnLogEntry[] {
    const canonicalSenderId = CountryRegistry.resolveCanonicalId(
      proposal.senderNationId,
    );
    const canonicalReceiverId = CountryRegistry.resolveCanonicalId(
      proposal.receiverNationId,
    );

    let foundMatchingLog = false;
    const updatedLogs = currentLogs.map((log) => {
      const isMatchingProposalId =
        log.params?.["proposalId"] &&
        String(log.params["proposalId"]) === proposal.id;

      const isMatchingProposalFallback =
        log.eventCode === "DIPLOMATIC_PROPOSAL_SENT" &&
        CountryRegistry.resolveCanonicalId(log.sourceNationId) ===
          canonicalSenderId &&
        CountryRegistry.resolveCanonicalId(log.targetNationId || "") ===
          canonicalReceiverId;

      if (
        isMatchingProposalId ||
        (!foundMatchingLog && isMatchingProposalFallback)
      ) {
        foundMatchingLog = true;
        return {
          ...log,
          eventCode: "TREATY_ACCEPTED" as const,
          level: "INFO" as const,
          category: "DIPLOMACY" as const,
          params: {
            ...log.params,
            treatyLabel,
            accepted: true,
          },
        };
      }
      return log;
    });

    if (foundMatchingLog) {
      return updatedLogs;
    }

    return [
      ...currentLogs,
      TurnLogBuilder.createGlobalDiplomacyLog(
        currentTurn,
        senderId,
        receiverId,
        "TREATY_ACCEPTED",
        { treatyLabel },
        "INFO",
      ),
    ];
  }

  public static syncRejectionLogs(
    currentLogs: TurnLogEntry[],
    proposal: PendingDiplomaticProposal,
    treatyLabel: string,
    currentTurn: number,
  ): TurnLogEntry[] {
    const canonicalSenderId = CountryRegistry.resolveCanonicalId(
      proposal.senderNationId,
    );
    const canonicalReceiverId = CountryRegistry.resolveCanonicalId(
      proposal.receiverNationId,
    );

    let foundMatchingLog = false;
    const updatedLogs = currentLogs.map((log) => {
      const isMatchingProposalId =
        log.params?.["proposalId"] &&
        String(log.params["proposalId"]) === proposal.id;

      const isMatchingProposalFallback =
        log.eventCode === "DIPLOMATIC_PROPOSAL_SENT" &&
        CountryRegistry.resolveCanonicalId(log.sourceNationId) ===
          canonicalSenderId &&
        CountryRegistry.resolveCanonicalId(log.targetNationId || "") ===
          canonicalReceiverId;

      if (
        isMatchingProposalId ||
        (!foundMatchingLog && isMatchingProposalFallback)
      ) {
        foundMatchingLog = true;
        return {
          ...log,
          eventCode: "TREATY_REJECTED" as const,
          level: "WARNING" as const,
          category: "DIPLOMACY" as const,
          params: {
            ...log.params,
            treatyLabel,
            accepted: false,
          },
        };
      }
      return log;
    });

    if (foundMatchingLog) {
      return updatedLogs;
    }

    return [
      ...currentLogs,
      TurnLogBuilder.createGlobalDiplomacyLog(
        currentTurn,
        proposal.receiverNationId,
        proposal.senderNationId,
        "TREATY_REJECTED",
        { treatyLabel },
        "WARNING",
      ),
    ];
  }
}
