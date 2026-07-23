import type { Nation } from "@/domain/nation/nation.schema";
import type { DiplomaticProposalType } from "@/domain/diplomacy/diplomacy.schema";

export class AIAllianceEvaluator {
  public shouldAcceptTreaty(
    sender: Nation,
    receiver: Nation,
    proposalType: DiplomaticProposalType,
  ): boolean {
    const relation = receiver.relations[sender.id];
    if (!relation) {
      return false;
    }

    if (receiver.globalReputation < -50) {
      return false;
    }

    const opinion = relation.opinion;

    if (proposalType === "NON_AGGRESSION_PACT") {
      return opinion >= -10;
    }
    if (proposalType === "FULL_ALLIANCE") {
      return opinion >= 60 && sender.globalReputation >= 20;
    }
    if (proposalType === "PEACE_TREATY") {
      return receiver.warExhaustion > 40 || opinion > -20;
    }
    if (proposalType === "MILITARY_ACCESS") {
      return opinion >= 20;
    }
    if (proposalType === "DEMAND_TRIBUTE") {
      const receiverPower =
        receiver.military.infantry * 1.0 +
        receiver.military.airForce * 3.0 +
        receiver.military.droneMissile * 2.5;
      const senderPower =
        sender.military.infantry * 1.0 +
        sender.military.airForce * 3.0 +
        sender.military.droneMissile * 2.5;

      return receiverPower < senderPower * 0.3;
    }

    return false;
  }
}
