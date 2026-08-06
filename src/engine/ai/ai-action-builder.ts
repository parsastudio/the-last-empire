import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import {
  Nation,
  NationIdResolver,
  AIPersonalityType,
} from "@/domain/shared/domain-utilities";

export class AIActionBuilder {
  public static buildNationActions(
    nation: Nation,
    allNations: Record<string, Nation>,
    personality: AIPersonalityType,
  ): GameAction[] {
    const actions: GameAction[] = [];

    if (nation.doctrines && nation.doctrines.doctrinePoints >= 3) {
      actions.push(ActionFactory.unlockDoctrine(nation.id, "gdp-booster"));
    }

    if (
      nation.government &&
      nation.government.corruption > 35 &&
      nation.treasury > 20000
    ) {
      const amount = Math.min(15000, Math.floor(nation.treasury * 0.1));
      actions.push(ActionFactory.antiCorruptionDrive(nation.id, amount));
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

    const airMoneyCost = 1000000000;
    const airSteelCost = 20;
    const airManpowerCost = 5;

    const infMoneyCost = 250000000;
    const infManpowerCost = 10;

    if (
      nation.resources &&
      recruitBudget >= airMoneyCost &&
      nation.resources.manpower >= airManpowerCost &&
      nation.resources.steel >= airSteelCost
    ) {
      const airQty = Math.min(
        Math.floor(recruitBudget / airMoneyCost),
        Math.floor(nation.resources.manpower / airManpowerCost),
        Math.floor(nation.resources.steel / airSteelCost),
      );
      if (airQty > 0) {
        actions.push(ActionFactory.recruitUnit(nation.id, "AIR_FORCE", airQty));
      }
    } else if (
      nation.resources &&
      recruitBudget >= infMoneyCost &&
      nation.resources.manpower >= infManpowerCost
    ) {
      const infQty = Math.min(
        Math.floor(recruitBudget / infMoneyCost),
        Math.floor(nation.resources.manpower / infManpowerCost),
      );
      if (infQty > 0) {
        actions.push(ActionFactory.recruitUnit(nation.id, "INFANTRY", infQty));
      }
    }

    for (const [targetId, relation] of Object.entries(nation.relations || {})) {
      if (actions.length >= 6) break;
      if (!relation) continue;

      const canonicalTargetId = NationIdResolver.resolveCanonicalId(targetId);
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

    if (
      nation.resources &&
      nation.resources.oil < 10 &&
      nation.treasury > 50000000
    ) {
      actions.push(ActionFactory.tradeResources(nation.id, "oil", true, 5));
    }

    return actions;
  }
}
