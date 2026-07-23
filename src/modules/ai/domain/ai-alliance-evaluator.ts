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
      return receiver.military.infantry < sender.military.infantry * 0.3;
    }

    return false;
  }
}
