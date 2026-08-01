import { GameAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { AIPersonalityType } from "@/domain/ai/ai.schema";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";

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

    if (
      nation.resources &&
      recruitBudget >= 1000000000 &&
      nation.resources.manpower >= 5 &&
      nation.resources.steel >= 2
    ) {
      const airQty = Math.min(
        Math.floor(recruitBudget / 1000000000),
        Math.floor(nation.resources.manpower / 5),
        Math.floor(nation.resources.steel / 2),
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
      recruitBudget >= 250000000 &&
      nation.resources.manpower >= 10
    ) {
      const infQty = Math.min(
        Math.floor(recruitBudget / 250000000),
        Math.floor(nation.resources.manpower / 10),
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
        relation.opinion > 10 &&
        relation.opinion < 80 &&
        nation.treasury > 20000
      ) {
        actions.push({
          id: makeId("diplomacy-proposal"),
          nationId: nation.id,
          type: "DIPLOMATIC_PROPOSAL",
          targetNationId: target.id,
          proposalType:
            relation.stance === "NORMAL_DIPLOMACY"
              ? "NON_AGGRESSION_PACT"
              : "FULL_ALLIANCE",
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
