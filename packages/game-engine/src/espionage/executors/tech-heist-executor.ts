import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import {
  EspionageOutcome,
  EspionageTechTheftData,
} from "@/domain/espionage/espionage.schema";
import {
  EspionageCalculator,
  TechSuperiorityDelta,
} from "@/engine/espionage/espionage-calculator";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";

export class TechHeistExecutor {
  public static execute(
    source: Nation,
    target: Nation,
    superiority: TechSuperiorityDelta,
    isSuccess: boolean,
    outcome: EspionageOutcome,
    provincesMap: Record<string, Province>,
  ): {
    updatedSource: Nation;
    updatedTarget: Nation;
    updatedProvinces: Record<string, Province>;
    techTheftData?: EspionageTechTheftData;
    message: string;
  } {
    const updatedProvinces: Record<string, Province> = { ...provincesMap };

    if (
      !isSuccess ||
      superiority.totalAvailablePoints <
        EspionageCalculator.MIN_TECH_DELTA_FOR_HEIST
    ) {
      return {
        updatedSource: source,
        updatedTarget: target,
        updatedProvinces,
        message: `نفوذ به سرورهای محرمانه ${target.name} شکست خورد و کدهای نفوذی مسدود شدند (-۱۰ اعتبار جهانی).`,
      };
    }

    const gMil = EspionageCalculator.TECH_HEIST_GAIN;
    const newTechLevel = Number((source.military.techLevel + gMil).toFixed(1));

    const updatedMilitary = MilitaryInventoryHelper.syncBranchTechOnUpgrade(
      source.military,
      newTechLevel,
    );

    const updatedSource: Nation = {
      ...source,
      military: updatedMilitary,
    };

    const techTheftData: EspionageTechTheftData = {
      militaryTechGained: gMil,
      industrialLevelGained: 0,
      totalPointsGained: gMil,
    };

    const message =
      outcome === "CLEAN_SUCCESS"
        ? `سرقت فناوری با موفقیت انجام شد! دانشمندان شما موفق شدند ۰.۵ سطح فناوری نظامی از کشور ${target.name} استخراج و بومی‌سازی کنند.`
        : `سرقت فناوری (۰.۵ سطح نظامی) موفق بود اما سازمان اطلاعات ${target.name} منشأ نفوذ را شناسایی کرد (-۲۵ همسویی هدف، -۱۰ اعتبار جهانی).`;

    return {
      updatedSource,
      updatedTarget: target,
      updatedProvinces,
      techTheftData,
      message,
    };
  }
}
