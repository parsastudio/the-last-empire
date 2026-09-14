import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { EspionageReconData } from "@/domain/espionage/espionage.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import {
  NationGettersUtility,
  GuarantorBudgetCalculatorUtility,
} from "@geopolitics/domain";

export class ReconTierExecutor {
  public static execute(
    target: Nation,
    provincesMap?: Record<string, Province>,
    allNations?: Record<string, Nation>,
  ): { reconData: EspionageReconData; message: string } {
    const targetGdp = getNationGdp(target, provincesMap);
    const ownedCount = NationGettersUtility.getOwnedProvinces(
      target.id,
      provincesMap,
    ).length;

    let guarantorNationId: string | undefined = undefined;
    let guarantorName: string | undefined = undefined;
    let guarantorFlagCode: string | undefined = undefined;
    let guarantorTechLevel: number | undefined = undefined;
    let guarantorAuxiliaryValuation: number | undefined = undefined;

    if (
      target.securityGuarantorId &&
      target.isEmergencyProtectorate &&
      allNations
    ) {
      const guarantor = NationGettersUtility.resolveNation(
        target.securityGuarantorId,
        allNations,
      );
      if (guarantor && guarantor.isAlive) {
        const guarantorGdp = getNationGdp(guarantor, provincesMap);
        guarantorNationId = guarantor.id;
        guarantorName = guarantor.id;
        guarantorFlagCode = guarantor.flagCode;
        guarantorTechLevel = guarantor.military.techLevel;
        guarantorAuxiliaryValuation =
          GuarantorBudgetCalculatorUtility.calculateBudget(
            targetGdp,
            guarantorGdp,
            true,
          );
      }
    } else if (allNations) {
      const liveGuarantors = NationGettersUtility.getLiveDefenseGuarantors(
        target,
        allNations,
      );
      if (liveGuarantors.length > 0) {
        let maxTech = 1.0;
        let primary = liveGuarantors[0]!;

        for (let i = 0; i < liveGuarantors.length; i++) {
          const g = liveGuarantors[i]!;
          if (g.military.techLevel > maxTech) {
            maxTech = g.military.techLevel;
            primary = g;
          }
        }

        guarantorNationId = primary.id;
        guarantorName = liveGuarantors.map((g) => g.id).join(" - ");
        guarantorFlagCode = primary.flagCode;
        guarantorTechLevel = maxTech;
        guarantorAuxiliaryValuation = 0;
      }
    }

    const reconData: EspionageReconData = {
      infantry: target.military.infantry,
      armor: target.military.armor || 0,
      airDefense: target.military.airDefense || 0,
      airForce: target.military.airForce,
      droneMissile: target.military.droneMissile,
      techLevel: target.military.techLevel,
      industrialLevel: target.industrialLevel,
      treasury: target.treasury,
      gdp: targetGdp,
      stability: target.government.stability,
      activeProvincesCount: ownedCount || 1,
      guarantorNationId,
      guarantorName,
      guarantorFlagCode,
      guarantorTechLevel,
      guarantorAuxiliaryValuation,
    };

    return { reconData, message: "RECON_OPERATION_SUCCESS" };
  }
}
