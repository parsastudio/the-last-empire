import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { NavalDeploymentClamper } from "@/engine/combat/optimizer/naval-deployment-clamper";

export interface OptimalDeploymentResult {
  airForce: number;
  armor: number;
  infantry: number;
}

export class AttackDeploymentOptimizer {
  public static calculateOptimalDeployment(
    attacker: Nation,
    defender: Nation,
    provincesMap?: Record<string, Province>,
    guarantorNation?: Nation | null,
    attackType: "LAND" | "NAVAL" = "LAND",
    navalFleetCount = 0,
  ): OptimalDeploymentResult {
    const maxInf = Math.max(1, attacker.military.infantry || 1);
    const maxArm = attacker.military.armor || 0;
    const maxAir = attacker.military.airForce || 0;

    let bestScore = -1;
    let bestDeployment: OptimalDeploymentResult = {
      airForce: maxAir,
      armor: maxArm,
      infantry: maxInf,
    };

    const steps = [0.25, 0.5, 0.75, 1.0];

    for (const airStep of steps) {
      for (const armStep of steps) {
        for (const infStep of steps) {
          let inf = Math.max(1, Math.round(maxInf * infStep));
          let arm = Math.round(maxArm * armStep);
          const air = Math.round(maxAir * airStep);

          if (attackType === "NAVAL") {
            const clamped = NavalDeploymentClamper.clamp(
              inf,
              arm,
              "NAVAL",
              navalFleetCount,
            );
            inf = clamped.inf;
            arm = clamped.arm;
          }

          const res = BattleCalculator.calculateBattle(
            attacker,
            defender,
            inf,
            arm,
            air,
            provincesMap,
            guarantorNation,
          );

          const winScore = res.isAttackerVictory ? 100 : 0;
          const costScore = -(res.deploymentMoneyCost / 1_000_000_000);
          const ratioScore = res.valuationRatio * 10;
          const totalScore = winScore + ratioScore + costScore;

          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestDeployment = {
              airForce: air,
              armor: arm,
              infantry: inf,
            };
          }
        }
      }
    }

    return bestDeployment;
  }
}
