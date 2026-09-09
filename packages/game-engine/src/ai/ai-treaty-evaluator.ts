import {
  GameAction,
  ActionFactory,
  Nation,
  CountryRegistry,
  SecurityGuaranteeValidator,
  NationRelationResolver,
  StrategicPartnershipCalculatorUtility,
} from "@geopolitics/domain";
import { UtilityDecisionEngine } from "@/engine/ai/utility-decision-engine";
import { TurnContext } from "@/engine/pipeline/turn-context";

export class AITreatyEvaluator {
  public static evaluateTreatyCancellation(
    nation: Nation,
    context: TurnContext,
  ): GameAction | null {
    if (
      nation.isAi &&
      nation.defenseGuarantorIds &&
      nation.defenseGuarantorIds.length > 0
    ) {
      const aliveNationsCount = context.aliveNations.length;
      const top20Threshold = Math.ceil(aliveNationsCount * 0.2);
      const nationRank = context.getRank(nation.id);

      if (nationRank <= top20Threshold) {
        for (let i = 0; i < nation.defenseGuarantorIds.length; i++) {
          const targetId = nation.defenseGuarantorIds[i]!;
          if (context.isDiplomacyLocked(targetId, nation.id)) {
            continue;
          }
          return ActionFactory.diplomaticProposal(
            nation.id,
            targetId,
            "CANCEL_SECURITY_GUARANTEE",
          );
        }
      }
    }

    if (!nation.relations) return null;

    const isHawk =
      nation.doctrine === "MILITARIST_HAWK" ||
      nation.doctrine === "GLOBAL_HEGEMON";

    const isSourceAtWar = context.isAtWar(nation);

    for (const [targetId, rel] of Object.entries(nation.relations)) {
      if (
        rel.stance !== "STRATEGIC_PARTNERSHIP" &&
        rel.stance !== "NON_AGGRESSION_PACT"
      ) {
        continue;
      }

      const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
      const targetNation = context.getNation(canonicalTarget);
      if (!targetNation || !targetNation.isAlive) continue;

      if (context.isDiplomacyLocked(targetNation.id, nation.id)) {
        continue;
      }

      const vector = context.getVector(nation, targetNation);
      if (!vector) continue;

      const isDiscreditedAlly = targetNation.globalReputation <= -25;

      const hasStolenTerritory =
        vector.lostProvincesCount > 0 &&
        vector.powerRatio <= 0.6 &&
        !isSourceAtWar;

      const targetGdp = context.getNationGdp(targetNation.id);
      const isTargetInCrisis =
        targetNation.government.stability < 30 ||
        targetNation.nationalDebt >= targetGdp * 0.35 ||
        NationRelationResolver.countActiveWars(
          targetNation,
          context.state.nations,
        ) >= 2;

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

      const isSaturationExpansionNeed =
        vector.isNeighbor &&
        vector.saturationScore >= 60 &&
        vector.powerRatio <= 0.55 &&
        !isSourceAtWar;

      if (
        isDiscreditedAlly ||
        hasStolenTerritory ||
        isHawkTemptation ||
        isNonHawkOpportunity ||
        isSaturationExpansionNeed
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
    context: TurnContext,
  ): GameAction | null {
    if (!nation.relations) return null;

    const cancelAction = this.evaluateTreatyCancellation(nation, context);
    if (cancelAction) {
      return cancelAction;
    }

    const targets = context.getReachableTargets(nation);
    const aliveNationsCount = context.aliveNations.length;
    const top20Threshold = Math.ceil(aliveNationsCount * 0.2);
    const nationRank = context.getRank(nation.id);
    const isTop20PercentAi = nation.isAi && nationRank <= top20Threshold;

    const currentPactsCount = (nation.defenseGuarantorIds || []).length;

    if (
      !isTop20PercentAi &&
      currentPactsCount < SecurityGuaranteeValidator.MAX_DEFENSE_PACTS
    ) {
      for (let i = 0; i < targets.length; i++) {
        const candidate = targets[i]!;

        if (!candidate.isAi) {
          continue;
        }

        if (context.isDiplomacyLocked(candidate.id, nation.id)) {
          continue;
        }

        const validation = SecurityGuaranteeValidator.validate(
          nation,
          candidate,
          context.state.provinces,
          false,
          context.state.nations,
          context.rankMap,
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

      if (context.isDiplomacyLocked(targetNation.id, nation.id)) {
        continue;
      }

      const targetGdp = context.getNationGdp(targetNation.id);

      if (rel.stance === "NON_AGGRESSION_PACT") {
        const entryFee =
          StrategicPartnershipCalculatorUtility.calculateSigningCost(targetGdp);

        if (nation.treasury >= entryFee) {
          const vector = context.getVector(nation, targetNation);
          if (vector) {
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
      }

      if (rel.stance === "NORMAL_DIPLOMACY") {
        const vector = context.getVector(nation, targetNation);
        if (vector) {
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
    }

    return null;
  }
}
