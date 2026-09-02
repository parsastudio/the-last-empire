import {
  Nation,
  Province,
  getNationGdp,
  GuarantorBudgetCalculatorUtility,
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
    const guarantorGdp = getNationGdp(guarantorNation, provincesMap);
    const isEmergency = Boolean(defender.isEmergencyProtectorate);

    const effectiveDefenseBudget =
      GuarantorBudgetCalculatorUtility.calculateBudget(
        defGdp,
        guarantorGdp,
        isEmergency,
      );

    const { auxAir, auxAD, auxArm, auxInf } =
      GuarantorBudgetCalculatorUtility.calculateAuxiliaryUnits(
        effectiveDefenseBudget,
      );

    const auxiliaryGuarantor: AuxiliaryGuarantorDefense = {
      guarantorId: guarantorNation.id,
      guarantorName: guarantorNation.name,
      guarantorFlagCode: guarantorNation.flagCode,
      techLevel: guarantorNation.military.techLevel,
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
}
