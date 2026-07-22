import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { DiplomaticProposalType } from "@/modules/diplomacy/schemas/diplomacy.schema";

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
    const trust = relation.trust;

    switch (proposalType) {
      case "NON_AGGRESSION_PACT":
        return opinion >= -10 && trust >= -10;
      case "DEFENSIVE_PACT":
        return opinion >= 30 && trust >= 20;
      case "FULL_ALLIANCE":
        return opinion >= 60 && sender.reputation >= 20 && trust >= 50;
      case "PEACE_TREATY":
        return receiver.warExhaustion > 40 || opinion > -20;
      case "MILITARY_ACCESS":
        return opinion >= 20 && trust >= 10;
      case "LIFT_EMBARGO":
        return opinion >= 10 && trust >= 0;
      case "DEMAND_TRIBUTE":
        return receiver.military.infantry < sender.military.infantry * 0.3;
      default:
        return false;
    }
  }
}
