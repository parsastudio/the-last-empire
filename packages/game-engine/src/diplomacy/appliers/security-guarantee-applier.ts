import {
  GameState,
  PendingDiplomaticProposal,
  Nation,
  TurnLogBuilder,
  PendingProposalManagerUtility,
} from "@geopolitics/domain";

export class SecurityGuaranteeApplier {
  public static apply(
    state: GameState,
    proposal: PendingDiplomaticProposal,
    sender: Nation,
    receiver: Nation,
  ): GameState {
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
      },
    };
  }
}
