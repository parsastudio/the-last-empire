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
        message: `نفوذ به سرورهای محرمانه ${target.id} شکست خورد و ردپای هکرها شناسایی گردید (-۷۵ همسویی، -۱۰ اعتبار جهانی).`,
      };
    }

    const milGain = superiority.militaryGain;
    const indGain = superiority.industrialGain;

    let updatedMilitary = source.military;
    if (milGain > 0) {
      const newMilTech = Number(
        (source.military.techLevel + milGain).toFixed(1),
      );
      updatedMilitary = MilitaryInventoryHelper.syncBranchTechOnUpgrade(
        source.military,
        newMilTech,
      );
    }

    let updatedIndustrialLevel = source.industrialLevel;
    if (indGain > 0) {
      updatedIndustrialLevel = Number(
        (source.industrialLevel + indGain).toFixed(1),
      );
    }

    const updatedSource: Nation = {
      ...source,
      military: updatedMilitary,
      industrialLevel: updatedIndustrialLevel,
    };

    const techTheftData: EspionageTechTheftData = {
      militaryTechGained: milGain,
      industrialTechGained: indGain,
      totalPointsGained: superiority.totalAvailablePoints,
    };

    let message = "";
    if (superiority.heistMode === "DUAL") {
      message = `سرقت فوق‌محرمانه با موفقیت ۱۰۰٪ و بدون ردپا انجام شد! دانشمندان شما ۰.۵ لول فناوری نظامی و ۰.۵ لول دانش صنعتی (R&D) از ${target.id} استخراج و بومی‌سازی کردند.`;
    } else if (superiority.heistMode === "MILITARY_ONLY") {
      message = `سرقت فوق‌محرمانه با موفقیت انجام شد! ${milGain} لول فناوری نظامی و رمزنگاری پیشرفته از زرادخانه ${target.id} استخراج و به ارتش کشور اضافه گردید.`;
    } else {
      message = `سرقت فوق‌محرمانه با موفقیت انجام شد! ${indGain} لول فناوری صنعتی و نقشه‌های مهندسی ساخت خطوط تولید از ${target.id} استخراج شد.`;
    }

    return {
      updatedSource,
      updatedTarget: target,
      techTheftData,
      message,
    };
  }
}
