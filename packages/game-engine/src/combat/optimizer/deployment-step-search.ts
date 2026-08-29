import { BattleCalculationResult } from "@/engine/combat/battle-calculator";

export interface OptimizedForces {
  infantry: number;
  armor: number;
  airForce: number;
  drones: number;
}

export class DeploymentStepSearch {
  public static optimize(
    initialInf: number,
    initialArmor: number,
    initialAir: number,
    initialDrones: number,
    testBattle: (
      d: number,
      inf: number,
      arm: number,
      af: number,
    ) => BattleCalculationResult,
  ): OptimizedForces {
    let infantry = initialInf;
    let armor = initialArmor;
    let air = initialAir;
    let drones = initialDrones;

    const isSafeVictory = (d: number, inf: number, arm: number, af: number) => {
      const result = testBattle(d, inf, arm, af);
      const survivingInfantry =
        result.phase3Ground.attInfantry - result.phase3Ground.attInfantryLost;
      return (
        result.isAttackerVictory &&
        survivingInfantry >= 1 &&
        result.attackerCasualties.infantryLost < inf
      );
    };

    let step = Math.max(1, Math.floor(infantry * 0.1));
    while (step >= 1) {
      while (
        infantry - step >= 1 &&
        isSafeVictory(drones, infantry - step, armor, air)
      ) {
        infantry -= step;
      }
      step = Math.floor(step / 2);
    }

    let armStep = Math.max(1, Math.floor(armor * 0.1));
    while (armStep >= 1) {
      while (
        armor - armStep >= 0 &&
        isSafeVictory(drones, infantry, armor - armStep, air)
      ) {
        armor -= armStep;
      }
      armStep = Math.floor(armStep / 2);
    }

    let airStep = Math.max(1, Math.floor(air * 0.1));
    while (airStep >= 1) {
      while (
        air - airStep >= 0 &&
        isSafeVictory(drones, infantry, armor, air - airStep)
      ) {
        air -= airStep;
      }
      airStep = Math.floor(airStep / 2);
    }

    let droneStep = Math.max(1, Math.floor(drones * 0.1));
    while (droneStep >= 1) {
      while (
        drones - droneStep >= 0 &&
        isSafeVictory(drones - droneStep, infantry, armor, air)
      ) {
        drones -= droneStep;
      }
      droneStep = Math.floor(droneStep / 2);
    }

    return {
      infantry,
      armor,
      airForce: air,
      drones,
    };
  }
}
