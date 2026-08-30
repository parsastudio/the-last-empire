import { Nation } from "@/domain/nation/nation.schema";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { BattleSpoilsDetails } from "@/domain/reports/combat-report.schema";
import { BattleAttackerStateApplier } from "@/engine/combat/state-appliers/battle-attacker-state-applier";
import { BattleDefenderStateApplier } from "@/engine/combat/state-appliers/battle-defender-state-applier";

export class BattleStateMutator {
  public static mutate(
    nations: Record<string, Nation>,
    attacker: Nation,
    defender: Nation,
    calcResult: BattleCalculationResult,
    spoilsData?: BattleSpoilsDetails,
    isDefenderAnnexed = false,
  ): Record<string, Nation> {
    const updatedNations: Record<string, Nation> = { ...nations };

    const updatedAttacker = BattleAttackerStateApplier.apply({
      attacker,
      defenderId: defender.id,
      calcResult,
      spoilsData,
      isDefenderAnnexed,
    });
    updatedNations[attacker.id] = updatedAttacker;

    if (!isDefenderAnnexed) {
      const updatedDefender = BattleDefenderStateApplier.apply({
        defender,
        attackerId: attacker.id,
        calcResult,
        spoilsData,
      });
      updatedNations[defender.id] = updatedDefender;
    }

    return updatedNations;
  }

  public static mutateBattleState(
    nations: Record<string, Nation>,
    attacker: Nation,
    defender: Nation,
    calcResult: BattleCalculationResult,
    spoilsData?: BattleSpoilsDetails,
    isDefenderAnnexed = false,
  ): Record<string, Nation> {
    return this.mutate(
      nations,
      attacker,
      defender,
      calcResult,
      spoilsData,
      isDefenderAnnexed,
    );
  }
}
