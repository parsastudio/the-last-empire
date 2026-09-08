import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { SecurityFeeCalculatorUtility } from "@/domain/diplomacy/security-fee-calculator.utility";

export interface AuxiliaryForcesDistribution {
  auxAir: number;
  auxAD: number;
  auxArm: number;
  auxInf: number;
}

export class GuarantorBudgetCalculatorUtility {
  public static readonly NORMAL_BUDGET_RATIO = 0;
  public static readonly EMERGENCY_BUDGET_MULTIPLIER = 10;
  public static readonly GUARANTOR_MAX_LIMIT_RATIO = 0.3;

  public static calculateBudget(
    clientGdp: number,
    guarantorGdp: number,
    isEmergency = false,
  ): number {
    if (!isEmergency) {
      return 0;
    }

    const multiplier =
      SecurityFeeCalculatorUtility.EMERGENCY_FEE_RATIO *
      this.EMERGENCY_BUDGET_MULTIPLIER;

    const rawBudget = Math.floor(clientGdp * multiplier);
    const maxSuperpowerLimit = Math.floor(
      guarantorGdp * this.GUARANTOR_MAX_LIMIT_RATIO,
    );
    return Math.min(rawBudget, maxSuperpowerLimit);
  }

  public static calculateAuxiliaryUnits(
    effectiveDefenseBudget: number,
  ): AuxiliaryForcesDistribution {
    if (effectiveDefenseBudget <= 0) {
      return { auxAir: 0, auxAD: 0, auxArm: 0, auxInf: 0 };
    }

    const auxAir = Math.floor(
      (effectiveDefenseBudget * 0.4) / MILITARY_UNIT_STATS.AIR_FORCE.moneyCost,
    );
    const auxAD = Math.floor(
      (effectiveDefenseBudget * 0.25) /
        MILITARY_UNIT_STATS.AIR_DEFENSE.moneyCost,
    );
    const auxArm = Math.floor(
      (effectiveDefenseBudget * 0.25) /
        MILITARY_UNIT_STATS.AIR_DEFENSE.moneyCost,
    );
    const auxInf = Math.floor(
      (effectiveDefenseBudget * 0.1) / MILITARY_UNIT_STATS.INFANTRY.moneyCost,
    );

    return { auxAir, auxAD, auxArm, auxInf };
  }
}
