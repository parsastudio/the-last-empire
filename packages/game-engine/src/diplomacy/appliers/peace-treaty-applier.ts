import {
  Nation,
  RelationProfile,
  PendingDiplomaticProposal,
  DIPLOMACY_CONFIG,
} from "@geopolitics/domain";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";

export class PeaceTreatyApplier {
  public static applyTreatyState(
    sender: Nation,
    receiver: Nation,
    senderRel: RelationProfile,
    receiverRel: RelationProfile,
    proposal: PendingDiplomaticProposal,
    treatyEvaluator: TreatyEvaluator,
  ): { updatedSender: Nation; updatedReceiver: Nation } {
    const updatedSenderRel = treatyEvaluator.applyTreatyStance(
      senderRel,
      proposal.proposalType,
    );
    const updatedReceiverRel = treatyEvaluator.applyTreatyStance(
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

    const isPeace = proposal.proposalType === "PEACE_TREATY";
    const senderCooldown =
      sender.isAi && isPeace
        ? DIPLOMACY_CONFIG.POST_WAR_COOLDOWN_TURNS
        : sender.postWarCooldownTurns || 0;
    const receiverCooldown =
      receiver.isAi && isPeace
        ? DIPLOMACY_CONFIG.POST_WAR_COOLDOWN_TURNS
        : receiver.postWarCooldownTurns || 0;

    const updatedSender: Nation = {
      ...sender,
      globalReputation: Math.min(
        100,
        sender.globalReputation + reputationBonus,
      ),
      warFocusTargetId: senderWarFocus,
      postWarCooldownTurns: senderCooldown,
      relations: {
        ...sender.relations,
        [senderRel.targetNationId]: updatedSenderRel,
      },
    };

    const updatedReceiver: Nation = {
      ...receiver,
      globalReputation: Math.min(
        100,
        receiver.globalReputation + reputationBonus,
      ),
      warFocusTargetId: receiverWarFocus,
      postWarCooldownTurns: receiverCooldown,
      relations: {
        ...receiver.relations,
        [receiverRel.targetNationId]: updatedReceiverRel,
      },
    };

    return { updatedSender, updatedReceiver };
  }
}
