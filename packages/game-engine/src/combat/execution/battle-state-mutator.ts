import { Nation, TurnLogBuilder } from "@geopolitics/domain";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { ProvinceConquestResult } from "@/engine/combat/conquest/province-conquest-handler";
import { BetrayalEvaluation } from "@/engine/diplomacy/diplomacy-engine";
import { DiplomaticStance } from "@geopolitics/domain";
import { BattleAttackerStateApplier } from "@/engine/combat/state-appliers/battle-attacker-state-applier";
import { BattleDefenderStateApplier } from "@/engine/combat/state-appliers/battle-defender-state-applier";
import { ExtraCapturedMilitaryUnits } from "@/engine/combat/loot/battle-loot-manager";
import { TurnLogEntry } from "@/domain/game/game-state.schema";

export interface BattleStateMutationResult {
  updatedNations: Record<string, Nation>;
  guarantorLogs: TurnLogEntry[];
  updatedAttacker: Nation;
  updatedDefender: Nation;
}

export class BattleStateMutator {
  public static mutate(
    currentNations: Record<string, Nation>,
    attacker: Nation,
    defender: Nation,
    guarantorNation: Nation | null,
    calcResult: BattleCalculationResult,
    conquest: ProvinceConquestResult,
    currentStance: DiplomaticStance,
    betrayalResult: BetrayalEvaluation,
    isDefenderAlive: boolean,
    currentTurn: number,
    extraCapturedUnits?: ExtraCapturedMilitaryUnits,
    extraTreasuryLooted = 0,
  ): BattleStateMutationResult {
    const updatedAttacker = BattleAttackerStateApplier.apply({
      attacker,
      defenderId: defender.id,
      defenderTechLevel: defender.military.techLevel,
      calcResult,
      currentStance,
      betrayalResult,
      isDefenderEliminated: !isDefenderAlive,
      extraCapturedUnits,
      extraTreasuryLooted,
    });

    const updatedDefender = BattleDefenderStateApplier.apply({
      defender,
      attackerId: attacker.id,
      calcResult,
      conquest,
      isDefenderAlive,
    });

    const baseNations: Record<string, Nation> = {
      ...currentNations,
      [attacker.id]: updatedAttacker,
      [defender.id]: updatedDefender,
    };

    const guarantorLogs: TurnLogEntry[] = [];
    if (guarantorNation && calcResult.auxiliaryGuarantor) {
      const damage = calcResult.auxiliaryGuarantor.damageCostIncurred || 0;
      if (damage > 0) {
        const curG = baseNations[guarantorNation.id] || guarantorNation;
        let nextTreasury = curG.treasury - damage;
        let nextDebt = curG.nationalDebt;
        if (nextTreasury < 0) {
          nextDebt += Math.abs(nextTreasury);
          nextTreasury = 0;
        }

        baseNations[guarantorNation.id] = {
          ...curG,
          treasury: nextTreasury,
          nationalDebt: nextDebt,
        };

        guarantorLogs.push(
          TurnLogBuilder.createNationalLog(
            currentTurn,
            guarantorNation.id,
            "MILITARY",
            "WARNING",
            "GUARANTOR_CASUALTY_COST_INCURRED",
            { cost: damage },
            defender.id,
          ),
        );
      }
    }

    return {
      updatedNations: baseNations,
      guarantorLogs,
      updatedAttacker,
      updatedDefender,
    };
  }
}
