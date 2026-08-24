import {
  GameState,
  Nation,
  Province,
  RelationProfile,
  CountryRegistry,
  GeopoliticalReachResolver,
  NationGettersUtility,
} from "@geopolitics/domain";
import { GeopoliticalMatrixCache } from "@/engine/ai/geopolitical-matrix-cache";

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
    provincesByOwnerMap?: Map<string, Province[]>,
    matrixCache?: GeopoliticalMatrixCache,
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

    const reachableTargets = matrixCache
      ? matrixCache.getReachableTargets(nation, allNations || {}, provincesMap)
      : GeopoliticalReachResolver.getReachableTargets(
          nation,
          allNations || {},
          provincesMap,
          rankMap,
          NationGettersUtility.getOwnedProvinces(
            nation.id,
            provincesMap,
            provincesByOwnerMap,
          ),
          provincesByOwnerMap,
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

      let nextAlignment = relation.alignment ?? 0;
      if (relation.stance !== "WAR") {
        const baseline =
          targetNation &&
          nation.government.type === targetNation.government.type
            ? 15
            : 0;

        if (nextAlignment < baseline) {
          nextAlignment = Math.min(baseline, nextAlignment + 1);
        } else if (nextAlignment > baseline) {
          nextAlignment = Math.max(baseline, nextAlignment - 1);
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
          alignment: nextAlignment,
          tension: 0,
          grudge: nextGrudge,
        };
        continue;
      }

      const ideologyBonus =
        targetNation && nation.government.type === targetNation.government.type
          ? 15
          : 0;
      const targetRep = targetNation?.globalReputation ?? 50;
      const repEffect = Math.round((targetRep / 100) * 15);
      const currentAlignment = Math.max(
        -100,
        Math.min(100, nextAlignment + ideologyBonus + repEffect),
      );

      let currentTension = 10;
      if (relation.stance === "WAR") {
        currentTension = 100;
      } else if (relation.stance === "ALLIANCE") {
        currentTension = 0;
      } else if (relation.stance === "NON_AGGRESSION_PACT") {
        currentTension = 5;
      } else {
        currentTension = Math.min(100, nextGrudge + 10);
      }

      newRels[targetId] = {
        ...relation,
        alignment: currentAlignment,
        tension: currentTension,
        grudge: nextGrudge,
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
