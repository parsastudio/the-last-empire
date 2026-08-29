import { Nation } from "@/domain/nation/nation.schema";
import { EspionageTechTheftData } from "@/domain/espionage/espionage.schema";
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
  ): {
    updatedSource: Nation;
    updatedTarget: Nation;
    techTheftData?: EspionageTechTheftData;
    message: string;
  } {
    if (
      !isSuccess ||
      superiority.totalAvailablePoints <
        EspionageCalculator.MIN_TECH_DELTA_FOR_HEIST
    ) {
      return {
        updatedSource: source,
        updatedTarget: target,
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
      totalPointsGained: gMil,
    };

    const message = `سرقت فوق‌محرمانه فناوری با موفقیت کامل و بدون ردپا انجام شد! دانشمندان شما ۰.۵ سطح فناوری نظامی از ${target.name} استخراج و بومی‌سازی کردند.`;

    return {
      updatedSource,
      updatedTarget: target,
      techTheftData,
      message,
    };
  }
}
