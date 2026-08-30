import { TurnLogEntry } from "@/domain/game/game-state.schema";
import {
  PendingDiplomaticProposal,
  CountryRegistry,
  TurnLogBuilder,
} from "@geopolitics/domain";

export class DiplomaticLogSynchronizer {
  private static syncProposalResponseLog(
    currentLogs: TurnLogEntry[],
    proposal: PendingDiplomaticProposal,
    treatyLabel: string,
    currentTurn: number,
    isAccepted: boolean,
    senderId?: string,
    receiverId?: string,
  ): TurnLogEntry[] {
    const canonicalSenderId = CountryRegistry.resolveCanonicalId(
      proposal.senderNationId,
    );
    const canonicalReceiverId = CountryRegistry.resolveCanonicalId(
      proposal.receiverNationId,
    );

    let foundMatchingLog = false;
    const targetEventCode = isAccepted ? "TREATY_ACCEPTED" : "TREATY_REJECTED";
    const targetLevel = isAccepted ? "INFO" : "WARNING";

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
          eventCode: targetEventCode as const,
          level: targetLevel as const,
          category: "DIPLOMACY" as const,
          params: {
            ...log.params,
            treatyLabel,
            accepted: isAccepted,
          },
        };
      }
      return log;
    });

    if (foundMatchingLog) {
      return updatedLogs;
    }

    const sourceId = isAccepted
      ? senderId || proposal.senderNationId
      : proposal.receiverNationId;
    const targetId = isAccepted
      ? receiverId || proposal.receiverNationId
      : proposal.senderNationId;

    return [
      ...currentLogs,
      TurnLogBuilder.createGlobalDiplomacyLog(
        currentTurn,
        sourceId,
        targetId,
        targetEventCode,
        { treatyLabel },
        targetLevel,
      ),
    ];
  }

  public static syncAcceptanceLogs(
    currentLogs: TurnLogEntry[],
    proposal: PendingDiplomaticProposal,
    treatyLabel: string,
    currentTurn: number,
    senderId: string,
    receiverId: string,
  ): TurnLogEntry[] {
    return this.syncProposalResponseLog(
      currentLogs,
      proposal,
      treatyLabel,
      currentTurn,
      true,
      senderId,
      receiverId,
    );
  }

  public static syncRejectionLogs(
    currentLogs: TurnLogEntry[],
    proposal: PendingDiplomaticProposal,
    treatyLabel: string,
    currentTurn: number,
  ): TurnLogEntry[] {
    return this.syncProposalResponseLog(
      currentLogs,
      proposal,
      treatyLabel,
      currentTurn,
      false,
    );
  }
}
