import {
  Nation,
  Province,
  MILITARY_UNIT_STATS,
  getNationGdp,
} from "@geopolitics/domain";
import { AuxiliaryGuarantorDefense } from "@/domain/reports/combat-report.schema";

export interface GuarantorForcesResult {
  auxAir: number;
  auxArm: number;
  auxAD: number;
  auxInf: number;
  effectiveDefenseBudget: number;
  auxiliaryGuarantor?: AuxiliaryGuarantorDefense;
}

export class GuarantorInterventionCalculator {
  public static calculateIntervention(
    attacker: Nation,
    defender: Nation,
    provincesMap?: Record<string, Province>,
    guarantorNation?: Nation | null,
  ): GuarantorForcesResult {
    if (
      !guarantorNation ||
      !guarantorNation.isAlive ||
      guarantorNation.id === attacker.id
    ) {
      return {
        auxAir: 0,
        auxArm: 0,
        auxAD: 0,
        auxInf: 0,
        effectiveDefenseBudget: 0,
      };
    }

    const defGdp = getNationGdp(defender, provincesMap);
    const isEmergency = Boolean(defender.isEmergencyProtectorate);
    const budgetMultiplier = isEmergency ? 3.0 : 0.3;
    const rawBudget = Math.floor(defGdp * budgetMultiplier);
    const guarantorGdp = getNationGdp(guarantorNation, provincesMap);
    const maxSuperpowerLimit = Math.floor(guarantorGdp * 0.3);
    const effectiveDefenseBudget = Math.min(rawBudget, maxSuperpowerLimit);

    const gTech = guarantorNation.military.techLevel;

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

    const auxiliaryGuarantor: AuxiliaryGuarantorDefense = {
      guarantorId: guarantorNation.id,
      guarantorName: guarantorNation.name,
      guarantorFlagCode: guarantorNation.flagCode,
      techLevel: gTech,
      isEmergencyProtectorate: isEmergency,
      deployedInfantry: auxInf,
      deployedArmor: auxArm,
      deployedAirDefense: auxAD,
      deployedAirForce: auxAir,
      initialBudgetValuation: effectiveDefenseBudget,
      damageCostIncurred: 0,
    };

    return {
      auxAir,
      auxArm,
      auxAD,
      auxInf,
      effectiveDefenseBudget,
      auxiliaryGuarantor,
    };
  }

  public static calculateGuarantorDamageCost(
    auxiliaryGuarantor: AuxiliaryGuarantorDefense,
    effectiveDefenseBudget: number,
    auxAir: number,
    auxAD: number,
    auxArm: number,
    auxInf: number,
    defAirForce: number,
    defAirDefense: number,
    defArmor: number,
    defInfantry: number,
    netDefAirLost: number,
    netDefAirDefenseLost: number,
    netDefArmorLost: number,
    netDefInfantryLost: number,
  ): number {
    const auxAirLoss = Math.min(
      auxAir,
      Math.floor(netDefAirLost * (auxAir / Math.max(1, defAirForce))),
    );
    const auxADLoss = Math.min(
      auxAD,
      Math.floor(netDefAirDefenseLost * (auxAD / Math.max(1, defAirDefense))),
    );
    const auxArmLoss = Math.min(
      auxArm,
      Math.floor(netDefArmorLost * (auxArm / Math.max(1, defArmor))),
    );
    const auxInfLoss = Math.min(
      auxInf,
      Math.floor(netDefInfantryLost * (auxInf / Math.max(1, defInfantry))),
    );

    const totalLossMoney =
      auxAirLoss * MILITARY_UNIT_STATS.AIR_FORCE.moneyCost +
      auxADLoss * MILITARY_UNIT_STATS.AIR_DEFENSE.moneyCost +
      auxArmLoss * MILITARY_UNIT_STATS.ARMOR.moneyCost +
      auxInfLoss * MILITARY_UNIT_STATS.INFANTRY.moneyCost;

    const damageCost = Math.min(effectiveDefenseBudget, totalLossMoney);
    auxiliaryGuarantor.damageCostIncurred = damageCost;
    return damageCost;
  }
}
