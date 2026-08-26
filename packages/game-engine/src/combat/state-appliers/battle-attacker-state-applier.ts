import { Nation, DiplomaticStance, CountryRegistry } from "@geopolitics/domain";
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
  isCounterAttack?: boolean;
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
      isCounterAttack = false,
    } = input;

    const cleanDefenderId = CountryRegistry.resolveCanonicalId(defenderId);

    const updatedMilitary = BattleLootManager.applyAttackerForcesAndSpoils(
      attacker.military,
      defenderTechLevel,
      calcResult,
      extraCapturedUnits,
    );

    const isTotalAnnexation =
      calcResult.isFullCapitulation || Boolean(isDefenderEliminated);

    let baseWarRepPenalty = currentStance !== "WAR" ? 15 : 0;
    if (isTotalAnnexation) {
      const annexationPenalty = isCounterAttack ? 4 : 8;
      baseWarRepPenalty += annexationPenalty;
    }
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

    const nextWarFocus = isTotalAnnexation ? null : cleanDefenderId;

    const hasOtherWars = Object.entries(updatedRelations).some(
      ([key, r]) => key !== cleanDefenderId && r.stance === "WAR",
    );

    const postWarCooldown =
      attacker.isAi && isTotalAnnexation && !hasOtherWars
        ? 5
        : attacker.isAi
          ? attacker.postWarCooldownTurns || 0
          : 0;

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
    };
  }
}
