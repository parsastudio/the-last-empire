import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { AIPersonalityType } from "@/domain/ai/ai.schema";

export class AIActionBuilder {
  public static buildNationActions(
    nation: Nation,
    allNations: Record<string, Nation>,
    personality: AIPersonalityType,
  ): GameAction[] {
    const actions: GameAction[] = [];

    const currentUnlocked = nation.doctrines?.unlockedDoctrines || [];
    if (
      !currentUnlocked.includes("gdp-booster") &&
      nation.treasury >= 15000000000
    ) {
      actions.push(ActionFactory.unlockDoctrine(nation.id, "gdp-booster"));
    }

    if (nation.treasury > 50000) {
      actions.push(ActionFactory.investInfrastructure(nation.id));
    }

    if (nation.treasury > 150000) {
      actions.push(ActionFactory.investResearch(nation.id));
    }

    const isAggressive = personality === "AGGRESSIVE";
    const recruitBudget = isAggressive
      ? nation.treasury * 0.4
      : nation.treasury * 0.2;

    const airMoneyCost = 1400000000;
    const infMoneyCost = 350000000;

    if (recruitBudget >= airMoneyCost) {
      const airQty = Math.floor(recruitBudget / airMoneyCost);
      if (airQty > 0) {
        actions.push(ActionFactory.recruitUnit(nation.id, "AIR_FORCE", airQty));
      }
    } else if (recruitBudget >= infMoneyCost) {
      const infQty = Math.floor(recruitBudget / infMoneyCost);
      if (infQty > 0) {
        actions.push(ActionFactory.recruitUnit(nation.id, "INFANTRY", infQty));
      }
    }

    for (const [targetId, relation] of Object.entries(nation.relations || {})) {
      if (actions.length >= 6) break;
      if (!relation) continue;

      const canonicalTargetId = CountryRegistry.resolveCanonicalId(targetId);
      const target = allNations[targetId] || allNations[canonicalTargetId];
      if (!target || !target.isAlive) continue;

      if (
        relation.opinion < -30 &&
        relation.stance !== "SEVERED_RELATIONS" &&
        relation.stance !== "WAR"
      ) {
        actions.push(
          ActionFactory.diplomaticProposal(
            nation.id,
            target.id,
            "SEVER_TRADE_RELATIONS",
          ),
        );
      }
    }

    return actions;
  }
}
