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
    _outcome: EspionageOutcome,
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
        message: `نفوذ به سرورهای محرمانه ${target.name} شکست خورد و ردپای هکرها شناسایی گردید (-۷۵ همسویی، -۱۰ اعتبار جهانی).`,
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

    const message = `سرقت فوق‌محرمانه فناوری با موفقیت کامل و بدون ردپا انجام شد! دانشمندان شما ۰.۵ سطح فناوری نظامی از ${target.name} استخراج و بومی‌سازی کردند.`;

    return {
      updatedSource,
      updatedTarget: target,
      updatedProvinces,
      techTheftData,
      message,
    };
  }
}
