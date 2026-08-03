import { GameAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { AIPersonalityType } from "@/domain/ai/ai.schema";
import { NationIdResolver } from "@/domain/shared/domain-utilities";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";

export class AIActionBuilder {
  public static buildNationActions(
    nation: Nation,
    allNations: Record<string, Nation>,
    personality: AIPersonalityType,
    currentTurn: number,
  ): GameAction[] {
    const actions: GameAction[] = [];
    let seq = 1;
    const cleanNation = nation.id.replace("NATION_", "");

    const makeId = (type: string) =>
      `ai-${type}-${cleanNation}-t${currentTurn}-s${seq++}`;

    if (nation.doctrines && nation.doctrines.doctrinePoints >= 3) {
      actions.push({
        id: makeId("unlock-doctrine"),
        nationId: nation.id,
        type: "UNLOCK_DOCTRINE",
        doctrineId: "gdp-booster",
      });
    }

    if (
      nation.government &&
      nation.government.corruption > 35 &&
      nation.treasury > 20000
    ) {
      actions.push({
        id: makeId("anti-corruption"),
        nationId: nation.id,
        type: "ANTI_CORRUPTION_DRIVE",
        amount: Math.min(15000, Math.floor(nation.treasury * 0.1)),
      });
    }

    if (nation.treasury > 50000) {
      actions.push({
        id: makeId("invest-infra"),
        nationId: nation.id,
        type: "INVEST_INFRASTRUCTURE",
      });
    }

    if (nation.treasury > 150000) {
      actions.push({
        id: makeId("invest-research"),
        nationId: nation.id,
        type: "INVEST_RESEARCH",
      });
    }

    const isAggressive = personality === "AGGRESSIVE";
    const recruitBudget = isAggressive
      ? nation.treasury * 0.4
      : nation.treasury * 0.2;

    const airStats = MILITARY_UNIT_STATS.AIR_FORCE;
    const infStats = MILITARY_UNIT_STATS.INFANTRY;

    if (
      nation.resources &&
      recruitBudget >= airStats.moneyCost &&
      nation.resources.manpower >= airStats.manpowerCost &&
      nation.resources.steel >= airStats.steelCost
    ) {
      const airQty = Math.min(
        Math.floor(recruitBudget / airStats.moneyCost),
        Math.floor(nation.resources.manpower / airStats.manpowerCost),
        Math.floor(nation.resources.steel / airStats.steelCost),
      );
      if (airQty > 0) {
        actions.push({
          id: makeId("recruit-air"),
          nationId: nation.id,
          type: "RECRUIT_UNIT",
          unitType: "AIR_FORCE",
          quantity: airQty,
        });
      }
    } else if (
      nation.resources &&
      recruitBudget >= infStats.moneyCost &&
      nation.resources.manpower >= infStats.manpowerCost
    ) {
      const infQty = Math.min(
        Math.floor(recruitBudget / infStats.moneyCost),
        Math.floor(nation.resources.manpower / infStats.manpowerCost),
      );
      if (infQty > 0) {
        actions.push({
          id: makeId("recruit-infantry"),
          nationId: nation.id,
          type: "RECRUIT_UNIT",
          unitType: "INFANTRY",
          quantity: infQty,
        });
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
        actions.push({
          id: makeId("diplomacy-proposal"),
          nationId: nation.id,
          type: "DIPLOMATIC_PROPOSAL",
          targetNationId: target.id,
          proposalType: "SEVER_TRADE_RELATIONS",
        });
      }
    }

    if (
      nation.resources &&
      nation.resources.oil < 10 &&
      nation.treasury > 50000000
    ) {
      actions.push({
        id: makeId("trade-oil"),
        nationId: nation.id,
        type: "TRADE_RESOURCES",
        resourceType: "oil",
        isBuy: true,
        amount: 5,
      });
    }

    return actions;
  }
}
