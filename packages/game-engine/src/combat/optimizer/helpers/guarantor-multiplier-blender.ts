import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CombatModifierResolver } from "@/engine/combat/combat-modifier-resolver";
import { GuarantorInterventionCalculator } from "@/engine/combat/calculator/guarantor-intervention-calculator";
import { MilitaryPowerCalculator } from "@geopolitics/domain";
import { AuxiliaryGuarantorDefense } from "@/domain/reports/combat-report.schema";

export interface BlendedDefenseForces {
  defAirDefense: number;
  defAirForce: number;
  defArmor: number;
  defInfantry: number;
  defMults: {
    infantry: number;
    armor: number;
    airDefense: number;
    airForce: number;
    droneMissile: number;
  };
  auxiliaryGuarantor?: AuxiliaryGuarantorDefense;
}

export class GuarantorMultiplierBlender {
  public static blend(
    attacker: Nation,
    defender: Nation,
    provincesMap?: Record<string, Province>,
    guarantorNation?: Nation | null,
  ): BlendedDefenseForces {
    const nativeDefMults =
      CombatModifierResolver.resolveAllUnitMultipliers(defender);

    const nativeDefAirDefense = defender.military.airDefense || 0;
    const nativeDefAirForce = defender.military.airForce || 0;
    const nativeDefArmor = defender.military.armor || 0;
    const nativeDefInfantry = defender.military.infantry || 0;

    const guarantorResult =
      GuarantorInterventionCalculator.calculateIntervention(
        attacker,
        defender,
        provincesMap,
        guarantorNation,
      );

    const defAirDefense = nativeDefAirDefense + guarantorResult.auxAD;
    const defAirForce = nativeDefAirForce + guarantorResult.auxAir;
    const defArmor = nativeDefArmor + guarantorResult.auxArm;
    const defInfantry = nativeDefInfantry + guarantorResult.auxInf;

    const guarantorTechMult = guarantorNation
      ? MilitaryPowerCalculator.calculateTechMultiplier(
          guarantorNation.military.techLevel,
        )
      : nativeDefMults.airDefense;

    const blendMultiplier = (
      nativeCount: number,
      nativeMult: number,
      auxCount: number,
      auxMult: number,
    ): number => {
      const total = nativeCount + auxCount;
      if (total <= 0) return nativeMult;
      return (nativeCount * nativeMult + auxCount * auxMult) / total;
    };

    const defMults = {
      infantry: blendMultiplier(
        nativeDefInfantry,
        nativeDefMults.infantry,
        guarantorResult.auxInf,
        guarantorTechMult,
      ),
      armor: blendMultiplier(
        nativeDefArmor,
        nativeDefMults.armor,
        guarantorResult.auxArm,
        guarantorTechMult,
      ),
      airDefense: blendMultiplier(
        nativeDefAirDefense,
        nativeDefMults.airDefense,
        guarantorResult.auxAD,
        guarantorTechMult,
      ),
      airForce: blendMultiplier(
        nativeDefAirForce,
        nativeDefMults.airForce,
        guarantorResult.auxAir,
        guarantorTechMult,
      ),
      droneMissile: nativeDefMults.droneMissile,
    };

    return {
      defAirDefense,
      defAirForce,
      defArmor,
      defInfantry,
      defMults,
      auxiliaryGuarantor: guarantorResult.auxiliaryGuarantor,
    };
  }
}
