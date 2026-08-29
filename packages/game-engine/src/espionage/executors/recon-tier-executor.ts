import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { EspionageReconData } from "@/domain/espionage/espionage.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationGettersUtility, CountryRegistry } from "@geopolitics/domain";

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

    if (target.securityGuarantorId && allNations) {
      const gCanonical = CountryRegistry.resolveCanonicalId(
        target.securityGuarantorId,
      );
      const guarantor =
        allNations[gCanonical] || allNations[target.securityGuarantorId];
      if (guarantor && guarantor.isAlive) {
        guarantorNationId = guarantor.id;
        guarantorName = guarantor.name;
        guarantorFlagCode = guarantor.flagCode;
        guarantorTechLevel = guarantor.military.techLevel;
        guarantorAuxiliaryValuation = Math.floor(targetGdp * 0.3);
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

    const message = `شنود ماهواره‌ای کامل با موفقیت ۱۰۰٪ انجام شد. تمام مختصات نظامی و خزانه‌داری ${target.name} بدون هیچ ردیابی آشکار گردید.`;

    return { reconData, message };
  }
}
