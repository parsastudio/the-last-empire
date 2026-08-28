import {
  GameState,
  PendingDiplomaticProposal,
  CountryRegistry,
  TurnLogBuilder,
} from "@geopolitics/domain";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";

export class TreatyAcceptanceApplier {
  private static treatyEvaluator = new TreatyEvaluator();

  public static applyAcceptance(
    state: GameState,
    proposal: PendingDiplomaticProposal,
  ): GameState {
    const canonicalSenderId = CountryRegistry.resolveCanonicalId(
      proposal.senderNationId,
    );
    const canonicalReceiverId = CountryRegistry.resolveCanonicalId(
      proposal.receiverNationId,
    );

    const sender =
      state.nations[canonicalSenderId] ||
      state.nations[proposal.senderNationId];
    const receiver =
      state.nations[canonicalReceiverId] ||
      state.nations[proposal.receiverNationId];

    if (!sender || !receiver || !sender.isAlive || !receiver.isAlive) {
      return this.removeProposal(state, proposal.id);
    }

    if (proposal.proposalType === "SECURITY_GUARANTEE") {
      const updatedSender = {
        ...sender,
        securityGuarantorId: receiver.id,
      };

      const guaranteeLog = TurnLogBuilder.createGlobalDiplomacyLog(
        state.currentTurn,
        sender.id,
        receiver.id,
        "SECURITY_GUARANTEE_SIGNED",
        {},
        "INFO",
      );

      const remainingProposals = state.pendingProposals.filter(
        (p) => p.id !== proposal.id,
      );

      return {
        ...state,
        pendingProposals: remainingProposals,
        turnLogs: [...state.turnLogs, guaranteeLog],
        nations: {
          ...state.nations,
          [sender.id]: updatedSender,
        },
      };
    }

    const senderRel =
      sender.relations[canonicalReceiverId] ||
      sender.relations[proposal.receiverNationId];
    const receiverRel =
      receiver.relations[canonicalSenderId] ||
      receiver.relations[proposal.senderNationId];

    if (!senderRel || !receiverRel) {
      return this.removeProposal(state, proposal.id);
    }

    const updatedSenderRel = this.treatyEvaluator.applyTreatyStance(
      senderRel,
      proposal.proposalType,
    );
    const updatedReceiverRel = this.treatyEvaluator.applyTreatyStance(
      receiverRel,
      proposal.proposalType,
    );

    const reputationBonus = 1;

    let senderWarFocus = sender.warFocusTargetId;
    let receiverWarFocus = receiver.warFocusTargetId;

    if (proposal.proposalType === "PEACE_TREATY") {
      if (senderWarFocus === receiver.id) senderWarFocus = null;
      if (receiverWarFocus === sender.id) receiverWarFocus = null;
    }

    const updatedSender = {
      ...sender,
      globalReputation: Math.min(
        100,
        sender.globalReputation + reputationBonus,
      ),
      warFocusTargetId: senderWarFocus,
      relations: {
        ...sender.relations,
        [senderRel.targetNationId]: updatedSenderRel,
      },
    };

    const updatedReceiver = {
      ...receiver,
      globalReputation: Math.min(
        100,
        receiver.globalReputation + reputationBonus,
      ),
      warFocusTargetId: receiverWarFocus,
      relations: {
        ...receiver.relations,
        [receiverRel.targetNationId]: updatedReceiverRel,
      },
    };

    const treatyLabel =
      proposal.proposalType === "STRATEGIC_PARTNERSHIP"
        ? "شراکت استراتژیک و اقتصادی"
        : proposal.proposalType === "NON_AGGRESSION_PACT"
          ? "پیمان عدم تخاصم"
          : "معاهده صلح و پایان جنگ";

    let foundMatchingLog = false;
    const updatedLogs = state.turnLogs.map((log) => {
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

    const finalLogs = foundMatchingLog
      ? updatedLogs
      : [
          ...state.turnLogs,
          TurnLogBuilder.createGlobalDiplomacyLog(
            state.currentTurn,
            sender.id,
            receiver.id,
            "TREATY_ACCEPTED",
            { treatyLabel },
            "INFO",
          ),
        ];

    const remainingProposals = state.pendingProposals.filter(
      (p) => p.id !== proposal.id,
    );

    return {
      ...state,
      pendingProposals: remainingProposals,
      turnLogs: finalLogs,
      nations: {
        ...state.nations,
        [sender.id]: updatedSender,
        [receiver.id]: updatedReceiver,
      },
    };
  }

  public static applyRejection(
    state: GameState,
    proposal: PendingDiplomaticProposal,
  ): GameState {
    const canonicalSenderId = CountryRegistry.resolveCanonicalId(
      proposal.senderNationId,
    );
    const canonicalReceiverId = CountryRegistry.resolveCanonicalId(
      proposal.receiverNationId,
    );

    const treatyLabel =
      proposal.proposalType === "STRATEGIC_PARTNERSHIP"
        ? "شراکت استراتژیک"
        : proposal.proposalType === "NON_AGGRESSION_PACT"
          ? "عدم تخاصم"
          : proposal.proposalType === "SECURITY_GUARANTEE"
            ? "چتر امنیتی"
            : "صلح";

    let foundMatchingLog = false;
    const updatedLogs = state.turnLogs.map((log) => {
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

    const finalLogs = foundMatchingLog
      ? updatedLogs
      : [
          ...state.turnLogs,
          TurnLogBuilder.createGlobalDiplomacyLog(
            state.currentTurn,
            proposal.receiverNationId,
            proposal.senderNationId,
            "TREATY_REJECTED",
            { treatyLabel },
            "WARNING",
          ),
        ];

    const remainingProposals = state.pendingProposals.filter(
      (p) => p.id !== proposal.id,
    );

    return {
      ...state,
      pendingProposals: remainingProposals,
      turnLogs: finalLogs,
    };
  }

  private static removeProposal(
    state: GameState,
    proposalId: string,
  ): GameState {
    return {
      ...state,
      pendingProposals: state.pendingProposals.filter(
        (p) => p.id !== proposalId,
      ),
    };
  }
}
