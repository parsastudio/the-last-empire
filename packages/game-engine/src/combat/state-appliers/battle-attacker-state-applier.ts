import { Nation, DiplomaticStance, CountryRegistry } from "@geopolitics/domain";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { ProvinceConquestResult } from "@/engine/combat/conquest/province-conquest-handler";
import { BetrayalEvaluation } from "@/engine/diplomacy/diplomacy-engine";
import { BattleLootManager } from "@/engine/combat/loot/battle-loot-manager";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";

export interface AttackerStateApplierInput {
  attacker: Nation;
  defenderId: string;
  canonicalDefenderId: string;
  defenderTechLevel: number;
  calcResult: BattleCalculationResult;
  conquest: ProvinceConquestResult;
  currentStance: DiplomaticStance;
  betrayalResult: BetrayalEvaluation;
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
    } = input;

    const cleanDefenderId = CountryRegistry.resolveCanonicalId(defenderId);

    const updatedMilitary = BattleLootManager.applyAttackerForcesAndSpoils(
      attacker.military,
      defenderTechLevel,
      calcResult,
    );

    let baseWarRepPenalty = currentStance !== "WAR" ? 15 : 0;
    if (calcResult.isFullCapitulation) {
      baseWarRepPenalty += 10;
    }
    const totalRepPenalty =
      baseWarRepPenalty +
      (betrayalResult.hasBetrayed ? betrayalResult.reputationPenalty : 0);

    const existingRel =
      attacker.relations[cleanDefenderId] || attacker.relations[defenderId];
    const currentGrudge = existingRel?.grudge ?? 0;

    const updatedRelations = { ...attacker.relations };
    updatedRelations[cleanDefenderId] = {
      targetNationId: cleanDefenderId,
      stance: "WAR",
      opinion: -100,
      grudge: currentGrudge,
      alignment: -100,
      tension: 100,
      lostProvincesCount: existingRel?.lostProvincesCount ?? 0,
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

    const updatedTreasury = Math.max(
      0,
      attacker.treasury - actualDeploymentCost + calcResult.treasuryLooted,
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
      warFocusTargetId: cleanDefenderId,
    };
  }
}
