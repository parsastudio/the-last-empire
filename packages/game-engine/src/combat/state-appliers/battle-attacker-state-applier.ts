import {
  Nation,
  DiplomaticStance,
  CountryRegistry,
  DIPLOMACY_CONFIG,
} from "@geopolitics/domain";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { BetrayalEvaluation } from "@/engine/diplomacy/diplomacy-engine";
import {
  BattleLootManager,
  ExtraCapturedMilitaryUnits,
} from "@/engine/combat/loot/battle-loot-manager";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";

export interface AttackerStateApplierInput {
  attacker: Nation;
  defenderId: string;
  defenderTechLevel: number;
  calcResult: BattleCalculationResult;
  currentStance: DiplomaticStance;
  betrayalResult: BetrayalEvaluation;
  isDefenderEliminated?: boolean;
  extraCapturedUnits?: ExtraCapturedMilitaryUnits;
  extraTreasuryLooted?: number;
}

export class BattleAttackerStateApplier {
  public static apply(input: AttackerStateApplierInput): Nation {
    const {
      attacker,
      defenderId,
      defenderTechLevel,
      calcResult,
      currentStance,
      betrayalResult,
      isDefenderEliminated,
      extraCapturedUnits,
      extraTreasuryLooted,
    } = input;

    const cleanDefenderId = CountryRegistry.resolveCanonicalId(defenderId);

    const updatedMilitary = BattleLootManager.applyAttackerForcesAndSpoils(
      attacker.military,
      defenderTechLevel,
      calcResult,
      extraCapturedUnits,
    );

    const baseWarRepPenalty = currentStance !== "WAR" ? 15 : 0;
    const totalRepPenalty =
      baseWarRepPenalty +
      (betrayalResult.hasBetrayed ? betrayalResult.reputationPenalty : 0);

    const updatedRelations = { ...attacker.relations };
    updatedRelations[cleanDefenderId] = {
      targetNationId: cleanDefenderId,
      stance: "WAR",
      alignment: -100,
      tension: 100,
    };

    const combatStabilityDelta =
      StabilityCalculator.calculateAttackerBattleStabilityDelta(
        attacker.government.type,
        calcResult.isAttackerVictory,
      );

    const nextStability = StabilityCalculator.clampStability(
      attacker.government.stability + combatStabilityDelta,
    );

    const actualDeploymentCost = attacker.isAi
      ? Math.min(
          calcResult.deploymentMoneyCost,
          Math.max(0, Math.floor(attacker.treasury * 0.6)),
        )
      : calcResult.deploymentMoneyCost;

    const totalLoot = calcResult.treasuryLooted + (extraTreasuryLooted || 0);

    const updatedTreasury = Math.max(
      0,
      attacker.treasury - actualDeploymentCost + totalLoot,
    );

    const isTotalAnnexation =
      Boolean(calcResult.isFullCapitulation) || Boolean(isDefenderEliminated);

    const nextWarFocus = isTotalAnnexation ? null : cleanDefenderId;

    const hasOtherWars = Object.entries(updatedRelations).some(
      ([key, r]) => key !== cleanDefenderId && r.stance === "WAR",
    );

    const postWarCooldown =
      attacker.isAi && isTotalAnnexation && !hasOtherWars
        ? DIPLOMACY_CONFIG.POST_WAR_COOLDOWN_TURNS
        : attacker.isAi
          ? attacker.postWarCooldownTurns || 0
          : 0;

    const currentAttackedTargets = attacker.attackedTargetIdsThisTurn || [];
    const updatedAttackedTargets = Array.from(
      new Set([...currentAttackedTargets, cleanDefenderId, defenderId]),
    );

    return {
      ...attacker,
      government: {
        ...attacker.government,
        stability: nextStability,
      },
      globalReputation: Math.max(
        -100,
        attacker.globalReputation - totalRepPenalty,
      ),
      treasury: updatedTreasury,
      military: updatedMilitary,
      relations: updatedRelations,
      warFocusTargetId: nextWarFocus,
      postWarCooldownTurns: postWarCooldown,
      attackedTargetIdsThisTurn: updatedAttackedTargets,
    };
  }
}
