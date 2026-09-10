import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { BinarySearchOptimizer } from "@/engine/combat/optimizer/helpers/binary-search-optimizer";

export class DeploymentStepSearch {
  public static findMinimalGroundForces(
    drones: number,
    airForce: number,
    maxArmor: number,
    maxInfantry: number,
    testBattle: (
      d: number,
      inf: number,
      arm: number,
      af: number,
    ) => BattleCalculationResult,
  ): { infantry: number; armor: number; isVictory: boolean } {
    let bestArmor = maxArmor;
    let bestInfantry = maxInfantry;
    let foundVictory = false;

    for (
      let arm = 0;
      arm <= maxArmor;
      arm = arm === 0 ? 1 : arm < 10 ? arm + 1 : arm + Math.ceil(arm * 0.2)
    ) {
      const inf = this.findMinimalInfantryForArmor(
        drones,
        airForce,
        arm,
        maxInfantry,
        testBattle,
      );

      if (inf !== null) {
        bestArmor = arm;
        bestInfantry = inf;
        foundVictory = true;
        break;
      }
    }

    if (!foundVictory) {
      const maxTest = testBattle(drones, maxInfantry, maxArmor, airForce);
      if (maxTest.isAttackerVictory) {
        bestArmor = maxArmor;
        bestInfantry = maxInfantry;
        foundVictory = true;
      }
    }

    return {
      armor: bestArmor,
      infantry: bestInfantry,
      isVictory: foundVictory,
    };
  }

  private static findMinimalInfantryForArmor(
    drones: number,
    airForce: number,
    armor: number,
    maxInfantry: number,
    testBattle: (
      d: number,
      inf: number,
      arm: number,
      af: number,
    ) => BattleCalculationResult,
  ): number | null {
    const maxTest = testBattle(drones, maxInfantry, armor, airForce);
    if (!maxTest.isAttackerVictory) {
      return null;
    }

    return BinarySearchOptimizer.findMinimalPassing(1, maxInfantry, (inf) => {
      const battleRes = testBattle(drones, inf, armor, airForce);
      return battleRes.isAttackerVictory;
    });
  }
}
