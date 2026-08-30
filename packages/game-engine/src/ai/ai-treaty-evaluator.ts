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

    if (!nation.securityGuarantorId) {
      for (let i = 0; i < targets.length; i++) {
        const candidate = targets[i]!;
        if (
          DiplomacyLockManager.isLocked(lockedTargets, nation.id, candidate.id)
        ) {
          continue;
        }

        const validation = SecurityGuaranteeValidator.validate(
          nation,
          candidate,
          provincesMap,
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
        );

      if (partnershipUtility >= 30) {
        return ActionFactory.diplomaticProposal(
          nation.id,
          targetNation.id,
          "STRATEGIC_PARTNERSHIP",
        );
      }

      if (rel.stance === "NORMAL_DIPLOMACY") {
        const napUtility = UtilityDecisionEngine.calculateNapUtility(vector);

        if (napUtility >= 5) {
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
