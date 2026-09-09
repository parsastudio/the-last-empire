import {
  GameState,
  Nation,
  Province,
  RelationProfile,
  CountryRegistry,
  PendingProposalManagerUtility,
  TerritoryClaimsUtility,
  TerritorialSaturationCalculatorUtility,
} from "@geopolitics/domain";
import { TurnContext } from "@/engine/pipeline/turn-context";

export class DiplomaticTurnProcessor {
  public static processPendingProposalsForAi(state: GameState): GameState {
    const validPendingProposals = PendingProposalManagerUtility.filterValidTurn(
      state.pendingProposals,
      state.currentTurn,
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
    allNations: Record<string, Nation>,
    provincesMap: Record<string, Province>,
    turnContext: TurnContext,
  ): {
    updatedNation: Nation;
    isAtWar: boolean;
  } {
    if (!nation.relations) {
      return { updatedNation: nation, isAtWar: false };
    }

    const canonicalSource = CountryRegistry.resolveCanonicalId(nation.id);
    let isAtWar = false;
    const relKeys = Object.keys(nation.relations);
    const newRels: Record<string, RelationProfile> = {};

    for (let i = 0; i < relKeys.length; i++) {
      const key = relKeys[i]!;
      const r = nation.relations[key];
      if (r) {
        newRels[key] = { ...r };
      }
    }

    const myProvs = turnContext.provincesByOwnerMap.get(canonicalSource) || [];

    const saturationScore =
      TerritorialSaturationCalculatorUtility.calculateSaturationScore(
        nation,
        provincesMap,
        myProvs,
      );

    const reachableTargets = turnContext.matrixCache.getReachableTargets(
      nation,
      allNations,
      provincesMap,
    );

    const reachableCanonicalSet = new Set(
      reachableTargets.map((t) => CountryRegistry.resolveCanonicalId(t.id)),
    );

    const occupiedMap = turnContext.matrixCache.getOccupiedTerritoryMap();

    for (let j = 0; j < relKeys.length; j++) {
      const targetId = relKeys[j]!;
      const relation = newRels[targetId];
      if (!relation) continue;

      const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
      const targetNation = allNations[canonicalTarget];

      if (relation.stance === "WAR") {
        if (targetNation && targetNation.isAlive) {
          isAtWar = true;
        }
      }

      let nextAlignment = relation.alignment ?? 0;
      if (relation.stance !== "WAR") {
        const lostCount = TerritoryClaimsUtility.getOccupiedProvinceCount(
          canonicalSource,
          canonicalTarget,
          occupiedMap,
        );

        const revanchismBaseline =
          lostCount > 0 ? Math.max(-35, -lostCount * 12) : 0;

        if (nextAlignment < revanchismBaseline) {
          nextAlignment = Math.min(revanchismBaseline, nextAlignment + 1);
        } else if (nextAlignment > revanchismBaseline) {
          nextAlignment = Math.max(revanchismBaseline, nextAlignment - 1);
        }
      }

      const isReachable = reachableCanonicalSet.has(canonicalTarget);

      let currentTension = relation.tension ?? 10;
      if (relation.stance === "WAR") {
        currentTension = 100;
      } else if (relation.stance === "STRATEGIC_PARTNERSHIP") {
        currentTension = 0;
      } else if (relation.stance === "NON_AGGRESSION_PACT") {
        currentTension = Math.min(15, currentTension);
      } else {
        if (!isReachable) {
          currentTension = Math.max(0, currentTension - 5);
        } else {
          const maxTensionCeiling =
            saturationScore >= 60 ? 65 : saturationScore >= 45 ? 55 : 45;
          const tensionIncrement = saturationScore >= 60 ? 4 : 2;

          if (nextAlignment <= 15 || saturationScore >= 50) {
            currentTension = Math.min(
              maxTensionCeiling,
              currentTension + tensionIncrement,
            );
          } else if (currentTension > 10) {
            currentTension = Math.max(10, currentTension - 2);
          }
        }
      }

      newRels[canonicalTarget] = {
        ...relation,
        targetNationId: canonicalTarget,
        alignment: Math.max(-100, Math.min(100, nextAlignment)),
        tension: currentTension,
      };
    }

    let nextWarFocus = nation.warFocusTargetId ?? null;
    if (nextWarFocus) {
      const canonicalFocus = CountryRegistry.resolveCanonicalId(nextWarFocus);
      const focusRel = newRels[canonicalFocus];
      const focusTarget = allNations[canonicalFocus];
      const isFocusAlive = focusTarget ? focusTarget.isAlive : true;

      if (!focusRel || focusRel.stance !== "WAR" || !isFocusAlive) {
        nextWarFocus = null;
      }
    }

    let postWarCooldown = nation.postWarCooldownTurns || 0;
    if (isAtWar || !nation.isAi) {
      postWarCooldown = 0;
    } else if (postWarCooldown > 0) {
      postWarCooldown = Math.max(0, postWarCooldown - 1);
    }

    return {
      updatedNation: {
        ...nation,
        relations: newRels,
        warFocusTargetId: nextWarFocus,
        postWarCooldownTurns: postWarCooldown,
      },
      isAtWar,
    };
  }
}
