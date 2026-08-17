import { Nation } from "@/domain/nation/nation.schema";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";

export class DiplomaticTurnProcessor {
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

      let nextOpinion = relation.opinion;
      if (
        relation.stance !== "WAR" &&
        relation.stance !== "SEVERED_RELATIONS"
      ) {
        nextOpinion = Math.min(100, relation.opinion + 1);
      }

      let nextGrudge = relation.grudge ?? 0;
      if (relation.stance !== "WAR" && nextGrudge > 0) {
        nextGrudge = Math.max(0, nextGrudge - 2);
      }

      let nextStance = relation.stance;
      if (
        nation.globalReputation <= -30 &&
        nextOpinion < 0 &&
        relation.stance === "NORMAL_DIPLOMACY"
      ) {
        nextStance = "SEVERED_RELATIONS";
      }

      newRels[targetId] = {
        ...relation,
        stance: nextStance,
        opinion: nextOpinion,
        grudge: nextGrudge,
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
