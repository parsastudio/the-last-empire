import { Nation } from "@/domain/nation/nation.schema";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";
import { CoolOffManager } from "@/engine/diplomacy/diplomacy-engine";

export class DiplomaticTurnProcessor {
  private static coolOffManager = new CoolOffManager();

  public static process(nation: Nation): {
    updatedNation: Nation;
    isAtWar: boolean;
  } {
    if (!nation.relations) {
      return { updatedNation: nation, isAtWar: false };
    }

    let isAtWar = false;
    const relKeys = Object.keys(nation.relations);
    const newRels: Record<string, RelationProfile> = {
      ...nation.relations,
    };

    for (let j = 0; j < relKeys.length; j++) {
      const targetId = relKeys[j]!;
      const relation = newRels[targetId];
      if (!relation) continue;

      if (relation.stance === "WAR") {
        isAtWar = true;
      }

      let nextCoolOff = relation.coolOffTurnsRemaining;
      if (relation.coolOffTurnsRemaining > 0) {
        nextCoolOff = this.coolOffManager.processTurnTick(
          relation.coolOffTurnsRemaining,
        );
      }

      let nextOpinion = relation.opinion;
      if (relation.stance !== "WAR" && !relation.isTradeEmbargoed) {
        nextOpinion = Math.min(100, relation.opinion + 1);
      }

      let nextGrudge = relation.grudge ?? 0;
      if (relation.stance !== "WAR" && nextGrudge > 0) {
        nextGrudge = Math.max(0, nextGrudge - 2);
      }

      let nextEmbargo = relation.isTradeEmbargoed;
      if (
        nation.globalReputation <= -30 &&
        nextOpinion < 0 &&
        relation.stance !== "ALLIANCE"
      ) {
        nextEmbargo = true;
      }

      newRels[targetId] = {
        ...relation,
        opinion: nextOpinion,
        grudge: nextGrudge,
        coolOffTurnsRemaining: nextCoolOff,
        isTradeEmbargoed: nextEmbargo,
      };
    }

    let nextWarFocus = nation.warFocusTargetId ?? null;
    if (nextWarFocus) {
      const focusRel = newRels[nextWarFocus];
      if (!focusRel || focusRel.stance !== "WAR") {
        nextWarFocus = null;
      }
    }

    return {
      updatedNation: {
        ...nation,
        relations: newRels,
        warFocusTargetId: nextWarFocus,
      },
      isAtWar,
    };
  }
}
