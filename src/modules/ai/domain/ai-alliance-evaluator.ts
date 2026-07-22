import type { Nation } from "@/core/types/nation.types";
import type { DiplomaticProposalType } from "@/core/types/diplomacy.types";

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

    if (receiver.reputation < -50) {
      return false;
    }

    const opinion = relation.opinion;

    switch (proposalType) {
      case "NON_AGGRESSION_PACT":
        return opinion >= -10;
      case "DEFENSIVE_PACT":
        return opinion >= 30;
      case "FULL_ALLIANCE":
        return opinion >= 60 && sender.reputation >= 20;
      case "PEACE_TREATY":
        return receiver.warExhaustion > 40 || opinion > -20;
      case "MILITARY_ACCESS":
        return opinion >= 20;
      case "LIFT_EMBARGO":
        return opinion >= 10;
      case "DEMAND_TRIBUTE":
        return receiver.military.infantry < sender.military.infantry * 0.3;
      default:
        return false;
    }
  }
}
