import { GameState } from "@/domain/game/game-state.schema";
import { PendingDiplomaticProposal } from "@/domain/diplomacy/diplomacy.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";
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
      reputationBonus = 3;
    } else if (proposal.proposalType === "FULL_ALLIANCE") {
      reputationBonus = 6;
    } else if (proposal.proposalType === "PEACE_TREATY") {
      reputationBonus = 5;
    }

    let senderWarFocus = sender.warFocusTargetId;
    let receiverWarFocus = receiver.warFocusTargetId;

    if (proposal.proposalType === "PEACE_TREATY") {
      if (senderWarFocus === receiver.id) senderWarFocus = null;
      if (receiverWarFocus === sender.id) receiverWarFocus = null;
    }

    const senderStabBonus =
      StabilityCalculator.calculateDiplomaticStabilityBonus(
        proposal.proposalType,
        true,
      );
    const receiverStabBonus =
      StabilityCalculator.calculateDiplomaticStabilityBonus(
        proposal.proposalType,
        false,
      );

    const updatedSender = {
      ...sender,
      globalReputation: Math.min(
        100,
        sender.globalReputation + reputationBonus,
      ),
      warFocusTargetId: senderWarFocus,
      government: {
        ...sender.government,
        stability: StabilityCalculator.clampStability(
          sender.government.stability + senderStabBonus,
        ),
      },
      relations: {
        ...sender.relations,
        [senderRel.targetNationId]: updatedSenderRel,
      },
    };

    const updatedReceiver = {
      ...receiver,
      globalReputation: Math.min(
        100,
        receiver.globalReputation + Math.floor(reputationBonus * 0.5),
      ),
      warFocusTargetId: receiverWarFocus,
      government: {
        ...receiver.government,
        stability: StabilityCalculator.clampStability(
          receiver.government.stability + receiverStabBonus,
        ),
      },
      relations: {
        ...receiver.relations,
        [receiverRel.targetNationId]: updatedReceiverRel,
      },
    };

    const logEntry = TurnLogBuilder.createLogEntry(
      state.currentTurn,
      receiver.id,
      "INFO",
      `توافق دیپلماتیک: کشور ${receiver.name} پیشنهاد معاهده (${proposal.proposalType}) از سوی ${sender.name} را پذیرفت.`,
    );

    const remainingProposals = state.pendingProposals.filter(
      (p) => p.id !== proposal.id,
    );

    return {
      ...state,
      pendingProposals: remainingProposals,
      turnLogs: [...state.turnLogs, logEntry],
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

    const sender =
      state.nations[canonicalSenderId] ||
      state.nations[proposal.senderNationId];
    const receiver =
      state.nations[canonicalReceiverId] ||
      state.nations[proposal.receiverNationId];

    const senderName = sender ? sender.name : proposal.senderNationId;
    const receiverName = receiver ? receiver.name : proposal.receiverNationId;

    const logEntry = TurnLogBuilder.createLogEntry(
      state.currentTurn,
      proposal.receiverNationId,
      "WARNING",
      `رد پیشنهاد دیپلماتیک: کشور ${receiverName} پیشنهاد معاهده (${proposal.proposalType}) از سوی ${senderName} را رد نمود.`,
    );

    const remainingProposals = state.pendingProposals.filter(
      (p) => p.id !== proposal.id,
    );

    return {
      ...state,
      pendingProposals: remainingProposals,
      turnLogs: [...state.turnLogs, logEntry],
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
