import {
  GameState,
  Nation,
  Province,
  RelationProfile,
  CountryRegistry,
  GeopoliticalReachResolver,
  NationGettersUtility,
} from "@geopolitics/domain";
import { GeopoliticalVectorCalculator } from "@/engine/ai/geopolitical-vector-calculator";

export class DiplomaticTurnProcessor {
  public static processPendingProposalsForAi(state: GameState): GameState {
    const validPendingProposals = state.pendingProposals.filter(
      (proposal) => state.currentTurn <= proposal.expiresTurn,
    );

    if (validPendingProposals.length === state.pendingProposals.length) {
      return state;
    }

    return {
      ...state,
      pendingProposals: validPendingProposals,
    };
  }

  public static process(
    nation: Nation,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    rankMap?: Map<string, number>,
  ): {
    updatedNation: Nation;
    isAtWar: boolean;
  } {
    if (!nation.relations) {
      return { updatedNation: nation, isAtWar: false };
    }

    let isAtWar = false;
    const relKeys = Object.keys(nation.relations);
    const newRels: Record<string, RelationProfile> = { ...nation.relations };

    const myProvs = NationGettersUtility.getOwnedProvinces(
      nation.id,
      provincesMap,
    );

    const reachableTargets = GeopoliticalReachResolver.getReachableTargets(
      nation,
      allNations || {},
      provincesMap,
      rankMap,
      myProvs,
    );

    const reachableCanonicalSet = new Set(
      reachableTargets.map((t) => CountryRegistry.resolveCanonicalId(t.id)),
    );

    for (let j = 0; j < relKeys.length; j++) {
      const targetId = relKeys[j]!;
      const relation = newRels[targetId];
      if (!relation) continue;

      const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
      const targetNation = allNations
        ? allNations[canonicalTarget] || allNations[targetId]
        : null;

      if (relation.stance === "WAR") {
        if (targetNation && targetNation.isAlive) {
          isAtWar = true;
        }
      }

      let nextOpinion = relation.opinion;
      if (relation.stance !== "WAR") {
        const baselineOpinion =
          targetNation &&
          nation.government.type === targetNation.government.type
            ? 15
            : 0;

        if (relation.opinion < baselineOpinion) {
          nextOpinion = Math.min(baselineOpinion, relation.opinion + 1);
        } else if (relation.opinion > baselineOpinion) {
          nextOpinion = Math.max(baselineOpinion, relation.opinion - 1);
        }
      }

      let nextGrudge = relation.grudge ?? 0;
      if (relation.stance !== "WAR" && nextGrudge > 0) {
        nextGrudge = Math.max(0, nextGrudge - 3);
      }

      const isReachable = reachableCanonicalSet.has(canonicalTarget);

      if (!isReachable) {
        newRels[targetId] = {
          ...relation,
          opinion: nextOpinion,
          grudge: nextGrudge,
          alignment: nextOpinion,
          tension: 0,
        };
        continue;
      }

      const vector = targetNation
        ? GeopoliticalVectorCalculator.calculate(
            nation,
            targetNation,
            allNations,
            provincesMap,
            myProvs,
          )
        : null;

      newRels[targetId] = {
        ...relation,
        opinion: nextOpinion,
        grudge: nextGrudge,
        alignment: vector ? vector.alignment : relation.alignment,
        tension: vector ? vector.tension : relation.tension,
      };
    }

    let nextWarFocus = nation.warFocusTargetId ?? null;
    if (nextWarFocus) {
      const canonicalFocus = CountryRegistry.resolveCanonicalId(nextWarFocus);
      const focusRel = newRels[canonicalFocus] || newRels[nextWarFocus];
      const focusTarget = allNations
        ? allNations[canonicalFocus] || allNations[nextWarFocus]
        : null;
      const isFocusAlive = focusTarget ? focusTarget.isAlive : true;

      if (!focusRel || focusRel.stance !== "WAR" || !isFocusAlive) {
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
