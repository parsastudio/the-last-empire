import {
  GameState,
  PendingDiplomaticProposal,
  CountryRegistry,
  PendingProposalManagerUtility,
  getNationGdp,
  StrategicPartnershipCalculatorUtility,
} from "@geopolitics/domain";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";
import { DiplomaticLogSynchronizer } from "@/engine/diplomacy/appliers/diplomatic-log-synchronizer";
import { SecurityGuaranteeApplier } from "@/engine/diplomacy/appliers/security-guarantee-applier";
import { PeaceTreatyApplier } from "@/engine/diplomacy/appliers/peace-treaty-applier";

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
      return SecurityGuaranteeApplier.apply(state, proposal, sender, receiver);
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

    let updatedSender = sender;
    let updatedReceiver = receiver;
    let signingCost = 0;

    if (proposal.proposalType === "STRATEGIC_PARTNERSHIP") {
      const receiverGdp = getNationGdp(receiver, state.provinces);
      signingCost =
        StrategicPartnershipCalculatorUtility.calculateSigningCost(receiverGdp);

      updatedSender = {
        ...updatedSender,
        treasury: Math.max(0, updatedSender.treasury - signingCost),
      };
      updatedReceiver = {
        ...updatedReceiver,
        treasury: updatedReceiver.treasury + signingCost,
      };
    }

    const treatyState = PeaceTreatyApplier.applyTreatyState(
      updatedSender,
      updatedReceiver,
      senderRel,
      receiverRel,
      proposal,
      this.treatyEvaluator,
    );

    updatedSender = treatyState.updatedSender;
    updatedReceiver = treatyState.updatedReceiver;

    const treatyLabel = proposal.proposalType;

    const finalLogs = DiplomaticLogSynchronizer.syncAcceptanceLogs(
      state.turnLogs,
      proposal,
      treatyLabel,
      state.currentTurn,
      sender.id,
      receiver.id,
    );

    const remainingProposals = PendingProposalManagerUtility.removeById(
      state.pendingProposals,
      proposal.id,
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
    const treatyLabel = proposal.proposalType;

    const finalLogs = DiplomaticLogSynchronizer.syncRejectionLogs(
      state.turnLogs,
      proposal,
      treatyLabel,
      state.currentTurn,
    );

    const remainingProposals = PendingProposalManagerUtility.removeById(
      state.pendingProposals,
      proposal.id,
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
      pendingProposals: PendingProposalManagerUtility.removeById(
        state.pendingProposals,
        proposalId,
      ),
    };
  }
}
