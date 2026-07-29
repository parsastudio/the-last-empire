import { Nation } from "@/domain/nation/nation.schema";
import { LogisticsEvaluationResult } from "./campaign-logistics-evaluator";
import { DetailedCasualtyResult } from "../math/combat-casualty-calculator";

export class AttackTreasurySettler {
  public settlePostAttackStates(
    nations: Record<string, Nation>,
    attackerId: string,
    defenderId: string,
    evalResult: LogisticsEvaluationResult,
    casualtyDetails: DetailedCasualtyResult,
  ): Record<string, Nation> {
    const updatedNations = { ...nations };

    const attacker = updatedNations[attackerId];
    if (attacker) {
      const remainingTreasury = attacker.treasury - evalResult.totalCost;
      updatedNations[attackerId] = {
        ...attacker,
        treasury: Math.max(0, remainingTreasury),
        military: {
          ...attacker.military,
          infantry: Math.max(
            0,
            attacker.military.infantry -
              casualtyDetails.attackerLostStack.infantry,
          ),
          airForce: Math.max(
            0,
            attacker.military.airForce -
              casualtyDetails.attackerLostStack.airForce,
          ),
          droneMissile: Math.max(
            0,
            attacker.military.droneMissile -
              casualtyDetails.attackerLostStack.droneMissile,
          ),
        },
      };
    }

    const defender = updatedNations[defenderId];
    if (defender) {
      updatedNations[defenderId] = {
        ...defender,
        military: {
          ...defender.military,
          infantry: Math.max(
            0,
            defender.military.infantry -
              casualtyDetails.defenderLostStack.infantry,
          ),
          airForce: Math.max(
            0,
            defender.military.airForce -
              casualtyDetails.defenderLostStack.airForce,
          ),
          droneMissile: Math.max(
            0,
            defender.military.droneMissile -
              casualtyDetails.defenderLostStack.droneMissile,
          ),
        },
      };
    }

    return updatedNations;
  }
}
