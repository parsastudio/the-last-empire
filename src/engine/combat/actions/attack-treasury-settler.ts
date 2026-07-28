import { Nation } from "@/domain/nation/nation.schema";
import { LogisticsEvaluationResult } from "./campaign-logistics-evaluator";

export class AttackTreasurySettler {
  public settlePostAttackStates(
    nations: Record<string, Nation>,
    attackerId: string,
    defenderId: string,
    evalResult: LogisticsEvaluationResult,
    attackerLost: number,
    defenderLost: number,
  ): Record<string, Nation> {
    const updatedNations = { ...nations };

    const attacker = updatedNations[attackerId];
    if (attacker) {
      const remainingTreasury = attacker.treasury - evalResult.totalCost;
      updatedNations[attackerId] = {
        ...attacker,
        treasury: Math.max(0, remainingTreasury),
        nationalDebt: attacker.nationalDebt + evalResult.emergencyDebtRequired,
        military: {
          ...attacker.military,
          infantry: Math.max(0, attacker.military.infantry - attackerLost),
        },
      };
    }

    const defender = updatedNations[defenderId];
    if (defender) {
      updatedNations[defenderId] = {
        ...defender,
        military: {
          ...defender.military,
          infantry: Math.max(0, defender.military.infantry - defenderLost),
        },
      };
    }

    return updatedNations;
  }
}
