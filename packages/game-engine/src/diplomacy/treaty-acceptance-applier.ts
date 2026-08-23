import { GameState } from "@/domain/game/game-state.schema";
import { PendingDiplomaticProposal } from "@/domain/diplomacy/diplomacy.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";
import { TurnLogBuilder } from "@/domain/shared/domain-utilities";

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

    let reputationBonus = 0;
    if (proposal.proposalType === "NON_AGGRESSION_PACT") {
      reputationBonus = 1;
    } else if (proposal.proposalType === "FULL_ALLIANCE") {
      reputationBonus = 1;
    } else if (proposal.proposalType === "PEACE_TREATY") {
      reputationBonus = 2;
    }

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
      proposal.proposalType === "FULL_ALLIANCE"
        ? "اتحاد کامل راهبردی"
        : proposal.proposalType === "NON_AGGRESSION_PACT"
          ? "پیمان عدم تخاصم"
          : "معاهده صلح و پایان جنگ";

    const canonicalHuman = CountryRegistry.resolveCanonicalId(
      state.humanNationId,
    );
    const isHumanInvolved =
      canonicalSenderId === canonicalHuman ||
      canonicalReceiverId === canonicalHuman;

    const newLogs = [
      TurnLogBuilder.createGlobalDiplomacyLog(
        state.currentTurn,
        sender.id,
        receiver.id,
        "TREATY_ACCEPTED",
        { treatyLabel },
        "INFO",
      ),
    ];

    if (isHumanInvolved) {
      newLogs.push(
        TurnLogBuilder.createNationalLog(
          state.currentTurn,
          sender.id,
          "DIPLOMACY",
          "INFO",
          "TREATY_ACCEPTED",
          { treatyLabel },
          receiver.id,
        ),
      );
    }

    const remainingProposals = state.pendingProposals.filter(
      (p) => p.id !== proposal.id,
    );

    return {
      ...state,
      pendingProposals: remainingProposals,
      turnLogs: [...state.turnLogs, ...newLogs],
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
      proposal.proposalType === "FULL_ALLIANCE"
        ? "اتحاد کامل"
        : proposal.proposalType === "NON_AGGRESSION_PACT"
          ? "عدم تخاصم"
          : "صلح";

    const canonicalHuman = CountryRegistry.resolveCanonicalId(
      state.humanNationId,
    );
    const isHumanInvolved =
      canonicalSenderId === canonicalHuman ||
      canonicalReceiverId === canonicalHuman;

    const newLogs = [
      TurnLogBuilder.createGlobalDiplomacyLog(
        state.currentTurn,
        proposal.receiverNationId,
        proposal.senderNationId,
        "TREATY_REJECTED",
        { treatyLabel },
        "WARNING",
      ),
    ];

    if (isHumanInvolved) {
      newLogs.push(
        TurnLogBuilder.createNationalLog(
          state.currentTurn,
          proposal.receiverNationId,
          "DIPLOMACY",
          "WARNING",
          "TREATY_REJECTED",
          { treatyLabel },
          proposal.senderNationId,
        ),
      );
    }

    const remainingProposals = state.pendingProposals.filter(
      (p) => p.id !== proposal.id,
    );

    return {
      ...state,
      pendingProposals: remainingProposals,
      turnLogs: [...state.turnLogs, ...newLogs],
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
