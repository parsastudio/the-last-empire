import { Nation } from "@/domain/nation/nation.schema";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { BattleSpoilsDetails } from "@/domain/reports/combat-report.schema";
import { BattleAttackerStateApplier } from "@/engine/combat/state-appliers/battle-attacker-state-applier";
import { BattleDefenderStateApplier } from "@/engine/combat/state-appliers/battle-defender-state-applier";

export interface BattleStateMutationInput {
  attacker: Nation;
  defender: Nation;
  calcResult: BattleCalculationResult;
  spoilsData?: BattleSpoilsDetails;
  isDefenderAnnexed?: boolean;
  conqueredFactoriesCount?: number;
  originalLostFactoriesCount?: number;
  destroyedFactoriesCount?: number;
}

export class BattleStateMutator {
  public static mutate(
    nations: Record<string, Nation>,
    attacker: Nation,
    defender: Nation,
    calcResult: BattleCalculationResult,
    spoilsData?: BattleSpoilsDetails,
    isDefenderAnnexed = false,
    conqueredFactoriesCount = 0,
    originalLostFactoriesCount = 0,
    destroyedFactoriesCount = 0,
  ): Record<string, Nation> {
    const updatedNations: Record<string, Nation> = { ...nations };

    const updatedAttacker = BattleAttackerStateApplier.apply({
      attacker,
      defenderId: defender.id,
      calcResult,
      spoilsData,
      isDefenderAnnexed,
      conqueredFactoriesCount,
      defenderTechLevel: defender.equipmentTechLevel,
    });
    updatedNations[attacker.id] = updatedAttacker;

    if (!isDefenderAnnexed) {
      const updatedDefender = BattleDefenderStateApplier.apply({
        defender,
        attackerId: attacker.id,
        calcResult,
        spoilsData,
        lostFactoriesCount: originalLostFactoriesCount,
        destroyedFactoriesCount,
      });
      updatedNations[defender.id] = updatedDefender;
    }

    return updatedNations;
  }
}
