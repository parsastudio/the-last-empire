import {
  GameAction,
  ActionFactory,
  Nation,
  CountryRegistry,
  NationRelationResolver,
} from "@geopolitics/domain";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";
import { TurnContext } from "@/engine/pipeline/turn-context";

export class AIEconomicDiplomacyEvaluator {
  public static evaluate(
    nation: Nation,
    context: TurnContext,
    geopoliticsBudget?: number,
    availableTreasury?: number,
  ): { action: GameAction; cost: number } | null {
    const currentBudget =
      geopoliticsBudget !== undefined
        ? geopoliticsBudget
        : Math.floor(nation.treasury * 0.15);
    const currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;

    if (currentBudget <= 0 || currentTreasury <= 0 || !nation.relations) {
      return null;
    }

    const targets = context.getReachableTargets(nation);
    const hegemonicTargetId = context.globalCoalition?.targetNationId;

    for (let i = 0; i < targets.length; i++) {
      const targetNation = targets[i]!;
      const canonicalTarget = CountryRegistry.resolveCanonicalId(
        targetNation.id,
      );

      if (hegemonicTargetId && canonicalTarget === hegemonicTargetId) {
        continue;
      }

      const rel = NationRelationResolver.getRelation(
        nation.relations,
        canonicalTarget,
      );

      if (!rel || rel.stance === "WAR") continue;

      const vector = context.getVector(nation, targetNation);
      if (!vector || vector.tension > 30 || vector.alignment < 15) {
        continue;
      }

      const targetGdp = context.getNationGdp(targetNation.id);
      const cost = TreatyEvaluator.calculateForeignAidCost(targetGdp);

      if (currentBudget < cost || currentTreasury < cost) {
        continue;
      }

      return {
        action: ActionFactory.sendForeignAid(nation.id, targetNation.id),
        cost,
      };
    }

    return null;
  }
}
