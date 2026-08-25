import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  CountryRegistry,
  DiplomacyLockManager,
  GeopoliticalReachResolver,
  NationGettersUtility,
  getNationGdp,
} from "@geopolitics/domain";
import {
  GeopoliticalVectorCalculator,
  GeopoliticalVector,
} from "@/engine/ai/geopolitical-vector-calculator";
import { UtilityDecisionEngine } from "@/engine/ai/utility-decision-engine";

export class AITreatyEvaluator {
  public static evaluate(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    lockedTargets?: Set<string>,
    rankMap?: Map<string, number>,
    reachableTargets?: Nation[],
    vectorsByTarget?: Map<string, GeopoliticalVector>,
  ): GameAction | null {
    if (!nation.relations) return null;

    const targets =
      reachableTargets ??
      GeopoliticalReachResolver.getReachableTargets(
        nation,
        allNations,
        provincesMap,
        rankMap,
      );

    for (let i = 0; i < targets.length; i++) {
      const targetNation = targets[i]!;
      const canonicalTarget = CountryRegistry.resolveCanonicalId(
        targetNation.id,
      );
      const rel =
        nation.relations[canonicalTarget] || nation.relations[targetNation.id];

      if (!rel || rel.stance === "WAR" || rel.stance === "ALLIANCE") continue;

      if (
        DiplomacyLockManager.isLocked(lockedTargets, nation.id, targetNation.id)
      ) {
        continue;
      }

      const vector =
        vectorsByTarget?.get(canonicalTarget) ??
        GeopoliticalVectorCalculator.calculate(
          nation,
          targetNation,
          allNations,
          provincesMap,
        );

      const allianceUtility = UtilityDecisionEngine.calculateAllianceUtility(
        nation,
        targetNation,
        vector,
      );

      if (allianceUtility >= 30) {
        return ActionFactory.diplomaticProposal(
          nation.id,
          targetNation.id,
          "FULL_ALLIANCE",
        );
      }

      if (rel.stance === "NORMAL_DIPLOMACY") {
        const napUtility = UtilityDecisionEngine.calculateNapUtility(
          nation,
          targetNation,
          vector,
        );

        if (napUtility >= 20) {
          return ActionFactory.diplomaticProposal(
            nation.id,
            targetNation.id,
            "NON_AGGRESSION_PACT",
          );
        }
      }
    }

    return this.evaluateStalemateBreaker(
      nation,
      allNations,
      provincesMap,
      lockedTargets,
      rankMap,
      targets,
      vectorsByTarget,
    );
  }

  private static evaluateStalemateBreaker(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    lockedTargets?: Set<string>,
    rankMap?: Map<string, number>,
    targets: Nation[] = [],
    vectorsByTarget?: Map<string, GeopoliticalVector>,
  ): GameAction | null {
    if (nation.warFocusTargetId) {
      return null;
    }

    for (const rel of Object.values(nation.relations)) {
      if (rel.stance === "WAR") {
        const canonical = CountryRegistry.resolveCanonicalId(
          rel.targetNationId,
        );
        const enemy = allNations[canonical] || allNations[rel.targetNationId];
        if (enemy && enemy.isAlive) {
          return null;
        }
      }
    }

    const aliveTargets = targets.filter((t) => t.isAlive && t.id !== nation.id);
    if (aliveTargets.length === 0) {
      return null;
    }

    for (let i = 0; i < aliveTargets.length; i++) {
      const target = aliveTargets[i]!;
      const canonical = CountryRegistry.resolveCanonicalId(target.id);
      const rel = nation.relations[canonical] || nation.relations[target.id];
      if (!rel || rel.stance === "NORMAL_DIPLOMACY") {
        return null;
      }
    }

    const napCandidates: { target: Nation; vector: GeopoliticalVector }[] = [];
    const allianceCandidates: {
      target: Nation;
      vector: GeopoliticalVector;
      rank: number;
      gdp: number;
    }[] = [];

    const effectiveRankMap =
      rankMap ??
      NationGettersUtility.calculateRankMap(allNations, provincesMap);

    for (let i = 0; i < aliveTargets.length; i++) {
      const target = aliveTargets[i]!;
      const canonical = CountryRegistry.resolveCanonicalId(target.id);

      if (DiplomacyLockManager.isLocked(lockedTargets, nation.id, target.id)) {
        continue;
      }

      const rel = nation.relations[canonical] || nation.relations[target.id];
      if (!rel) continue;

      const vector =
        vectorsByTarget?.get(canonical) ??
        GeopoliticalVectorCalculator.calculate(
          nation,
          target,
          allNations,
          provincesMap,
        );

      if (rel.stance === "NON_AGGRESSION_PACT") {
        napCandidates.push({ target, vector });
      } else if (rel.stance === "ALLIANCE") {
        const rank = effectiveRankMap.get(canonical) ?? 99;
        const gdp = getNationGdp(target, provincesMap);
        allianceCandidates.push({ target, vector, rank, gdp });
      }
    }

    if (napCandidates.length > 0) {
      napCandidates.sort((a, b) => {
        if (a.vector.lostProvincesCount !== b.vector.lostProvincesCount) {
          return b.vector.lostProvincesCount - a.vector.lostProvincesCount;
        }
        if (a.vector.alignment !== b.vector.alignment) {
          return a.vector.alignment - b.vector.alignment;
        }
        return b.vector.tension - a.vector.tension;
      });

      const chosen = napCandidates[0]!.target;
      return ActionFactory.diplomaticProposal(
        nation.id,
        chosen.id,
        "CANCEL_TREATY",
      );
    }

    if (allianceCandidates.length > 0) {
      allianceCandidates.sort((a, b) => {
        if (a.rank !== b.rank) {
          return a.rank - b.rank;
        }
        if (b.gdp !== a.gdp) {
          return b.gdp - a.gdp;
        }
        return a.vector.alignment - b.vector.alignment;
      });

      const chosen = allianceCandidates[0]!.target;
      return ActionFactory.diplomaticProposal(
        nation.id,
        chosen.id,
        "CANCEL_TREATY",
      );
    }

    return null;
  }
}
