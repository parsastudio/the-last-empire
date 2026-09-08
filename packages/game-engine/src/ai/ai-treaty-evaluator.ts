import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  CountryRegistry,
  DiplomacyLockManager,
  GeopoliticalReachResolver,
  SecurityGuaranteeValidator,
  NationRelationResolver,
  getNationGdp,
  StrategicPartnershipCalculatorUtility,
} from "@geopolitics/domain";
import {
  GeopoliticalVectorCalculator,
  GeopoliticalVector,
} from "@/engine/ai/geopolitical-vector-calculator";
import { UtilityDecisionEngine } from "@/engine/ai/utility-decision-engine";

export class AITreatyEvaluator {
  public static evaluateTreatyCancellation(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    lockedTargets?: Set<string>,
    vectorsByTarget?: Map<string, GeopoliticalVector>,
  ): GameAction | null {
    if (!nation.relations) return null;

    const isHawk =
      nation.doctrine === "MILITARIST_HAWK" ||
      nation.doctrine === "GLOBAL_HEGEMON";

    const isSourceAtWar = NationRelationResolver.isAtWar(nation, allNations);

    for (const [targetId, rel] of Object.entries(nation.relations)) {
      if (
        rel.stance !== "STRATEGIC_PARTNERSHIP" &&
        rel.stance !== "NON_AGGRESSION_PACT"
      ) {
        continue;
      }

      const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
      const targetNation = allNations[canonicalTarget] || allNations[targetId];
      if (!targetNation || !targetNation.isAlive) continue;

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

      const isDiscreditedAlly = targetNation.globalReputation <= -25;

      const hasStolenTerritory =
        vector.lostProvincesCount > 0 &&
        vector.powerRatio <= 0.6 &&
        !isSourceAtWar;

      const targetGdp = getNationGdp(targetNation, provincesMap);
      const isTargetInCrisis =
        targetNation.government.stability < 30 ||
        targetNation.nationalDebt >= targetGdp * 0.35 ||
        NationRelationResolver.countActiveWars(targetNation, allNations) >= 2;

      const isHawkTemptation =
        isHawk &&
        vector.isNeighbor &&
        vector.powerRatio <= 0.45 &&
        vector.alignment <= 15 &&
        !isSourceAtWar;

      const isNonHawkOpportunity =
        !isHawk &&
        vector.isNeighbor &&
        vector.powerRatio <= 0.3 &&
        vector.alignment <= 5 &&
        isTargetInCrisis &&
        nation.government.stability >= 40 &&
        !isSourceAtWar;

      if (
        isDiscreditedAlly ||
        hasStolenTerritory ||
        isHawkTemptation ||
        isNonHawkOpportunity
      ) {
        return ActionFactory.diplomaticProposal(
          nation.id,
          targetNation.id,
          "CANCEL_TREATY",
        );
      }
    }

    return null;
  }

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

    const cancelAction = this.evaluateTreatyCancellation(
      nation,
      allNations,
      provincesMap,
      lockedTargets,
      vectorsByTarget,
    );
    if (cancelAction) {
      return cancelAction;
    }

    const targets =
      reachableTargets ??
      GeopoliticalReachResolver.getReachableTargets(
        nation,
        allNations,
        provincesMap,
        rankMap,
      );

    const currentPactsCount = (nation.defenseGuarantorIds || []).length;

    if (currentPactsCount < SecurityGuaranteeValidator.MAX_DEFENSE_PACTS) {
      for (let i = 0; i < targets.length; i++) {
        const candidate = targets[i]!;

        if (!candidate.isAi) {
          continue;
        }

        if (
          DiplomacyLockManager.isLocked(lockedTargets, nation.id, candidate.id)
        ) {
          continue;
        }

        const validation = SecurityGuaranteeValidator.validate(
          nation,
          candidate,
          provincesMap,
          false,
        );

        if (validation.isValid) {
          return ActionFactory.diplomaticProposal(
            nation.id,
            candidate.id,
            "SECURITY_GUARANTEE",
          );
        }
      }
    }

    for (let i = 0; i < targets.length; i++) {
      const targetNation = targets[i]!;
      const canonicalTarget = CountryRegistry.resolveCanonicalId(
        targetNation.id,
      );
      const rel = NationRelationResolver.getRelation(
        nation.relations,
        canonicalTarget,
      );

      if (
        !rel ||
        rel.stance === "WAR" ||
        rel.stance === "STRATEGIC_PARTNERSHIP"
      ) {
        continue;
      }

      if (
        DiplomacyLockManager.isLocked(lockedTargets, nation.id, targetNation.id)
      ) {
        continue;
      }

      const targetGdp = getNationGdp(targetNation, provincesMap);

      if (rel.stance === "NON_AGGRESSION_PACT") {
        const entryFee =
          StrategicPartnershipCalculatorUtility.calculateSigningCost(targetGdp);

        if (nation.treasury >= entryFee) {
          const vector =
            vectorsByTarget?.get(canonicalTarget) ??
            GeopoliticalVectorCalculator.calculate(
              nation,
              targetNation,
              allNations,
              provincesMap,
            );

          const partnershipUtility =
            UtilityDecisionEngine.calculateStrategicPartnershipUtility(
              nation,
              vector,
              targetGdp,
            );

          if (partnershipUtility >= 20) {
            return ActionFactory.diplomaticProposal(
              nation.id,
              targetNation.id,
              "STRATEGIC_PARTNERSHIP",
            );
          }
        }
      }

      if (rel.stance === "NORMAL_DIPLOMACY") {
        const vector =
          vectorsByTarget?.get(canonicalTarget) ??
          GeopoliticalVectorCalculator.calculate(
            nation,
            targetNation,
            allNations,
            provincesMap,
          );

        const napUtility = UtilityDecisionEngine.calculateNapUtility(vector);

        if (napUtility >= 0) {
          return ActionFactory.diplomaticProposal(
            nation.id,
            targetNation.id,
            "NON_AGGRESSION_PACT",
          );
        }
      }
    }

    return null;
  }
}
