import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { NavalDeploymentClamper } from "@/engine/combat/optimizer/naval-deployment-clamper";

export interface OptimalDeploymentResult {
  drones: number;
  airForce: number;
  armor: number;
  infantry: number;
  winProbability: number;
}

export class AttackDeploymentOptimizer {
  public static calculateOptimalDeployment(
    attacker: Nation,
    defender: Nation,
    provincesMap?: Record<string, Province>,
    guarantorNation?: Nation | null,
    attackType: "LAND" | "NAVAL" = "LAND",
    navalFleetCount = 0,
    targetProvinceId?: number,
  ): OptimalDeploymentResult {
    const maxInf = attacker.military.infantry || 0;
    const maxArm = attacker.military.armor || 0;
    const maxAir = attacker.military.airForce || 0;
    const maxDrone = attacker.military.droneMissile || 0;

    if (maxInf <= 0) {
      return {
        drones: 0,
        airForce: 0,
        armor: 0,
        infantry: 0,
        winProbability: 0,
      };
    }

    const optimalDrones = Math.min(
      maxDrone,
      Math.ceil((defender.military.airDefense || 0) * 2.2),
    );
    const optimalAir = Math.min(
      maxAir,
      Math.ceil((defender.military.airForce || 0) * 1.3),
    );

    let optimalInf = Math.max(1, Math.min(maxInf, Math.ceil(maxInf * 0.75)));
    let optimalArm = Math.min(maxArm, Math.ceil(maxArm * 0.75));

    if (attackType === "NAVAL") {
      const clamped = NavalDeploymentClamper.clamp(
        optimalInf,
        optimalArm,
        "NAVAL",
        navalFleetCount,
      );
      optimalInf = clamped.inf;
      optimalArm = clamped.arm;
    }

    const calcResult = BattleCalculator.calculateBattle(
      attacker,
      defender,
      optimalDrones,
      optimalInf,
      optimalArm,
      optimalAir,
      provincesMap,
      guarantorNation,
      targetProvinceId,
    );

    const winProbability = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (calcResult.valuationRatio / (calcResult.valuationRatio + 1)) * 100,
        ),
      ),
    );

    return {
      drones: optimalDrones,
      airForce: optimalAir,
      armor: optimalArm,
      infantry: optimalInf,
      winProbability,
    };
  }
}
