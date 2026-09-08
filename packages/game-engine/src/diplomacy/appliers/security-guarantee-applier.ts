import {
  GameState,
  PendingDiplomaticProposal,
  Nation,
  TurnLogBuilder,
  PendingProposalManagerUtility,
  CountryRegistry,
  getNationGdp,
  SecurityFeeCalculatorUtility,
} from "@geopolitics/domain";

export class SecurityGuaranteeApplier {
  public static apply(
    state: GameState,
    proposal: PendingDiplomaticProposal,
    sender: Nation,
    receiver: Nation,
  ): GameState {
    const canonicalReceiver = CountryRegistry.resolveCanonicalId(receiver.id);
    const existingGuarantors = sender.defenseGuarantorIds || [];

    const updatedGuarantorIds = Array.from(
      new Set([...existingGuarantors, canonicalReceiver]),
    ).slice(0, 2);

    const guarantorGdp = getNationGdp(receiver, state.provinces);
    const signingCost =
      SecurityFeeCalculatorUtility.calculateSigningCost(guarantorGdp);

    const updatedSender = {
      ...sender,
      treasury: Math.max(0, sender.treasury - signingCost),
      defenseGuarantorIds: updatedGuarantorIds,
    };

    const updatedReceiver = {
      ...receiver,
      treasury: receiver.treasury + signingCost,
    };

    const guaranteeLog = TurnLogBuilder.createGlobalDiplomacyLog(
      state.currentTurn,
      sender.id,
      receiver.id,
      "SECURITY_GUARANTEE_SIGNED",
      { cost: signingCost },
      "INFO",
    );

    const remainingProposals = PendingProposalManagerUtility.removeById(
      state.pendingProposals,
      proposal.id,
    );

    return {
      ...state,
      pendingProposals: remainingProposals,
      turnLogs: [...state.turnLogs, guaranteeLog],
      nations: {
        ...state.nations,
        [sender.id]: updatedSender,
        [receiver.id]: updatedReceiver,
      },
    };
  }
}
