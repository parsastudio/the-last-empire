import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import {
  EspionageOutcome,
  EspionageReconData,
} from "@/domain/espionage/espionage.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationGettersUtility } from "@geopolitics/domain";

export class ReconTierExecutor {
  public static execute(
    target: Nation,
    outcome: EspionageOutcome,
    provincesMap?: Record<string, Province>,
  ): { reconData: EspionageReconData; message: string } {
    const targetGdp = getNationGdp(target, provincesMap);
    const ownedCount = NationGettersUtility.getOwnedProvinces(
      target.id,
      provincesMap,
    ).length;

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
    };

    let message = "";
    if (outcome === "CLEAN_SUCCESS") {
      message = `شنود ماهواره‌ای کامل با موفقیت انجام شد. تمام مختصات نظامی و خزانه‌داری ${target.name} بدون هیچ ردیابی آشکار گردید.`;
    } else if (outcome === "COMPROMISED_SUCCESS") {
      message = `شنود ماهواره‌ای موفق بود اما فرکانس نفوذ رصد شد (-۱۵ دیدگاه با ${target.name}).`;
    } else {
      message = `شبکه ضدجاسوسی ${target.name} سیگنال‌های شنود را مختل کرد و عملیات شناسایی ناکام ماند.`;
    }

    return { reconData, message };
  }
}
