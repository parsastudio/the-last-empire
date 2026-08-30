import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";

export interface AuxiliaryForcesDistribution {
  auxAir: number;
  auxAD: number;
  auxArm: number;
  auxInf: number;
}

export class GuarantorBudgetCalculatorUtility {
  public static readonly NORMAL_BUDGET_RATIO = 0.3;
  public static readonly EMERGENCY_BUDGET_RATIO = 3.0;
  public static readonly GUARANTOR_MAX_LIMIT_RATIO = 0.3;

  public static calculateBudget(
    clientGdp: number,
    guarantorGdp: number,
    isEmergency = false,
  ): number {
    const multiplier = isEmergency
      ? this.EMERGENCY_BUDGET_RATIO
      : this.NORMAL_BUDGET_RATIO;
    const rawBudget = Math.floor(clientGdp * multiplier);
    const maxSuperpowerLimit = Math.floor(
      guarantorGdp * this.GUARANTOR_MAX_LIMIT_RATIO,
    );
    return Math.min(rawBudget, maxSuperpowerLimit);
  }

  public static calculateAuxiliaryUnits(
    effectiveDefenseBudget: number,
  ): AuxiliaryForcesDistribution {
    const auxAir = Math.floor(
      (effectiveDefenseBudget * 0.4) / MILITARY_UNIT_STATS.AIR_FORCE.moneyCost,
    );
    const auxAD = Math.floor(
      (effectiveDefenseBudget * 0.25) /
        MILITARY_UNIT_STATS.AIR_DEFENSE.moneyCost,
    );
    const auxArm = Math.floor(
      (effectiveDefenseBudget * 0.25) / MILITARY_UNIT_STATS.ARMOR.moneyCost,
    );
    const auxInf = Math.floor(
      (effectiveDefenseBudget * 0.1) / MILITARY_UNIT_STATS.INFANTRY.moneyCost,
    );

    return { auxAir, auxAD, auxArm, auxInf };
  }
}
